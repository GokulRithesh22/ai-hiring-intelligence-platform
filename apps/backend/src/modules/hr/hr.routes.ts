import { Router } from "express";

import { requireAuth, requireHrRole } from "../../middleware/auth";
import { hrController } from "./hr.controller";

export const hrRouter = Router();

hrRouter.use(requireAuth, requireHrRole);

hrRouter.get("/dashboard", hrController.getDashboard);
hrRouter.get("/jobs", hrController.listJobs);
hrRouter.get("/jobs/:jobId", hrController.getJob);
hrRouter.get("/jobs/:jobId/applications", hrController.getJobApplications);
hrRouter.get("/candidates", hrController.listCandidates);
hrRouter.get("/candidates/:candidateId", hrController.getCandidate);
hrRouter.get("/analytics", hrController.getAnalytics);
