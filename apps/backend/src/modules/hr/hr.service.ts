import { ApiError } from "../../lib/http";
import { hrRepository } from "./hr.repository";

export class HrService {
  async getDashboard() {
    return hrRepository.getDashboard();
  }

  async listJobs() {
    return hrRepository.listJobs();
  }

  async getJob(jobId: string) {
    const job = await hrRepository.getJobDetail(jobId);

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }

  async getJobApplications(jobId: string) {
    return hrRepository.listJobApplications(jobId);
  }

  async listCandidates() {
    return hrRepository.listCandidates();
  }

  async getCandidate(candidateId: string) {
    const candidate = await hrRepository.getCandidateDetail(candidateId);

    if (!candidate) {
      throw new ApiError(404, "Candidate not found");
    }

    return candidate;
  }

  async getAnalytics() {
    return hrRepository.getAnalytics();
  }
}

export const hrService = new HrService();
