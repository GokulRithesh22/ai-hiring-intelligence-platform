import { screenResume } from "@ai-hiring/ai-services";

import { candidatesService } from "../candidates/candidates.service";
import { jobsRepository } from "../jobs/jobs.repository";
import { applicationsService } from "../applications/applications.service";

export class PublicJobsService {
  async listJobs() {
    return jobsRepository.listPublic();
  }

  async getJob(jobId: string) {
    const jobs = await jobsRepository.listPublic();
    return jobs.find((job) => job.id === jobId) ?? null;
  }

  async apply(jobId: string, payload: {
    fullName: string;
    email: string;
    linkedinUrl?: string | null;
    resumeText: string;
    phone?: string | null;
  }) {
    const candidate = await candidatesService.createCandidate({
      fullName: payload.fullName,
      email: payload.email,
      linkedinUrl: payload.linkedinUrl ?? null,
      resumeText: payload.resumeText,
      phone: payload.phone ?? null,
      source: "CAREERS_PAGE",
      permanentProfile: {
        linkedinUrl: payload.linkedinUrl ?? null
      }
    });

    const job = await jobsRepository.findById(jobId);
    const screening = await screenResume({
      jobDescription: job?.approvedDescription ?? job?.generatedDescription ?? "",
      resumeText: payload.resumeText,
      linkedinUrl: payload.linkedinUrl ?? undefined
    });

    return applicationsService.createApplication({
      candidateId: candidate.id,
      jobId,
      resumeMatchScore: screening.matchScore,
      screeningDecisionReason: screening.explanation
    });
  }
}

export const publicJobsService = new PublicJobsService();
