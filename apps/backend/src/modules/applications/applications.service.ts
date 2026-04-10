import {
  buildCandidateIntelligenceReport,
  evaluateInterview,
  generateInterviewQuestions,
  scoreCandidate,
  type StructuredJobDescriptionAnalysis,
  type StructuredResumeAnalysis
} from "@ai-hiring/ai-services";
import type { CreateApplicationInput, QualificationAnswers } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { candidateInsightsRepository } from "../candidate-insights/candidate-insights.repository";
import { candidatesRepository } from "../candidates/candidates.repository";
import { interviewEvaluationsRepository } from "../interview-sessions/interview-evaluations.repository";
import { interviewSessionsRepository } from "../interview-sessions/interview-sessions.repository";
import { jobsRepository } from "../jobs/jobs.repository";
import { screeningResultsRepository } from "../screening-results/screening-results.repository";
import { candidateScoresRepository } from "./candidate-scores.repository";
import { semanticScreeningService } from "./semantic-screening.service";
import { applicationsRepository } from "./applications.repository";

export class ApplicationsService {
  async listApplications() {
    return applicationsRepository.list();
  }

  async getApplication(applicationId: string) {
    const application = await applicationsRepository.findById(applicationId);

    if (!application) {
      throw new ApiError(404, "Application not found");
    }

    return application;
  }

  async createApplication(input: CreateApplicationInput) {
    return applicationsRepository.create(input);
  }

  async screenResume(applicationId: string) {
    const application = await this.getApplication(applicationId);
    const candidate = await candidatesRepository.findById(application.candidateId);
    const job = await jobsRepository.findById(application.jobId);

    if (!candidate || !job) {
      throw new ApiError(404, "Related candidate or job not found");
    }

    const result = await semanticScreeningService.screenApplication({
      applicationId,
      candidateId: candidate.id,
      job,
      resumeText: candidate.resumeText ?? ""
    });

    const updatedApplication = await applicationsRepository.updateScreening(
      applicationId,
      result.finalScore,
      result.reasoningSummary ?? "Semantic resume screening completed."
    );

    const candidateScore = await candidateScoresRepository.upsert(
      this.buildCandidateScorePayload({
        applicationId,
        candidateId: candidate.id,
        jobId: job.id,
        jobTitle: job.title,
        resumeText: candidate.resumeText ?? "",
        screening: result
      })
    );

    await candidateInsightsRepository.upsert({
      candidateId: candidate.id,
      latestApplicationId: applicationId,
      resumeAnalysis: (result.resumeAnalysis as Record<string, unknown> | undefined) ?? {},
      linkedinInsights: {
        linkedinUrl: candidate.linkedinUrl
      },
      interviewTranscript: null,
      evaluationScores: {
        candidateScore
      },
      claimVerificationFlags: [],
      suggestedManagerQuestions: [],
      hiringRecommendation: null
    });

    return updatedApplication;
  }

  async evaluateQualification(applicationId: string, answers: QualificationAnswers) {
    const application = await this.getApplication(applicationId);
    const job = await jobsRepository.findById(application.jobId);

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    const withinSalary =
      !job.salaryMax || answers.expectedSalary <= job.salaryMax;
    const relocationOk = !job.relocationRequired || answers.relocationWillingness;
    const timelineOk = !job.joiningTimeline || answers.joiningTimeline.length > 0;
    const passed = withinSalary && relocationOk && timelineOk;

    return applicationsRepository.updateQualification(applicationId, answers, passed);
  }

  async startInterview(applicationId: string) {
    const application = await this.getApplication(applicationId);
    const candidate = await candidatesRepository.findById(application.candidateId);
    const job = await jobsRepository.findById(application.jobId);
    const screening = await screeningResultsRepository.findByApplicationId(applicationId);

    if (!candidate || !job) {
      throw new ApiError(404, "Related candidate or job not found");
    }

    const questions = await this.buildInterviewQuestions({
      jobTitle: job.title,
      jobDescription: job.approvedDescription ?? job.generatedDescription,
      resumeSummary: candidate.resumeText ?? candidate.currentCompany ?? "",
      resumeAnalysis:
        (screening?.resumeAnalysis as StructuredResumeAnalysis | undefined) ?? undefined,
      jobAnalysis:
        (screening?.jobAnalysis as StructuredJobDescriptionAnalysis | undefined) ?? undefined,
      strengths: screening?.strengths ?? [],
      weaknesses: screening?.weaknesses ?? []
    });

    await applicationsRepository.updateStatus(applicationId, "INTERVIEW_PENDING");
    return interviewSessionsRepository.create(applicationId, questions);
  }

