import { Router } from "express";

import { requireAuth, requireRole } from "../../middleware/auth";
import { jobsController } from "./jobs.controller";

export const jobsRouter = Router();

jobsRouter.get(
  "/manager/dashboard",
  requireAuth,
  requireRole("MANAGER", "ADMIN"),
  jobsController.getManagerDashboard
);
jobsRouter.post(
  "/manager/drafts",
  requireAuth,
  requireRole("MANAGER", "ADMIN"),
  jobsController.createManagerDraft
);
jobsRouter.get("/", requireAuth, jobsController.listJobs);
jobsRouter.get(
  "/:jobId/manager-intelligence",
  requireAuth,
  requireRole("MANAGER", "ADMIN"),
  jobsController.getManagerJobIntelligence
);
jobsRouter.get("/:jobId", requireAuth, jobsController.getJobById);
jobsRouter.post("/", requireAuth, requireRole("MANAGER", "ADMIN"), jobsController.createJob);
jobsRouter.post("/:jobId/intake", requireAuth, requireRole("MANAGER", "ADMIN"), jobsController.saveIntake);
jobsRouter.post(
  "/:jobId/generate-description",
  requireAuth,
  requireRole("MANAGER", "ADMIN"),
  jobsController.generateDescription
);
jobsRouter.post(
  "/:jobId/manager/refine-description",
  requireAuth,
  requireRole("MANAGER", "ADMIN"),
  jobsController.refineManagerDescription
);
jobsRouter.post(
  "/:jobId/submit-for-approval",
  requireAuth,
  requireRole("MANAGER", "ADMIN"),
  jobsController.submitForApproval
);
