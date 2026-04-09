import type { Job } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { applicationsService } from "../applications/applications.service";
import { semanticScreeningService } from "../applications/semantic-screening.service";
import { candidateInsightsRepository } from "../candidate-insights/candidate-insights.repository";
import { candidatesService } from "../candidates/candidates.service";
import { jobsRepository } from "../jobs/jobs.repository";

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

    const qualificationPassed = this.passesBusinessRules({
      finalScore: screening.finalScore,
      expectedCtc: payload.expectedCtc,
      earliestJoiningDate: payload.earliestJoiningDate,
      job
    });

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
      screeningDecisionReason: screening.reasoningSummary
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
        : "Stored for future review after semantic resume screening."
    });

    if (!qualificationPassed) {
      return {
        applicationId: updatedApplication.id,
        candidateId: candidate.id,
        status: "rejected" as const,
        statusMessage:
          "Application submitted successfully. Our team will review your profile and reach out if there is a fit.",
        interviewInvitation: null,
        interviewQuestions: []
      };
    }

    const interviewSession = await applicationsService.startInterview(updatedApplication.id);

    return {
      applicationId: updatedApplication.id,
      candidateId: candidate.id,
      status: "qualified" as const,
      statusMessage:
        "Application submitted successfully. You are eligible to continue to the AI interview.",
      interviewInvitation:
        "You qualified for the AI interview based on semantic resume screening and business rule checks.",
      interviewSessionId: interviewSession?.id ?? null,
      interviewQuestions: (interviewSession?.items ?? []).map((item) => item.question)
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

  private passesBusinessRules(input: {
    finalScore: number;
    expectedCtc: number;
    earliestJoiningDate: string;
    job: Job;
  }) {
    const salaryOk = !input.job.salaryMax || input.expectedCtc <= input.job.salaryMax;
    const joiningDeadlineDays = parseJoiningTimelineDays(input.job.joiningTimeline);
    const daysUntilJoining = differenceInDays(input.earliestJoiningDate);
    const joiningOk = joiningDeadlineDays == null || daysUntilJoining <= joiningDeadlineDays;

    return input.finalScore >= 70 && salaryOk && joiningOk;
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
