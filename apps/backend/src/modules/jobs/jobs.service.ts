import type { CreateJobInput, JobIntakeAnswer } from "@ai-hiring/shared-types";

import { generateJobDescription } from "@ai-hiring/ai-services";
import { ApiError } from "../../lib/http";
import { jobsRepository } from "./jobs.repository";

export class JobsService {
  async listJobs() {
    return jobsRepository.list();
  }

  async getJobById(jobId: string) {
    const job = await jobsRepository.findById(jobId);

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }

  async createJob(input: CreateJobInput, createdBy: string) {
    return jobsRepository.create(input, createdBy);
  }

  async saveIntake(jobId: string, answers: JobIntakeAnswer[]) {
    const job = await jobsRepository.updateIntake(jobId, answers);

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }

  async generateDescription(jobId: string) {
    const job = await this.getJobById(jobId);
    const result = await generateJobDescription({
      title: job.title,
      intakeAnswers: job.intakeAnswers
    });

    return jobsRepository.updateDescription(jobId, result.description);
  }

  async submitForApproval(jobId: string) {
    const job = await jobsRepository.updateStatus(jobId, "PENDING_HR_APPROVAL");

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }
}

export const jobsService = new JobsService();
