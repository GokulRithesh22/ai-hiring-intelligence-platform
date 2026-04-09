import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { getRouteParam, parsePayload } from "../../lib/validation";
import { interviewSessionsService } from "./interview-sessions.service";

const completeSessionSchema = z.object({
  communicationScore: z.number(),
  knowledgeScore: z.number(),
  confidenceScore: z.number(),
  summary: z.string().min(10),
  transcript: z.string().min(10),
  voiceTranscript: z
    .array(
      z.object({
        id: z.string().min(1),
        role: z.enum(["assistant", "candidate"]),
        kind: z.enum(["greeting", "question", "follow_up", "response", "closing"]),
        text: z.string().min(1),
        category: z
          .enum([
            "experience_validation",
            "skill_depth_validation",
            "problem_solving_scenario",
            "role_simulation",
            "behavioral_question"
          ])
          .optional()
          .nullable(),
        linkedQuestionId: z.string().optional().nullable(),
        scores: z
          .object({
            communicationClarity: z.number().min(0).max(100),
            technicalDepth: z.number().min(0).max(100),
            problemSolvingStructure: z.number().min(0).max(100),
            businessUnderstanding: z.number().min(0).max(100)
          })
          .optional()
          .nullable(),
        createdAt: z.string().min(1)
      })
    )
    .optional(),
  items: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
      evaluationScore: z.number().min(0).max(100),
      category: z
        .enum([
          "experience_validation",
          "skill_depth_validation",
          "problem_solving_scenario",
          "role_simulation",
          "behavioral_question"
        ])
        .optional()
        .nullable(),
      askedAsFollowUp: z.boolean().optional(),
      rationale: z.string().optional().nullable(),
      scoreBreakdown: z
        .object({
          communicationClarity: z.number().min(0).max(100),
          technicalDepth: z.number().min(0).max(100),
          problemSolvingStructure: z.number().min(0).max(100),
          businessUnderstanding: z.number().min(0).max(100)
        })
        .optional()
        .nullable()
    })
  )
});

export const interviewSessionsController = {
  getSession: asyncHandler(async (request, response) => {
    response.json(
      await interviewSessionsService.getSession(getRouteParam(request.params.sessionId, "sessionId"))
    );
  }),

  completeSession: asyncHandler(async (request, response) => {
    const payload = parsePayload(completeSessionSchema, request.body);
    response.json(
      await interviewSessionsService.completeSession(
        getRouteParam(request.params.sessionId, "sessionId"),
        payload
      )
    );
  })
};
