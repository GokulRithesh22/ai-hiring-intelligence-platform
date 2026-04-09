import { z } from "zod";

import { ApiError, asyncHandler } from "../../lib/http";
import { extractResumeText } from "../../lib/resume-extraction";
import { getRouteParam } from "../../lib/validation";
import { publicJobsService } from "./public-jobs.service";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const publicApplySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.preprocess(emptyToUndefined, z.string().optional().nullable()),
  linkedinUrl: z.preprocess(emptyToUndefined, z.string().url().optional().nullable()),
  expectedCtc: z.coerce.number().min(0),
  earliestJoiningDate: z.string().min(1),
  relocation: z.preprocess(emptyToUndefined, z.string().optional().nullable()),
  resumeText: z.preprocess(emptyToUndefined, z.string().min(20).optional())
});

export const publicJobsController = {
  listJobs: asyncHandler(async (_request, response) => {
    response.json({ items: await publicJobsService.listJobs() });
  }),

  getJob: asyncHandler(async (request, response) => {
    response.json(await publicJobsService.getJob(getRouteParam(request.params.jobId, "jobId")));
  }),

  apply: asyncHandler(async (request, response) => {
    const payload = publicApplySchema.parse(request.body);
    const resumeText = request.file
      ? await extractResumeText(request.file)
      : payload.resumeText;

    if (!resumeText || resumeText.length < 40) {
      throw new ApiError(400, "Resume text is required for screening.");
    }

    response.status(201).json(
      await publicJobsService.apply(getRouteParam(request.params.jobId, "jobId"), {
        ...payload,
        resumeText,
        resumeFileName: request.file?.originalname ?? null
      })
    );
  })
};
