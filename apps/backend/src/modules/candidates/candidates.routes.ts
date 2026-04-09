import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import { candidatesController } from "./candidates.controller";

export const candidatesRouter = Router();

candidatesRouter.get("/", requireAuth, candidatesController.listCandidates);
candidatesRouter.get("/:candidateId", requireAuth, candidatesController.getCandidate);
candidatesRouter.post("/", candidatesController.createCandidate);
