import { Router } from "express";

import { requireAuth, requireRole } from "../../middleware/auth";
import { hrApprovalsController } from "./hr-approvals.controller";

export const hrApprovalsRouter = Router();

hrApprovalsRouter.get(
  "/pending",
  requireAuth,
  requireRole("HR", "ADMIN", "RECRUITER"),
  hrApprovalsController.listPendingJobs
);
hrApprovalsRouter.post(
  "/:jobId/decision",
  requireAuth,
  requireRole("HR", "ADMIN"),
  hrApprovalsController.reviewJob
);
