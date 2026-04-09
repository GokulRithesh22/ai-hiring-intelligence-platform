import { Router } from "express";

import { requireAuth, requireRole } from "../../middleware/auth";
import { candidatesController } from "./candidates.controller";

export const candidatesRouter = Router();

candidatesRouter.get("/", requireAuth, requireRole("MANAGER", "HR", "ADMIN"), candidatesController.listCandidates);
candidatesRouter.get(
  "/:candidateId/intelligence",
  requireAuth,
  requireRole("MANAGER", "HR", "ADMIN"),
  candidatesController.getCandidateIntelligence
);
candidatesRouter.get(
  "/:candidateId",
  requireAuth,
  requireRole("MANAGER", "HR", "ADMIN"),
  candidatesController.getCandidate
);
candidatesRouter.post("/", candidatesController.createCandidate);
