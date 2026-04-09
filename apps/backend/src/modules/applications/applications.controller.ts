import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { parsePayload } from "../../lib/validation";
import { applicationsService } from "./applications.service";

const createApplicationSchema = z.object({
  candidateId: z.string().uuid(),
  jobId: z.string().uuid(),
  resumeMatchScore: z.number().optional().nullable(),
  qualificationPassed: z.boolean().optional().nullable(),
  qualificationAnswers: z
    .object({
      joiningTimeline: z.string(),
      expectedSalary: z.number(),
      currency: z.string(),
      relocationWillingness: z.boolean()
    })
    .optional()
    .nullable(),
  screeningDecisionReason: z.string().optional().nullable()
});

const qualificationSchema = z.object({
  joiningTimeline: z.string().min(1),
  expectedSalary: z.number().min(0),
  currency: z.string().min(1),
  relocationWillingness: z.boolean()
});

export const applicationsController = {
  listApplications: asyncHandler(async (_request, response) => {
    response.json({ items: await applicationsService.listApplications() });
  }),

  getApplication: asyncHandler(async (request, response) => {
    response.json(await applicationsService.getApplication(request.params.applicationId));
  }),

  createApplication: asyncHandler(async (request, response) => {
    const payload = parsePayload(createApplicationSchema, request.body);
    response.status(201).json(await applicationsService.createApplication(payload));
  }),

  screenResume: asyncHandler(async (request, response) => {
    response.json(await applicationsService.screenResume(request.params.applicationId));
  }),

  evaluateQualification: asyncHandler(async (request, response) => {
    const payload = parsePayload(qualificationSchema, request.body);
    response.json(
      await applicationsService.evaluateQualification(request.params.applicationId, payload)
    );
  }),

  startInterview: asyncHandler(async (request, response) => {
    response.status(201).json(await applicationsService.startInterview(request.params.applicationId));
  }),

  shortlist: asyncHandler(async (request, response) => {
    response.json(await applicationsService.shortlist(request.params.applicationId));
  }),

  reject: asyncHandler(async (request, response) => {
    response.json(await applicationsService.reject(request.params.applicationId));
  })
};
