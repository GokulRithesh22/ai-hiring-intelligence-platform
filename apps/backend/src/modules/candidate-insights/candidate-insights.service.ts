import { ApiError } from "../../lib/http";
import { candidateInsightsRepository } from "./candidate-insights.repository";

export class CandidateInsightsService {
  async getByCandidate(candidateId: string) {
    const insight = await candidateInsightsRepository.findByCandidateId(candidateId);

    if (!insight) {
      throw new ApiError(404, "Candidate insight not found");
    }

    return insight;
  }
}

export const candidateInsightsService = new CandidateInsightsService();
