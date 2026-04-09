import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { parsePayload } from "../../lib/validation";
import { voiceInterviewsService } from "./voice-interviews.service";

const synthesizeSchema = z.object({
  text: z.string().min(1),
  voiceId: z.string().optional().nullable()
});

const transcribeSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().min(1),
  fileName: z.string().optional().nullable()
});

const evaluateSchema = z.object({
  answers: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1)
    })
  )
});

export const voiceInterviewsController = {
  getConfig: asyncHandler(async (_request, response) => {
    response.json(voiceInterviewsService.getConfig());
  }),

  synthesize: asyncHandler(async (request, response) => {
    const payload = parsePayload(synthesizeSchema, request.body);
    const audio = await voiceInterviewsService.synthesize(payload.text, payload.voiceId);
    response.setHeader("Content-Type", audio.contentType);
    response.send(audio.buffer);
  }),

  transcribe: asyncHandler(async (request, response) => {
    const payload = parsePayload(transcribeSchema, request.body);
    response.json(await voiceInterviewsService.transcribe(payload));
  }),

  evaluate: asyncHandler(async (request, response) => {
    const payload = parsePayload(evaluateSchema, request.body);
    response.json(await voiceInterviewsService.evaluate(payload));
  })
};
