import { query } from "@ai-hiring/database";
import type {
  InterviewEvaluationDetail,
  ReplaceInterviewEvaluationsInput
} from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

interface InterviewEvaluationRow {
  id: string;
  session_id: string;
  interview_item_id: string | null;
  question: string;
  answer: string;
  score: string;
  rationale: string;
  evidence: string[];
  created_at: Date;
  updated_at: Date;
}

function mapInterviewEvaluation(row: InterviewEvaluationRow): InterviewEvaluationDetail {
  return {
    id: row.id,
    sessionId: row.session_id,
    interviewItemId: row.interview_item_id,
    question: row.question,
    answer: row.answer,
    score: toNumber(row.score) ?? 0,
    rationale: row.rationale,
    evidence: row.evidence ?? [],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class InterviewEvaluationsRepository {
  async listBySessionId(sessionId: string): Promise<InterviewEvaluationDetail[]> {
    const result = await query<InterviewEvaluationRow>(
      "SELECT * FROM interview_evaluations WHERE session_id = $1 ORDER BY created_at ASC",
      [sessionId]
    );

    return result.rows.map(mapInterviewEvaluation);
  }

  async replaceForSession(input: ReplaceInterviewEvaluationsInput): Promise<InterviewEvaluationDetail[]> {
    await query("DELETE FROM interview_evaluations WHERE session_id = $1", [input.sessionId]);

    const created: InterviewEvaluationDetail[] = [];

    for (const item of input.items) {
      const result = await query<InterviewEvaluationRow>(
        `
          INSERT INTO interview_evaluations (
            session_id,
            interview_item_id,
            question,
            answer,
            score,
            rationale,
            evidence
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
          RETURNING *
        `,
        [
          input.sessionId,
          item.interviewItemId ?? null,
          item.question,
          item.answer,
          item.score,
          item.rationale,
          JSON.stringify(item.evidence ?? [])
        ]
      );

      created.push(mapInterviewEvaluation(result.rows[0]));
    }

    return created;
  }
}

export const interviewEvaluationsRepository = new InterviewEvaluationsRepository();
