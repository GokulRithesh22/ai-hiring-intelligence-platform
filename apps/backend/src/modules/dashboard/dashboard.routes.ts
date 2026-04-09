import { Router } from "express";

import { requireAuth, requireRecruiterRole } from "../../middleware/auth";
import { dashboardController } from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, requireRecruiterRole, dashboardController.getSummary);
dashboardRouter.get("/candidates", requireAuth, requireRecruiterRole, dashboardController.getCandidatesTable);
dashboardRouter.get("/hr/summary", requireAuth, requireRecruiterRole, dashboardController.getSummary);
dashboardRouter.get("/hr/candidates", requireAuth, requireRecruiterRole, dashboardController.getCandidatesTable);