  private async buildInterviewQuestions(input: {
    jobTitle: string;
    jobDescription: string;
    resumeSummary: string;
    resumeAnalysis?: StructuredResumeAnalysis;
    jobAnalysis?: StructuredJobDescriptionAnalysis;
    strengths: string[];
    weaknesses: string[];
  }) {
    try {
      return await generateInterviewQuestions({
        jobTitle: input.jobTitle,
        jobDescription: input.jobDescription,
        resumeSummary: input.resumeSummary,
        resumeAnalysis: input.resumeAnalysis,
        jobAnalysis: input.jobAnalysis,
        screening: {
          strengths: input.strengths,
          weaknesses: input.weaknesses
        }
      });
    } catch {
      return this.buildFallbackInterviewQuestions(input);
    }
  }

  private buildFallbackInterviewQuestions(input: {
    jobTitle: string;
    resumeSummary: string;
    strengths: string[];
    weaknesses: string[];
  }) {
    const firstStrength = input.strengths[0] ?? `your fit for the ${input.jobTitle} role`;
    const firstWeakness = input.weaknesses[0] ?? `one area where you had to stretch beyond your comfort zone`;
    const resumeSignal = this.extractResumeSignal(input.resumeSummary);

    return [
      `Your resume suggests strength around ${firstStrength}. Which project best proves that, and what result did you personally drive?`,
      `Tell me about a time you handled ${firstWeakness} and how you closed the gap.`,
      `For this ${input.jobTitle} role, how would you approach the first 30 days on the job?`,
      `Walk me through a difficult stakeholder or customer situation you handled and the outcome you achieved.`,
      `I noticed ${resumeSignal}. What decisions did you make personally, and how did you measure success?`
    ];
  }

  private extractResumeSignal(resumeSummary: string) {
    const normalized = resumeSummary.replace(/\s+/g, " ").trim();
    if (!normalized) {
      return "relevant operational or business experience in your background";
    }

    return normalized.slice(0, 140);
  }

  async shortlist(applicationId: string) {
    return applicationsRepository.updateStatus(applicationId, "SHORTLISTED");
  }

  async reject(applicationId: string) {
    return applicationsRepository.updateStatus(applicationId, "REJECTED");
  }

  async finalizeInterviewIntelligence(
    sessionId: string,
    applicationId: string,
    qaPairs: Array<{ question: string; answer: string }>
  ) {
    const application = await this.getApplication(applicationId);
    const evaluation = await evaluateInterview({ questions: qaPairs });
    const candidate = await candidatesRepository.findById(application.candidateId);
    const job = await jobsRepository.findById(application.jobId);
    const screening = await screeningResultsRepository.findByApplicationId(applicationId);
    const session = await interviewSessionsRepository.findByApplicationId(applicationId);

    if (!candidate || !job || !screening || !session) {
      throw new ApiError(404, "Candidate, job, screening, or interview session not found");
    }

    const resumeAnalysis =
      (screening?.resumeAnalysis as Record<string, unknown> | undefined) ?? {
        summary: "Semantic resume screening completed."
      };
    const linkedinInsights = {
      linkedinUrl: candidate.linkedinUrl
    };
    const persistedEvaluations = await interviewEvaluationsRepository.replaceForSession({
      sessionId,
      items: qaPairs.map((item, index) => ({
        question: item.question,
        answer: item.answer,
        score: evaluation.answerEvaluations[index]?.score ?? 0,
        rationale:
          evaluation.answerEvaluations[index]?.rationale ??
          "Interview answer evaluated without a detailed rationale.",
        evidence: evaluation.answerEvaluations[index]?.evidence ?? []
      }))
    });

    const candidateScore = await candidateScoresRepository.upsert(
      this.buildCandidateScorePayload({
        applicationId,
        candidateId: candidate.id,
        jobId: job.id,
        jobTitle: job.title,
        resumeText: candidate.resumeText ?? "",
        screening,
        interview: {
          communicationScore: evaluation.communicationScore,
          knowledgeScore: evaluation.knowledgeScore,
          confidenceScore: evaluation.confidenceScore,
          overallScore: evaluation.overallScore,
          summary: evaluation.summary,
          answerEvaluations: persistedEvaluations.map((item, index) => ({
            questionId: evaluation.answerEvaluations[index]?.questionId ?? `q_${index + 1}`,
            score: item.score,
            rationale: item.rationale,
            evidence: item.evidence
          })),
          questionAnswerPairs: qaPairs.map((item, index) => ({
            questionId: evaluation.answerEvaluations[index]?.questionId ?? `q_${index + 1}`,
            question: item.question,
            answer: item.answer
          }))
        }
      })
    );

    const intelligenceReport = await buildCandidateIntelligenceReport({
      resumeAnalysis,
      linkedinInsights,
      interviewSummary: evaluation.summary,
      scores: {
        overall: evaluation.overallScore,
        candidateScore: candidateScore.finalScore,
        confidence: candidateScore.confidenceScore
      }
    });

    await candidateInsightsRepository.upsert({
      candidateId: candidate.id,
      latestApplicationId: applicationId,
      resumeAnalysis,
      linkedinInsights,
      interviewTranscript: qaPairs.map((item) => `${item.question}\n${item.answer}`).join("\n\n"),
      evaluationScores: {
        interview: evaluation,
        candidateScore
      },
      claimVerificationFlags: evaluation.claimVerificationFlags,
      suggestedManagerQuestions: evaluation.suggestedManagerQuestions,
      hiringRecommendation:
        candidateScore.recommendation === "advance"
          ? intelligenceReport.recommendation
          : candidateScore.recommendation === "hold"
            ? "Hold for structured human review."
            : "Do not advance automatically."
    });

    await applicationsRepository.updateStatus(
      applicationId,
      "INTERVIEW_COMPLETED",
      evaluation.overallScore
    );

    return evaluation;
  }

