import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import { interviewSessionsController } from "./interview-sessions.controller";

export const interviewSessionsRouter = Router();

interviewSessionsRouter.get("/:sessionId", requireAuth, interviewSessionsController.getSession);
interviewSessionsRouter.post("/:sessionId/complete", interviewSessionsController.completeSession);
