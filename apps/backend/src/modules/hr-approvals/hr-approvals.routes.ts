import { Router } from "express";

import { requireAuth, requireRecruiterRole } from "../../middleware/auth";
import { hrApprovalsController } from "./hr-approvals.controller";

export const hrApprovalsRouter = Router();

hrApprovalsRouter.get(
  "/pending",
  requireAuth,
  requireRecruiterRole,
  hrApprovalsController.listPendingJobs
);
hrApprovalsRouter.post(
  "/:jobId/decision",
  requireAuth,
  requireRecruiterRole,
  hrApprovalsController.reviewJob
);
