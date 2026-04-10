import type { Job } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { applicationsService } from "../applications/applications.service";
import { semanticScreeningService } from "../applications/semantic-screening.service";
import { candidateInsightsRepository } from "../candidate-insights/candidate-insights.repository";
import { candidatesService } from "../candidates/candidates.service";
import { jobsRepository } from "../jobs/jobs.repository";

type QualificationGateResult = {
  passed: boolean;
  reasons: string[];
};

export class PublicJobsService {
  async listJobs() {
    return jobsRepository.listPublic();
  }

  async getJob(jobId: string) {
    return this.resolveJob(jobId);
  }

  async apply(jobId: string, payload: {
    fullName: string;
    email: string;
    linkedinUrl?: string | null;
    resumeText: string;
    resumeFileName?: string | null;
    expectedCtc: number;
    earliestJoiningDate: string;
    relocation?: string | null;
    phone?: string | null;
  }) {
    const job = await this.resolveJob(jobId);
    const candidate = await candidatesService.createCandidate({
      fullName: payload.fullName,
      email: payload.email,
      linkedinUrl: payload.linkedinUrl ?? null,
      resumeFileUrl: payload.resumeFileName ? `upload://${payload.resumeFileName}` : null,
      resumeText: payload.resumeText,
      phone: payload.phone ?? null,
      source: "CAREERS_PAGE",
      permanentProfile: {
        linkedinUrl: payload.linkedinUrl ?? null,
        latestResumeFileName: payload.resumeFileName ?? null
      }
    });

    const application = await applicationsService.createApplication({
      candidateId: candidate.id,
      jobId: job.id,
      resumeUrl: payload.resumeFileName ? `upload://${payload.resumeFileName}` : null,
      expectedCtc: payload.expectedCtc,
      joiningDate: payload.earliestJoiningDate
    });

    const screening = await semanticScreeningService.screenApplication({
      applicationId: application.id,
      candidateId: candidate.id,
      job,
      resumeText: payload.resumeText
    });

    await candidatesService.createCandidate({
      fullName: payload.fullName,
      email: payload.email,
      linkedinUrl: payload.linkedinUrl ?? null,
      resumeFileUrl: payload.resumeFileName ? `upload://${payload.resumeFileName}` : null,
      resumeText: payload.resumeText,
      phone: payload.phone ?? null,
      totalExperienceYears:
        typeof screening.resumeAnalysis.experienceYears === "number"
          ? screening.resumeAnalysis.experienceYears
          : null,
      source: "CAREERS_PAGE",
      permanentProfile: {
        linkedinUrl: payload.linkedinUrl ?? null,
        latestResumeFileName: payload.resumeFileName ?? null,
        structuredResumeAnalysis: screening.resumeAnalysis
      }
    });

    const gate = this.evaluateQualificationGate({
      screening,
      expectedCtc: payload.expectedCtc,
      earliestJoiningDate: payload.earliestJoiningDate,
      relocation: payload.relocation ?? null,
      job
    });
    const qualificationPassed = gate.passed;
    const decisionReason = [screening.reasoningSummary, ...gate.reasons]
      .filter(Boolean)
      .join(" ");

    const updatedApplication = await applicationsService.createApplication({
      candidateId: candidate.id,
      jobId: job.id,
      resumeUrl: payload.resumeFileName ? `upload://${payload.resumeFileName}` : null,
      expectedCtc: payload.expectedCtc,
      joiningDate: payload.earliestJoiningDate,
      resumeMatchScore: screening.finalScore,
      qualificationPassed,
      qualificationAnswers: {
        joiningTimeline: payload.earliestJoiningDate,
        expectedSalary: payload.expectedCtc,
        currency: job.currency ?? "INR",
        relocationWillingness: payload.relocation?.toLowerCase() !== "declined"
      },
      screeningDecisionReason: decisionReason
    });

    await candidateInsightsRepository.upsert({
      candidateId: candidate.id,
      latestApplicationId: updatedApplication.id,
      resumeAnalysis: screening.resumeAnalysis as Record<string, unknown>,
      linkedinInsights: {
        linkedinUrl: payload.linkedinUrl ?? null
      },
      interviewTranscript: null,
      evaluationScores: {
        semanticSimilarity: screening.semanticSimilarity,
        experienceMatch: screening.experienceMatch,
        skillsMatch: screening.skillsMatch,
        domainMatch: screening.domainMatch,
        achievementsMatch: screening.achievementsMatch,
        finalScore: screening.finalScore
      },
      claimVerificationFlags: [],
      suggestedManagerQuestions: [],
      hiringRecommendation: qualificationPassed
        ? "Qualified for AI interview based on semantic resume screening."
        : `Interview not unlocked. ${gate.reasons.join(" ")}`
    });

    if (!qualificationPassed) {
      return {
        applicationId: updatedApplication.id,
        candidateId: candidate.id,
        status: "rejected" as const,
        statusMessage: "We have received your application.",
        interviewInvitation: null,
        interviewQuestions: []
      };
    }

    let interviewSessionId: string | null = null;
    let interviewQuestions: string[] = [];

    try {
      const interviewSession = await applicationsService.startInterview(updatedApplication.id);
      interviewSessionId = interviewSession?.id ?? null;
      interviewQuestions = (interviewSession?.items ?? []).map((item) => item.question);
    } catch {
      interviewQuestions = buildPublicFallbackInterviewQuestions({
        jobTitle: job.title,
        resumeText: payload.resumeText,
        strengths: screening.strengths ?? [],
        weaknesses: screening.weaknesses ?? []
      });
    }

    return {
      applicationId: updatedApplication.id,
      candidateId: candidate.id,
      status: "qualified" as const,
      statusMessage:
        "Application submitted successfully. You are eligible to continue to the AI interview.",
      interviewInvitation:
        "You qualified for the AI interview based on semantic resume screening and business rule checks.",
      interviewSessionId,
      interviewQuestions
    };
  }

