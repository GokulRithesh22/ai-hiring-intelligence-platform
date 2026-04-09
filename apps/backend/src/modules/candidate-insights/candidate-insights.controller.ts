import { asyncHandler } from "../../lib/http";
import { candidateInsightsService } from "./candidate-insights.service";

export const candidateInsightsController = {
  getByCandidate: asyncHandler(async (request, response) => {
    response.json(await candidateInsightsService.getByCandidate(request.params.candidateId));
  })
};
