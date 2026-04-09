import type { UpdateJobApprovalInput } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { hrApprovalsRepository } from "./hr-approvals.repository";

export class HrApprovalsService {
  async listPendingJobs() {
    return hrApprovalsRepository.listPending();
  }

  async reviewJob(jobId: string, input: UpdateJobApprovalInput, reviewerId: string) {
    const job = await hrApprovalsRepository.applyDecision({
      jobId,
      reviewerId,
      ...input
    });

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }
}

export const hrApprovalsService = new HrApprovalsService();
