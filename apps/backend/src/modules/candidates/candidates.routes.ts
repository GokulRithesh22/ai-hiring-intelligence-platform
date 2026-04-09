import { Router } from "express";

import { requireAuth, requireRecruiterRole } from "../../middleware/auth";
import { candidatesController } from "./candidates.controller";

export const candidatesRouter = Router();

candidatesRouter.get("/", requireAuth, requireRecruiterRole, candidatesController.listCandidates);
candidatesRouter.get(
  "/:candidateId/intelligence",
  requireAuth,
  requireRecruiterRole,
  candidatesController.getCandidateIntelligence
);
candidatesRouter.get(
  "/:candidateId",
  requireAuth,
  requireRecruiterRole,
  candidatesController.getCandidate
);
candidatesRouter.post("/", candidatesController.createCandidate);
