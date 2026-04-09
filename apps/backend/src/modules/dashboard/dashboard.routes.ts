import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import { dashboardController } from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/hr/summary", requireAuth, dashboardController.getSummary);
dashboardRouter.get("/hr/candidates", requireAuth, dashboardController.getCandidatesTable);
