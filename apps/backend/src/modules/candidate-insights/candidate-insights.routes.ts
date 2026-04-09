import { Router } from "express";

import { requireAuth, requireRole } from "../../middleware/auth";
import { candidateInsightsController } from "./candidate-insights.controller";

export const candidateInsightsRouter = Router();

candidateInsightsRouter.get(
  "/:candidateId",
  requireAuth,
  requireRole("MANAGER", "HR", "ADMIN"),
  candidateInsightsController.getByCandidate
);
