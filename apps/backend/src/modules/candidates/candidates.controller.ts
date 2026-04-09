import { z } from "zod";

import { asyncHandler } from "../../lib/http";
import { getRouteParam, parsePayload } from "../../lib/validation";
import { candidatesService } from "./candidates.service";

const createCandidateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  resumeFileUrl: z.string().url().optional().nullable(),
  resumeText: z.string().optional().nullable(),
  currentLocation: z.string().optional().nullable(),
  totalExperienceYears: z.number().optional().nullable(),
  currentCompany: z.string().optional().nullable()
});

export const candidatesController = {
  listCandidates: asyncHandler(async (_request, response) => {
    response.json({ items: await candidatesService.listCandidates() });
  }),

  getCandidateIntelligence: asyncHandler(async (request, response) => {
    response.json(
      await candidatesService.getCandidateIntelligence(
        getRouteParam(request.params.candidateId, "candidateId")
      )
    );
  }),

  getCandidate: asyncHandler(async (request, response) => {
    response.json(
      await candidatesService.getCandidate(getRouteParam(request.params.candidateId, "candidateId"))
    );
  }),

  createCandidate: asyncHandler(async (request, response) => {
    const payload = parsePayload(createCandidateSchema, request.body);
    response.status(201).json(await candidatesService.createCandidate(payload));
  })
};
