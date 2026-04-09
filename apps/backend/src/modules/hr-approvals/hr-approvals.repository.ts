import { query } from "@ai-hiring/database";
import type { Job } from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

interface JobApprovalRow {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: Job["employmentType"];
  status: Job["status"];
  min_experience_years: string | null;
  salary_min: string | null;
  salary_max: string | null;
  currency: string | null;
  joining_timeline: string | null;
  relocation_required: boolean;
  intake_answers: Job["intakeAnswers"];
  generated_description: string;
  approved_description: string | null;
  approval_notes: string | null;
  created_by: string;
  approved_by: string | null;
  approved_at: Date | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function mapJob(row: JobApprovalRow): Job {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    location: row.location,
    employmentType: row.employment_type,
    status: row.status,
    minExperienceYears: toNumber(row.min_experience_years),
    salaryMin: toNumber(row.salary_min),
    salaryMax: toNumber(row.salary_max),
    currency: row.currency,
    joiningTimeline: row.joining_timeline,
    relocationRequired: row.relocation_required,
    intakeAnswers: row.intake_answers ?? [],
    generatedDescription: row.generated_description,
    approvedDescription: row.approved_description,
    approvalNotes: row.approval_notes,
    createdBy: row.created_by,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at?.toISOString() ?? null,
    publishedAt: row.published_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class HrApprovalsRepository {
  async listPending(): Promise<Job[]> {
    const result = await query<JobApprovalRow>(
      "SELECT * FROM jobs WHERE status = 'PENDING_HR_APPROVAL' ORDER BY created_at ASC"
    );

    return result.rows.map(mapJob);
  }

  async applyDecision(params: {
    jobId: string;
    status: "APPROVED" | "REJECTED" | "PUBLISHED";
    approvedDescription?: string | null;
    approvalNotes?: string | null;
    reviewerId: string;
  }): Promise<Job | null> {
    const result = await query<JobApprovalRow>(
      `
        UPDATE jobs
        SET
          status = $2,
          approved_description = COALESCE($3, approved_description),
          approval_notes = $4,
          approved_by = $5,
          approved_at = CASE WHEN $2 IN ('APPROVED', 'PUBLISHED') THEN NOW() ELSE approved_at END,
          published_at = CASE WHEN $2 = 'PUBLISHED' THEN NOW() ELSE published_at END,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        params.jobId,
        params.status,
        params.approvedDescription ?? null,
        params.approvalNotes ?? null,
        params.reviewerId
      ]
    );

    return result.rows[0] ? mapJob(result.rows[0]) : null;
  }
}

export const hrApprovalsRepository = new HrApprovalsRepository();
