import { Router } from "express";

import { requireAuth, requireRecruiterRole } from "../../middleware/auth";
import { candidateInsightsController } from "./candidate-insights.controller";

export const candidateInsightsRouter = Router();

candidateInsightsRouter.get(
  "/:candidateId",
  requireAuth,
  requireRecruiterRole,
  candidateInsightsController.getByCandidate
);
