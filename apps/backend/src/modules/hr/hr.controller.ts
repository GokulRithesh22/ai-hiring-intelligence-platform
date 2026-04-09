import { asyncHandler } from "../../lib/http";
import { getRouteParam } from "../../lib/validation";
import { hrService } from "./hr.service";

export const hrController = {
  getDashboard: asyncHandler(async (_request, response) => {
    response.json(await hrService.getDashboard());
  }),

  listJobs: asyncHandler(async (_request, response) => {
    response.json({ items: await hrService.listJobs() });
  }),

  getJob: asyncHandler(async (request, response) => {
    response.json(await hrService.getJob(getRouteParam(request.params.jobId, "jobId")));
  }),

  getJobApplications: asyncHandler(async (request, response) => {
    response.json({
      items: await hrService.getJobApplications(getRouteParam(request.params.jobId, "jobId"))
    });
  }),

  listCandidates: asyncHandler(async (_request, response) => {
    response.json({ items: await hrService.listCandidates() });
  }),

  getCandidate: asyncHandler(async (request, response) => {
    response.json(await hrService.getCandidate(getRouteParam(request.params.candidateId, "candidateId")));
  }),

  getAnalytics: asyncHandler(async (_request, response) => {
    response.json(await hrService.getAnalytics());
  })
};
