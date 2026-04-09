import { query } from "@ai-hiring/database";
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  QualificationAnswers
} from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

interface ApplicationRow {
  id: string;
  job_id: string;
  candidate_id: string;
  resume_url: string | null;
  expected_ctc: string | null;
  joining_date: string | Date | null;
  status: ApplicationStatus;
  resume_match_score: string | null;
  qualification_passed: boolean | null;
  qualification_answers: QualificationAnswers | null;
  interview_score: string | null;
  screening_decision_reason: string | null;
  applied_at: Date;
  updated_at: Date;
}

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    jobId: row.job_id,
    candidateId: row.candidate_id,
    resumeUrl: row.resume_url,
    expectedCtc: toNumber(row.expected_ctc),
    joiningDate:
      row.joining_date == null
        ? null
        : typeof row.joining_date === "string"
          ? row.joining_date
          : row.joining_date.toISOString(),
    status: row.status,
    resumeMatchScore: toNumber(row.resume_match_score),
    qualificationPassed: row.qualification_passed,
    qualificationAnswers: row.qualification_answers,
    interviewScore: toNumber(row.interview_score),
    screeningDecisionReason: row.screening_decision_reason,
    appliedAt: row.applied_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class ApplicationsRepository {
  async list(): Promise<Application[]> {
    const result = await query<ApplicationRow>("SELECT * FROM applications ORDER BY applied_at DESC");
    return result.rows.map(mapApplication);
  }

  async findById(applicationId: string): Promise<Application | null> {
    const result = await query<ApplicationRow>(
      "SELECT * FROM applications WHERE id = $1 LIMIT 1",
      [applicationId]
    );
    return result.rows[0] ? mapApplication(result.rows[0]) : null;
  }

  async create(input: CreateApplicationInput): Promise<Application> {
    const result = await query<ApplicationRow>(
      `
        INSERT INTO applications (
          candidate_id,
          job_id,
          resume_url,
          expected_ctc,
          joining_date,
          resume_match_score,
          qualification_passed,
          qualification_answers,
          screening_decision_reason,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
        ON CONFLICT (job_id, candidate_id)
        DO UPDATE SET
          resume_url = EXCLUDED.resume_url,
          expected_ctc = EXCLUDED.expected_ctc,
          joining_date = EXCLUDED.joining_date,
          resume_match_score = EXCLUDED.resume_match_score,
          qualification_passed = EXCLUDED.qualification_passed,
          qualification_answers = EXCLUDED.qualification_answers,
          screening_decision_reason = EXCLUDED.screening_decision_reason,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING *
      `,
      [
        input.candidateId,
        input.jobId,
        input.resumeUrl ?? null,
        input.expectedCtc ?? null,
        input.joiningDate ?? null,
        input.resumeMatchScore ?? null,
        input.qualificationPassed ?? null,
        input.qualificationAnswers ? JSON.stringify(input.qualificationAnswers) : null,
        input.screeningDecisionReason ?? null,
        input.resumeMatchScore !== null && input.resumeMatchScore !== undefined && input.resumeMatchScore < 70
          ? "SCREENING_FAILED"
          : input.qualificationPassed === false
            ? "QUALIFICATION_FAILED"
            : "APPLIED"
      ]
    );

    return mapApplication(result.rows[0]);
  }

  async updateStatus(applicationId: string, status: ApplicationStatus, interviewScore?: number | null) {
    const result = await query<ApplicationRow>(
      `
        UPDATE applications
        SET status = $2, interview_score = COALESCE($3, interview_score), updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [applicationId, status, interviewScore ?? null]
    );

    return result.rows[0] ? mapApplication(result.rows[0]) : null;
  }

  async updateScreening(applicationId: string, matchScore: number, reason: string) {
    const status: ApplicationStatus = matchScore >= 70 ? "INTERVIEW_PENDING" : "SCREENING_FAILED";
    const result = await query<ApplicationRow>(
      `
        UPDATE applications
        SET resume_match_score = $2,
            screening_decision_reason = $3,
            status = $4,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [applicationId, matchScore, reason, status]
    );

    return result.rows[0] ? mapApplication(result.rows[0]) : null;
  }

  async updateQualification(applicationId: string, answers: QualificationAnswers, passed: boolean) {
    const status: ApplicationStatus = passed ? "INTERVIEW_PENDING" : "QUALIFICATION_FAILED";
    const result = await query<ApplicationRow>(
      `
        UPDATE applications
        SET qualification_answers = $2::jsonb,
            qualification_passed = $3,
            status = $4,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [applicationId, JSON.stringify(answers), passed, status]
    );

    return result.rows[0] ? mapApplication(result.rows[0]) : null;
  }
}

export const applicationsRepository = new ApplicationsRepository();
