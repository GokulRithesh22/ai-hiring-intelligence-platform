import { asyncHandler } from "../../lib/http";
import { healthService } from "./health.service";

export const healthController = {
  getHealth: asyncHandler(async (_request, response) => {
    response.json(await healthService.getStatus());
  }),

  getLive: asyncHandler(async (_request, response) => {
    response.json({ status: "ok" });
  }),

  getReady: asyncHandler(async (_request, response) => {
    response.json(await healthService.getStatus());
  })
};
