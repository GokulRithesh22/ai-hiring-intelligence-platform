import type { CreateCandidateInput } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { candidatesRepository } from "./candidates.repository";

export class CandidatesService {
  async listCandidates() {
    return candidatesRepository.list();
  }

  async getCandidate(candidateId: string) {
    const candidate = await candidatesRepository.findById(candidateId);

    if (!candidate) {
      throw new ApiError(404, "Candidate not found");
    }

    return candidate;
  }

  async createCandidate(input: CreateCandidateInput) {
    const existing = await candidatesRepository.findByEmail(input.email);
    return existing ?? candidatesRepository.create(input);
  }
}

export const candidatesService = new CandidatesService();
