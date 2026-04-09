import { Router } from "express";

import { voiceInterviewsController } from "./voice-interviews.controller";

export const voiceInterviewsRouter = Router();

voiceInterviewsRouter.get("/config", voiceInterviewsController.getConfig);
voiceInterviewsRouter.post("/speak", voiceInterviewsController.synthesize);
voiceInterviewsRouter.post("/transcribe", voiceInterviewsController.transcribe);
voiceInterviewsRouter.post("/evaluate", voiceInterviewsController.evaluate);
