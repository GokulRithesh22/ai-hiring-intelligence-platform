import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { parsePayload } from "../../lib/validation";
import { authService } from "../auth/auth.service";
import { jobsService } from "./jobs.service";

const createJobSchema = z.object({
  title: z.string().min(2),
  department: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]).optional(),
  minExperienceYears: z.number().min(0).max(40).optional().nullable(),
  salaryMin: z.number().min(0).optional().nullable(),
  salaryMax: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional().nullable(),
  joiningTimeline: z.string().optional().nullable(),
  relocationRequired: z.boolean().optional(),
  intakeAnswers: z
    .array(
      z.object({
        prompt: z.string().min(1),
        answer: z.string().min(1)
      })
    )
    .optional(),
  generatedDescription: z.string().min(20).optional()
});

export const jobsController = {
  listJobs: asyncHandler(async (_request, response) => {
    response.json({
      items: await jobsService.listJobs()
    });
  }),

  getJobById: asyncHandler(async (request, response) => {
    response.json(await jobsService.getJobById(request.params.jobId));
  }),

  createJob: asyncHandler(async (request, response) => {
    const user = authService.requireUser(request.user);
    const payload = parsePayload(createJobSchema, request.body);
    const job = await jobsService.createJob(
      {
        ...payload,
        generatedDescription:
          payload.generatedDescription ?? `${payload.title} draft created from title-only intake.`
      },
      user.id
    );

    response.status(201).json(job);
  }),

  saveIntake: asyncHandler(async (request, response) => {
    const payload = parsePayload(
      z.object({
        answers: z.array(
          z.object({
            prompt: z.string().min(1),
            answer: z.string().min(1)
          })
        )
      }),
      request.body
    );

    response.json(await jobsService.saveIntake(request.params.jobId, payload.answers));
  }),

  generateDescription: asyncHandler(async (request, response) => {
    response.json(await jobsService.generateDescription(request.params.jobId));
  }),

  submitForApproval: asyncHandler(async (request, response) => {
    response.json(await jobsService.submitForApproval(request.params.jobId));
  })
};
