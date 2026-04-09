import { Router } from "express";

import { requireAuth, requireRecruiterRole } from "../../middleware/auth";
import { jobsController } from "./jobs.controller";

export const jobsRouter = Router();

jobsRouter.get("/dashboard", requireAuth, requireRecruiterRole, jobsController.getRecruiterDashboard);
jobsRouter.post("/drafts", requireAuth, requireRecruiterRole, jobsController.createRecruiterDraft);
jobsRouter.get(
  "/:jobId/intelligence",
  requireAuth,
  requireRecruiterRole,
  jobsController.getRecruiterJobIntelligence
);
jobsRouter.post(
  "/:jobId/refine-description",
  requireAuth,
  requireRecruiterRole,
  jobsController.refineRecruiterDescription
);
jobsRouter.patch("/:jobId", requireAuth, requireRecruiterRole, jobsController.updateJob);
jobsRouter.post("/:jobId/status", requireAuth, requireRecruiterRole, jobsController.updateJobStatus);

jobsRouter.get(
  "/manager/dashboard",
  requireAuth,
  requireRecruiterRole,
  jobsController.getManagerDashboard
);
jobsRouter.post(
  "/manager/drafts",
  requireAuth,
  requireRecruiterRole,
  jobsController.createManagerDraft
);
jobsRouter.get("/", requireAuth, jobsController.listJobs);
jobsRouter.get(
  "/:jobId/manager-intelligence",
  requireAuth,
  requireRecruiterRole,
  jobsController.getManagerJobIntelligence
);
jobsRouter.get("/:jobId", requireAuth, jobsController.getJobById);
jobsRouter.post("/", requireAuth, requireRecruiterRole, jobsController.createJob);
jobsRouter.post("/:jobId/intake", requireAuth, requireRecruiterRole, jobsController.saveIntake);
jobsRouter.post(
  "/:jobId/generate-description",
  requireAuth,
  requireRecruiterRole,
  jobsController.generateDescription
);
jobsRouter.post(
  "/:jobId/manager/refine-description",
  requireAuth,
  requireRecruiterRole,
  jobsController.refineManagerDescription
);
jobsRouter.post(
  "/:jobId/submit-for-approval",
  requireAuth,
  requireRecruiterRole,
  jobsController.submitForApproval
);
