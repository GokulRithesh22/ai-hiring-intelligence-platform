import { asyncHandler } from "../../lib/http";
import { getRouteParam } from "../../lib/validation";
import { candidateInsightsService } from "./candidate-insights.service";

export const candidateInsightsController = {
  getByCandidate: asyncHandler(async (request, response) => {
    response.json(
      await candidateInsightsService.getByCandidate(
        getRouteParam(request.params.candidateId, "candidateId")
      )
    );
  })
};
