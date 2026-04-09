import { query } from "@ai-hiring/database";
import type { CandidateTableRow, DashboardStats } from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

export class DashboardRepository {
  async getSummary(): Promise<DashboardStats> {
    const [totals, interviews, shortlisted, jobs] = await Promise.all([
      query<{ count: string }>("SELECT COUNT(*)::text AS count FROM applications"),
      query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM interview_sessions WHERE status = 'COMPLETED'"
      ),
      query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM applications WHERE status = 'SHORTLISTED'"
      ),
      query<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM jobs WHERE status IN ('APPROVED', 'PUBLISHED')"
      )
    ]);

    return {
      totalApplicants: Number(totals.rows[0]?.count ?? 0),
      aiInterviewsCompleted: Number(interviews.rows[0]?.count ?? 0),
      candidatesShortlisted: Number(shortlisted.rows[0]?.count ?? 0),
      activeJobRoles: Number(jobs.rows[0]?.count ?? 0)
    };
  }

  async getCandidatesTable(): Promise<CandidateTableRow[]> {
    const result = await query<{
      application_id: string;
      candidate_id: string;
      job_id: string;
      name: string;
      resume_score: string | null;
      interview_score: string | null;
      joining_timeline: string | null;
      salary_expectation: string | null;
      relocation: boolean | null;
      status: CandidateTableRow["status"];
    }>(
      `
        SELECT
          applications.id AS application_id,
          candidates.id AS candidate_id,
          jobs.id AS job_id,
          candidates.full_name AS name,
          applications.resume_match_score AS resume_score,
          applications.interview_score AS interview_score,
          applications.qualification_answers->>'joiningTimeline' AS joining_timeline,
          applications.qualification_answers->>'expectedSalary' AS salary_expectation,
          CASE
            WHEN applications.qualification_answers ? 'relocationWillingness'
            THEN (applications.qualification_answers->>'relocationWillingness')::boolean
            ELSE NULL
          END AS relocation,
          applications.status AS status
        FROM applications
        INNER JOIN candidates ON candidates.id = applications.candidate_id
        INNER JOIN jobs ON jobs.id = applications.job_id
        ORDER BY applications.applied_at DESC
      `
    );

    return result.rows.map((row) => ({
      applicationId: row.application_id,
      candidateId: row.candidate_id,
      jobId: row.job_id,
      name: row.name,
      resumeScore: toNumber(row.resume_score),
      interviewScore: toNumber(row.interview_score),
      joiningTimeline: row.joining_timeline,
      salaryExpectation: toNumber(row.salary_expectation),
      relocation: row.relocation,
      status: row.status
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