  private buildCandidateScorePayload(input: {
    applicationId: string;
    candidateId: string;
    jobId: string;
    jobTitle: string;
    resumeText: string;
    screening: {
      semanticSimilarity: number;
      experienceMatch: number;
      skillsMatch: number;
      domainMatch: number;
      achievementsMatch: number;
      finalScore: number;
      resumeAnalysis?: Record<string, unknown>;
      jobAnalysis?: Record<string, unknown>;
      reasoningSummary?: string | null;
      strengths?: string[];
      weaknesses?: string[];
    };
    interview?: {
      communicationScore: number;
      knowledgeScore: number;
      confidenceScore: number;
      overallScore: number;
      summary: string;
      answerEvaluations: Array<{
        questionId: string;
        score: number;
        rationale: string;
        evidence: string[];
      }>;
      questionAnswerPairs: Array<{
        questionId: string;
        question: string;
        answer: string;
      }>;
    };
  }) {
    const scoring = scoreCandidate({
      applicationId: input.applicationId,
      candidateId: input.candidateId,
      jobId: input.jobId,
      jobTitle: input.jobTitle,
      structuredResumeAnalysis: input.screening.resumeAnalysis as StructuredResumeAnalysis,
      structuredJobAnalysis: input.screening.jobAnalysis as StructuredJobDescriptionAnalysis,
      screening: {
        semanticSimilarity: input.screening.semanticSimilarity,
        experienceMatch: input.screening.experienceMatch,
        skillsMatch: input.screening.skillsMatch,
        domainMatch: input.screening.domainMatch,
        achievementsMatch: input.screening.achievementsMatch,
        finalScore: input.screening.finalScore,
        strengths: input.screening.strengths ?? [],
        weaknesses: input.screening.weaknesses ?? [],
        reasoningSummary: input.screening.reasoningSummary ?? null
      },
      interview: input.interview,
      resumeText: input.resumeText
    });

    return {
      applicationId: input.applicationId,
      candidateId: input.candidateId,
      jobId: input.jobId,
      roleCapability: scoring.roleCapability.score,
      thinkingBehavior: scoring.thinkingBehavior.score,
      impact: scoring.impact.score,
      transferability: scoring.transferability.score,
      potential: scoring.potential.score,
      finalScore: scoring.finalScore,
      confidenceScore: scoring.confidenceScore,
      confidenceLabel: scoring.confidenceLabel,
      summary: scoring.summary,
      recommendation: scoring.recommendation,
      componentBreakdown: {
        roleCapability: scoring.roleCapability,
        thinkingBehavior: scoring.thinkingBehavior,
        impact: scoring.impact,
        transferability: scoring.transferability,
        potential: scoring.potential
      },
      evidenceSummary: scoring.evidenceSummary
    };
  }
}

export const applicationsService = new ApplicationsService();
