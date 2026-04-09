import type { Candidate, CreateCandidateInput, HrCandidateDetail } from "@ai-hiring/shared-types";

import { ApiError } from "../../lib/http";
import { hrRepository } from "../hr/hr.repository";
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

  async getCandidateIntelligence(candidateId: string): Promise<HrCandidateDetail> {
    const detail = await hrRepository.getCandidateDetail(candidateId);

    if (!detail) {
      throw new ApiError(404, "Candidate intelligence not found");
    }

    return detail;
  }

  async createCandidate(input: CreateCandidateInput): Promise<Candidate> {
    const existing = await candidatesRepository.findByEmail(input.email);
    if (existing) {
      const updated = await candidatesRepository.update(existing.id, input);
      return updated ?? existing;
    }

    return candidatesRepository.create(input);
  }
}

export const candidatesService = new CandidatesService();
