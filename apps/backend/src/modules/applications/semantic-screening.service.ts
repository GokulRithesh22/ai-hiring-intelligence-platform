import {
  analyzeStructuredJobDescription,
  screenResume
} from "@ai-hiring/ai-services";
import type { Job, ScreeningResultDetail } from "@ai-hiring/shared-types";

import { screeningResultsRepository } from "../screening-results/screening-results.repository";

export interface SemanticScreeningInput {
  applicationId: string;
  candidateId: string;
  job: Job;
  resumeText: string;
}

export class SemanticScreeningService {
  async analyzeJobDescription(job: Job) {
    return analyzeStructuredJobDescription({
      jobTitle: job.title,
      jobDescription: job.approvedDescription ?? job.generatedDescription
    });
  }

  async screenApplication(input: SemanticScreeningInput): Promise<ScreeningResultDetail> {
    const screening = await screenResume({
      jobTitle: input.job.title,
      jobDescription: input.job.approvedDescription ?? input.job.generatedDescription,
      resumeText: input.resumeText
    });

    return screeningResultsRepository.upsert({
      applicationId: input.applicationId,
      candidateId: input.candidateId,
      jobId: input.job.id,
      semanticSimilarity: screening.semanticSimilarity,
      experienceMatch: screening.experienceMatch,
      skillsMatch: screening.skillsMatch,
      domainMatch: screening.domainMatch,
      achievementsMatch: screening.achievementsMatch,
      finalScore: screening.matchScore,
      resumeAnalysis: screening.resumeAnalysis as Record<string, unknown>,
      jobAnalysis: screening.jobAnalysis as Record<string, unknown>,
      reasoningSummary: screening.explanation,
      strengths: screening.strengths,
      weaknesses: screening.gaps
    });
  }
}

export const semanticScreeningService = new SemanticScreeningService();
