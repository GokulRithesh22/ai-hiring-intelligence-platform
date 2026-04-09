import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import { candidateInsightsController } from "./candidate-insights.controller";

export const candidateInsightsRouter = Router();

candidateInsightsRouter.get("/:candidateId", requireAuth, candidateInsightsController.getByCandidate);
