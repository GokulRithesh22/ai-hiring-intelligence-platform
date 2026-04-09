import {
  buildCandidateIntelligenceReport,
  evaluateInterview,
  generateInterviewQuestions,
  screenResume
} from "@ai-hiring/ai-services";
import type { CreateApplicationInput, QualificationAnswers } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { candidateInsightsRepository } from "../candidate-insights/candidate-insights.repository";
import { candidatesRepository } from "../candidates/candidates.repository";
import { interviewSessionsRepository } from "../interview-sessions/interview-sessions.repository";
import { jobsRepository } from "../jobs/jobs.repository";
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

    const result = await screenResume({
      jobDescription: job.approvedDescription ?? job.generatedDescription,
      resumeText: candidate.resumeText ?? "",
      linkedinUrl: candidate.linkedinUrl ?? undefined
    });

    return applicationsRepository.updateScreening(applicationId, result.matchScore, result.explanation);
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

    if (!candidate || !job) {
      throw new ApiError(404, "Related candidate or job not found");
    }

    const questions = await generateInterviewQuestions({
      jobTitle: job.title,
      jobDescription: job.approvedDescription ?? job.generatedDescription,
      resumeSummary: candidate.resumeText ?? candidate.currentCompany ?? ""
    });

    return interviewSessionsRepository.create(applicationId, questions);
  }

  async shortlist(applicationId: string) {
    return applicationsRepository.updateStatus(applicationId, "SHORTLISTED");
  }

  async reject(applicationId: string) {
    return applicationsRepository.updateStatus(applicationId, "REJECTED");
  }

  async finalizeInterviewIntelligence(
    applicationId: string,
    qaPairs: Array<{ question: string; answer: string }>
  ) {
    const application = await this.getApplication(applicationId);
    const evaluation = await evaluateInterview({ questions: qaPairs });
    const candidate = await candidatesRepository.findById(application.candidateId);

    if (!candidate) {
      throw new ApiError(404, "Candidate not found");
    }

    await candidateInsightsRepository.upsert({
      candidateId: candidate.id,
      latestApplicationId: applicationId,
      resumeAnalysis: {
        summary: "Resume aligned with job keywords and career progression."
      },
      linkedinInsights: {
        linkedinUrl: candidate.linkedinUrl
      },
      interviewTranscript: qaPairs.map((item) => `${item.question}\n${item.answer}`).join("\n\n"),
      evaluationScores: evaluation,
      claimVerificationFlags: evaluation.claimVerificationFlags,
      suggestedManagerQuestions: evaluation.suggestedManagerQuestions,
      hiringRecommendation: (
        await buildCandidateIntelligenceReport({
          resumeAnalysis: { summary: "Resume aligned with job scope" },
          linkedinInsights: { linkedinUrl: candidate.linkedinUrl },
          interviewSummary: evaluation.summary,
          scores: { overall: evaluation.overallScore }
        })
      ).recommendation
    });

    await applicationsRepository.updateStatus(
      applicationId,
      "INTERVIEW_COMPLETED",
      evaluation.overallScore
    );

    return evaluation;
  }
}

export const applicationsService = new ApplicationsService();
