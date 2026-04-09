import { asyncHandler } from "../../lib/http";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  getSummary: asyncHandler(async (_request, response) => {
    response.json(await dashboardService.getSummary());
  }),

  getCandidatesTable: asyncHandler(async (_request, response) => {
    response.json({ items: await dashboardService.getCandidatesTable() });
  })
};
