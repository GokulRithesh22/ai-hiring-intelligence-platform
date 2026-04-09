import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { getRouteParam, parsePayload } from "../../lib/validation";
import { publicJobsService } from "./public-jobs.service";

const publicApplySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  resumeText: z.string().min(20)
});

export const publicJobsController = {
  listJobs: asyncHandler(async (_request, response) => {
    response.json({ items: await publicJobsService.listJobs() });
  }),

  getJob: asyncHandler(async (request, response) => {
    response.json(await publicJobsService.getJob(getRouteParam(request.params.jobId, "jobId")));
  }),

  apply: asyncHandler(async (request, response) => {
    const payload = parsePayload(publicApplySchema, request.body);
    response.status(201).json(
      await publicJobsService.apply(getRouteParam(request.params.jobId, "jobId"), payload)
    );
  })
};
