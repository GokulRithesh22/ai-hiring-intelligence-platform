import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { parsePayload } from "../../lib/validation";
import { authService } from "../auth/auth.service";
import { hrApprovalsService } from "./hr-approvals.service";

const decisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PUBLISHED"]),
  approvedDescription: z.string().optional().nullable(),
  approvalNotes: z.string().optional().nullable()
});

export const hrApprovalsController = {
  listPendingJobs: asyncHandler(async (_request, response) => {
    response.json({
      items: await hrApprovalsService.listPendingJobs()
    });
  }),

  reviewJob: asyncHandler(async (request, response) => {
    const user = authService.requireUser(request.user);
    const payload = parsePayload(decisionSchema, request.body);
    const job = await hrApprovalsService.reviewJob(request.params.jobId, payload, user.id);

    response.json(job);
  })
};
