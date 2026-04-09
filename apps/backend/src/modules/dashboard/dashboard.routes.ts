import { Router } from "express";

import { requireAuth, requireHrRole } from "../../middleware/auth";
import { dashboardController } from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/hr/summary", requireAuth, requireHrRole, dashboardController.getSummary);
dashboardRouter.get("/hr/candidates", requireAuth, requireHrRole, dashboardController.getCandidatesTable);