  private async resolveJob(jobIdentifier: string) {
    const jobs = await jobsRepository.list();
    const job = jobs.find(
      (item) => item.id === jobIdentifier || slugify(item.title) === jobIdentifier
    );

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }

  private evaluateQualificationGate(input: {
    screening: {
      finalScore: number;
      semanticSimilarity: number;
    };
    expectedCtc: number;
    earliestJoiningDate: string;
    relocation: string | null;
    job: Job;
  }): QualificationGateResult {
    const reasons: string[] = [];
    const finalScoreOk = input.screening.finalScore >= 70;
    const similarityOk = input.screening.semanticSimilarity >= 70;
    const salaryOk = input.job.salaryMax == null || input.expectedCtc <= input.job.salaryMax;
    const joiningDeadlineDays = parseJoiningTimelineDays(input.job.joiningTimeline);
    const daysUntilJoining = differenceInDays(input.earliestJoiningDate);
    const joiningOk = joiningDeadlineDays == null || daysUntilJoining <= joiningDeadlineDays;
    const relocationOk =
      !input.job.relocationRequired || input.relocation?.toLowerCase() !== "declined";

    if (!finalScoreOk) {
      reasons.push("Resume-to-job match is below the required 70% threshold.");
    }

    if (!similarityOk) {
      reasons.push("Semantic alignment with the job description is below the required threshold.");
    }

    if (!salaryOk) {
      reasons.push("Expected CTC is outside the approved budget for this role.");
    }

    if (!joiningOk) {
      reasons.push("Joining availability is later than the approved hiring window.");
    }

    if (!relocationOk) {
      reasons.push("This role requires relocation or location availability that is not currently met.");
    }

    return {
      passed: finalScoreOk && similarityOk && salaryOk && joiningOk && relocationOk,
      reasons
    };
  }
}

export const publicJobsService = new PublicJobsService();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseJoiningTimelineDays(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d{1,3})/);
  return match ? Number(match[1]) : null;
}

function differenceInDays(dateString: string): number {
  const target = new Date(dateString);
  if (Number.isNaN(target.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const milliseconds = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(milliseconds / (1000 * 60 * 60 * 24)));
}

function buildPublicFallbackInterviewQuestions(input: {
  jobTitle: string;
  resumeText: string;
  strengths: string[];
  weaknesses: string[];
}) {
  const firstStrength = input.strengths[0] ?? `your fit for the ${input.jobTitle} role`;
  const firstWeakness =
    input.weaknesses[0] ?? "one area where you had to adapt or learn quickly";
  const resumeSignal = input.resumeText.replace(/\s+/g, " ").trim().slice(0, 140);

  return [
    `Your resume suggests strength around ${firstStrength}. Which project best proves that, and what result did you personally drive?`,
    `Tell me about a time you handled ${firstWeakness} and how you closed the gap.`,
    `For this ${input.jobTitle} role, how would you approach the first 30 days on the job?`,
    `Walk me through a difficult stakeholder or customer situation you handled and the outcome you achieved.`,
    `I noticed ${resumeSignal || "relevant operational experience in your background"}. What decisions did you make personally, and how did you measure success?`
  ];
}
