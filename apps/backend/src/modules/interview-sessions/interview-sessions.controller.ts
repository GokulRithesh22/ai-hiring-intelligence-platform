import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { parsePayload } from "../../lib/validation";
import { interviewSessionsService } from "./interview-sessions.service";

const completeSessionSchema = z.object({
  communicationScore: z.number(),
  knowledgeScore: z.number(),
  confidenceScore: z.number(),
  summary: z.string().min(10),
  transcript: z.string().min(10),
  items: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
      evaluationScore: z.number().min(0).max(100)
    })
  )
});

export const interviewSessionsController = {
  getSession: asyncHandler(async (request, response) => {
    response.json(await interviewSessionsService.getSession(request.params.sessionId));
  }),

  completeSession: asyncHandler(async (request, response) => {
    const payload = parsePayload(completeSessionSchema, request.body);
    response.json(await interviewSessionsService.completeSession(request.params.sessionId, payload));
  })
};
