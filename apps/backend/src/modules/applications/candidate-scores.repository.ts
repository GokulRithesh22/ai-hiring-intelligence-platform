import { query } from "@ai-hiring/database";
import type { CandidateScore, UpsertCandidateScoreInput } from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

interface CandidateScoreRow {
  id: string;
  application_id: string;
  candidate_id: string;
  job_id: string;
  role_capability: string;
  thinking_behavior: string;
  impact: string;
  transferability: string;
  potential: string;
  final_score: string;
  confidence_score: string;
  confidence_label: string;
  summary: string | null;
  recommendation: string | null;
  component_breakdown: CandidateScore["componentBreakdown"];
  evidence_summary: string[];
  created_at: Date;
  updated_at: Date;
}

function mapCandidateScore(row: CandidateScoreRow): CandidateScore {
  return {
    id: row.id,
    applicationId: row.application_id,
    candidateId: row.candidate_id,
    jobId: row.job_id,
    roleCapability: toNumber(row.role_capability) ?? 0,
    thinkingBehavior: toNumber(row.thinking_behavior) ?? 0,
    impact: toNumber(row.impact) ?? 0,
    transferability: toNumber(row.transferability) ?? 0,
    potential: toNumber(row.potential) ?? 0,
    finalScore: toNumber(row.final_score) ?? 0,
    confidenceScore: toNumber(row.confidence_score) ?? 0,
    confidenceLabel: row.confidence_label,
    summary: row.summary,
    recommendation: row.recommendation,
    componentBreakdown: row.component_breakdown,
    evidenceSummary: row.evidence_summary ?? [],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class CandidateScoresRepository {
  async findByApplicationId(applicationId: string): Promise<CandidateScore | null> {
    const result = await query<CandidateScoreRow>(
      "SELECT * FROM candidate_scores WHERE application_id = $1 LIMIT 1",
      [applicationId]
    );

    return result.rows[0] ? mapCandidateScore(result.rows[0]) : null;
  }

  async findLatestByCandidateId(candidateId: string): Promise<CandidateScore | null> {
    const result = await query<CandidateScoreRow>(
      `
        SELECT *
        FROM candidate_scores
        WHERE candidate_id = $1
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 1
      `,
      [candidateId]
    );

    return result.rows[0] ? mapCandidateScore(result.rows[0]) : null;
  }

  async upsert(input: UpsertCandidateScoreInput): Promise<CandidateScore> {
    const result = await query<CandidateScoreRow>(
      `
        INSERT INTO candidate_scores (
          application_id,
          candidate_id,
          job_id,
          role_capability,
          thinking_behavior,
          impact,
          transferability,
          potential,
          final_score,
          confidence_score,
          confidence_label,
          summary,
          recommendation,
          component_breakdown,
          evidence_summary
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15::jsonb
        )
        ON CONFLICT (application_id)
        DO UPDATE SET
          candidate_id = EXCLUDED.candidate_id,
          job_id = EXCLUDED.job_id,
          role_capability = EXCLUDED.role_capability,
          thinking_behavior = EXCLUDED.thinking_behavior,
          impact = EXCLUDED.impact,
          transferability = EXCLUDED.transferability,
          potential = EXCLUDED.potential,
          final_score = EXCLUDED.final_score,
          confidence_score = EXCLUDED.confidence_score,
          confidence_label = EXCLUDED.confidence_label,
          summary = EXCLUDED.summary,
          recommendation = EXCLUDED.recommendation,
          component_breakdown = EXCLUDED.component_breakdown,
          evidence_summary = EXCLUDED.evidence_summary,
          updated_at = NOW()
        RETURNING *
      `,
      [
        input.applicationId,
        input.candidateId,
        input.jobId,
        input.roleCapability,
        input.thinkingBehavior,
        input.impact,
        input.transferability,
        input.potential,
        input.finalScore,
        input.confidenceScore,
        input.confidenceLabel,
        input.summary ?? null,
        input.recommendation ?? null,
        JSON.stringify(input.componentBreakdown),
        JSON.stringify(input.evidenceSummary ?? [])
      ]
    );

    return mapCandidateScore(result.rows[0]);
  }
}

export const candidateScoresRepository = new CandidateScoresRepository();
