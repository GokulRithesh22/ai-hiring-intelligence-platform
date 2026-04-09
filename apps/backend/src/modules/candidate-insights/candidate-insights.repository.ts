import { query } from "@ai-hiring/database";
import type { CandidateInsight, CandidateScore } from "@ai-hiring/shared-types";
import { candidateScoresRepository } from "../applications/candidate-scores.repository";

interface InsightRow {
  id: string;
  candidate_id: string;
  latest_application_id: string | null;
  resume_analysis: Record<string, unknown>;
  linkedin_insights: Record<string, unknown>;
  interview_transcript: string | null;
  evaluation_scores: Record<string, unknown>;
  claim_verification_flags: Array<Record<string, unknown>>;
  suggested_manager_questions: string[];
  hiring_recommendation: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapInsight(
  row: InsightRow,
  applicationHistory: CandidateInsight["applicationHistory"] = [],
  candidateScore: CandidateScore | null = null
): CandidateInsight {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    latestApplicationId: row.latest_application_id,
    resumeAnalysis: row.resume_analysis ?? {},
    linkedinInsights: row.linkedin_insights ?? {},
    interviewTranscript: row.interview_transcript,
    evaluationScores: row.evaluation_scores ?? {},
    claimVerificationFlags: row.claim_verification_flags ?? [],
    suggestedManagerQuestions: row.suggested_manager_questions ?? [],
    hiringRecommendation: row.hiring_recommendation,
    candidateScore:
      candidateScore ??
      (((row.evaluation_scores ?? {}).candidateScore as CandidateScore | undefined) ?? null),
    applicationHistory,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class CandidateInsightsRepository {
  async findByCandidateId(candidateId: string): Promise<CandidateInsight | null> {
    const [insightResult, latestCandidateScore] = await Promise.all([
      query<InsightRow>(
        "SELECT * FROM candidate_insights WHERE candidate_id = $1 LIMIT 1",
        [candidateId]
      ),
      candidateScoresRepository.findLatestByCandidateId(candidateId)
    ]);

    const row = insightResult.rows[0];
    if (!row) {
      return null;
    }

    const historyResult = await query<{
      title: string;
      status: string;
      applied_at: Date;
    }>(
      `
        SELECT jobs.title, applications.status, applications.applied_at
        FROM applications
        INNER JOIN jobs ON jobs.id = applications.job_id
        WHERE applications.candidate_id = $1
        ORDER BY applications.applied_at DESC
      `,
      [candidateId]
    );

    return mapInsight(
      row,
      historyResult.rows.map((item) => ({
        jobTitle: item.title,
        status: item.status,
        appliedAt: item.applied_at.toISOString()
      })),
      latestCandidateScore
    );
  }

  async upsert(input: {
    candidateId: string;
    latestApplicationId: string | null;
    resumeAnalysis: Record<string, unknown>;
    linkedinInsights: Record<string, unknown>;
    interviewTranscript: string | null;
    evaluationScores: Record<string, unknown>;
    claimVerificationFlags: Array<Record<string, unknown>>;
    suggestedManagerQuestions: string[];
    hiringRecommendation: string | null;
  }) {
    const result = await query<InsightRow>(
      `
        INSERT INTO candidate_insights (
          candidate_id,
          latest_application_id,
          resume_analysis,
          linkedin_insights,
          interview_transcript,
          evaluation_scores,
          claim_verification_flags,
          suggested_manager_questions,
          hiring_recommendation
        )
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9)
        ON CONFLICT (candidate_id)
        DO UPDATE SET
          latest_application_id = EXCLUDED.latest_application_id,
          resume_analysis = candidate_insights.resume_analysis || EXCLUDED.resume_analysis,
          linkedin_insights = candidate_insights.linkedin_insights || EXCLUDED.linkedin_insights,
          interview_transcript = COALESCE(EXCLUDED.interview_transcript, candidate_insights.interview_transcript),
          evaluation_scores = candidate_insights.evaluation_scores || EXCLUDED.evaluation_scores,
          claim_verification_flags = CASE
            WHEN EXCLUDED.claim_verification_flags = '[]'::jsonb
              THEN candidate_insights.claim_verification_flags
            ELSE EXCLUDED.claim_verification_flags
          END,
          suggested_manager_questions = CASE
            WHEN EXCLUDED.suggested_manager_questions = '[]'::jsonb
              THEN candidate_insights.suggested_manager_questions
            ELSE EXCLUDED.suggested_manager_questions
          END,
          hiring_recommendation = COALESCE(EXCLUDED.hiring_recommendation, candidate_insights.hiring_recommendation),
          updated_at = NOW()
        RETURNING *
      `,
      [
        input.candidateId,
        input.latestApplicationId,
        JSON.stringify(input.resumeAnalysis),
        JSON.stringify(input.linkedinInsights),
        input.interviewTranscript,
        JSON.stringify(input.evaluationScores),
        JSON.stringify(input.claimVerificationFlags),
        JSON.stringify(input.suggestedManagerQuestions),
        input.hiringRecommendation
      ]
    );

    return mapInsight(result.rows[0]);
  }
}

export const candidateInsightsRepository = new CandidateInsightsRepository();
