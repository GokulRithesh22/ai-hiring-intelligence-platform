import { query } from "@ai-hiring/database";
import type { ScreeningResultDetail, UpsertScreeningResultInput } from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

interface ScreeningResultRow {
  id: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  semantic_similarity: string;
  experience_match: string;
  skills_match: string;
  domain_match: string;
  achievements_match: string;
  final_score: string;
  resume_analysis: Record<string, unknown>;
  job_analysis: Record<string, unknown>;
  reasoning_summary: string | null;
  strengths: string[];
  weaknesses: string[];
  created_at: Date;
  updated_at: Date;
}

function mapScreeningResult(row: ScreeningResultRow): ScreeningResultDetail {
  return {
    id: row.id,
    applicationId: row.application_id,
    candidateId: row.candidate_id,
    jobId: row.job_id,
    semanticSimilarity: toNumber(row.semantic_similarity) ?? 0,
    experienceMatch: toNumber(row.experience_match) ?? 0,
    skillsMatch: toNumber(row.skills_match) ?? 0,
    domainMatch: toNumber(row.domain_match) ?? 0,
    achievementsMatch: toNumber(row.achievements_match) ?? 0,
    finalScore: toNumber(row.final_score) ?? 0,
    resumeAnalysis: row.resume_analysis ?? {},
    jobAnalysis: row.job_analysis ?? {},
    reasoningSummary: row.reasoning_summary,
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class ScreeningResultsRepository {
  async findByApplicationId(applicationId: string): Promise<ScreeningResultDetail | null> {
    const result = await query<ScreeningResultRow>(
      "SELECT * FROM screening_results WHERE application_id = $1 LIMIT 1",
      [applicationId]
    );

    return result.rows[0] ? mapScreeningResult(result.rows[0]) : null;
  }

  async listByCandidateId(candidateId: string): Promise<ScreeningResultDetail[]> {
    const result = await query<ScreeningResultRow>(
      "SELECT * FROM screening_results WHERE candidate_id = $1 ORDER BY created_at DESC",
      [candidateId]
    );

    return result.rows.map(mapScreeningResult);
  }

  async upsert(input: UpsertScreeningResultInput): Promise<ScreeningResultDetail> {
    const result = await query<ScreeningResultRow>(
      `
        INSERT INTO screening_results (
          application_id,
          candidate_id,
          job_id,
          semantic_similarity,
          experience_match,
          skills_match,
          domain_match,
          achievements_match,
          final_score,
          resume_analysis,
          job_analysis,
          reasoning_summary,
          strengths,
          weaknesses
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13::jsonb, $14::jsonb
        )
        ON CONFLICT (application_id)
        DO UPDATE SET
          semantic_similarity = EXCLUDED.semantic_similarity,
          experience_match = EXCLUDED.experience_match,
          skills_match = EXCLUDED.skills_match,
          domain_match = EXCLUDED.domain_match,
          achievements_match = EXCLUDED.achievements_match,
          final_score = EXCLUDED.final_score,
          resume_analysis = EXCLUDED.resume_analysis,
          job_analysis = EXCLUDED.job_analysis,
          reasoning_summary = EXCLUDED.reasoning_summary,
          strengths = EXCLUDED.strengths,
          weaknesses = EXCLUDED.weaknesses,
          updated_at = NOW()
        RETURNING *
      `,
      [
        input.applicationId,
        input.candidateId,
        input.jobId,
        input.semanticSimilarity,
        input.experienceMatch,
        input.skillsMatch,
        input.domainMatch,
        input.achievementsMatch,
        input.finalScore,
        JSON.stringify(input.resumeAnalysis ?? {}),
        JSON.stringify(input.jobAnalysis ?? {}),
        input.reasoningSummary ?? null,
        JSON.stringify(input.strengths ?? []),
        JSON.stringify(input.weaknesses ?? [])
      ]
    );

    return mapScreeningResult(result.rows[0]);
  }
}

export const screeningResultsRepository = new ScreeningResultsRepository();
