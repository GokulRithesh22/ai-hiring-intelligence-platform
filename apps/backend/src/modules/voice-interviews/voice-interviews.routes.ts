import { Router } from "express";

import { voiceInterviewsController } from "./voice-interviews.controller";

export const voiceInterviewsRouter = Router();

voiceInterviewsRouter.get("/config", voiceInterviewsController.getConfig);
voiceInterviewsRouter.post("/sessions/start", voiceInterviewsController.startConversation);
voiceInterviewsRouter.post(
  "/sessions/:conversationId/respond",
  voiceInterviewsController.respondToConversation
);
voiceInterviewsRouter.post("/speak", voiceInterviewsController.synthesize);
voiceInterviewsRouter.post("/transcribe", voiceInterviewsController.transcribe);
voiceInterviewsRouter.post("/evaluate", voiceInterviewsController.evaluate);
