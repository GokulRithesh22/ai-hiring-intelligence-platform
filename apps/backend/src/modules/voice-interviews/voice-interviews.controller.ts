import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { getRouteParam, parsePayload } from "../../lib/validation";
import { voiceInterviewsService } from "./voice-interviews.service";

const startConversationSchema = z.object({
  questions: z.array(z.string().min(1)).optional(),
  interviewSessionId: z.string().optional().nullable(),
  applicationId: z.string().optional().nullable()
});

const synthesizeSchema = z.object({
  text: z.string().min(1),
  voiceId: z.string().optional().nullable()
});

const respondConversationSchema = z
  .object({
    transcript: z.string().optional(),
    audioBase64: z.string().optional(),
    mimeType: z.string().optional(),
    fileName: z.string().optional().nullable()
  })
  .superRefine((value, context) => {
    if (!value.transcript?.trim() && !value.audioBase64) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either transcript or audioBase64 is required"
      });
    }
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

  startConversation: asyncHandler(async (request, response) => {
    const payload = parsePayload(startConversationSchema, request.body);
    response.status(201).json(
      await voiceInterviewsService.beginConversation({
        questions: payload.questions,
        interviewSessionId: payload.interviewSessionId ?? undefined,
        applicationId: payload.applicationId ?? undefined
      })
    );
  }),

  synthesize: asyncHandler(async (request, response) => {
    const payload = parsePayload(synthesizeSchema, request.body);
    const audio = await voiceInterviewsService.synthesize(payload.text, payload.voiceId);
    response.setHeader("Content-Type", audio.contentType);
    response.send(audio.buffer);
  }),

  transcribe: asyncHandler(async (request, response) => {
    const payload = parsePayload(transcribeSchema, request.body);
    response.json(
      await voiceInterviewsService.transcribe({
        audioBase64: payload.audioBase64,
        mimeType: payload.mimeType,
        fileName: payload.fileName ?? undefined
      })
    );
  }),

  respondToConversation: asyncHandler(async (request, response) => {
    const payload = parsePayload(respondConversationSchema, request.body);
    response.json(
      await voiceInterviewsService.respondToConversation({
        conversationId: getRouteParam(request.params.conversationId, "conversationId"),
        transcript: payload.transcript,
        audioBase64: payload.audioBase64,
        mimeType: payload.mimeType,
        fileName: payload.fileName ?? undefined
      })
    );
  }),

  evaluate: asyncHandler(async (request, response) => {
    const payload = parsePayload(evaluateSchema, request.body);
    response.json(await voiceInterviewsService.evaluate(payload));
  })
};
