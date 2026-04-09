import { query } from "@ai-hiring/database";
import type {
  CreateJobInput,
  Job,
  JobIntakeAnswer,
  JobStatus,
  ManagerJobCandidateEntry,
  ManagerJobDashboardItem
} from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

interface JobRow {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: Job["employmentType"];
  status: JobStatus;
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
  structured_analysis: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

function mapJob(row: JobRow): Job {
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
    structuredAnalysis: row.structured_analysis ?? {},
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

interface ManagerJobDashboardRow extends JobRow {
  applicants_count: number;
  shortlisted_count: number;
  applied_count: number;
  screening_failed_count: number;
  qualification_failed_count: number;
  interview_pending_count: number;
  interview_completed_count: number;
  rejected_count: number;
  hired_count: number;
}

interface ManagerJobCandidateRow {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  current_company: string | null;
  current_title: string | null;
  status: string;
  resume_score: string | null;
  interview_score: string | null;
  hiring_recommendation: string | null;
}

function mapManagerJobDashboardItem(row: ManagerJobDashboardRow): ManagerJobDashboardItem {
  const description =
    row.approved_description ?? row.generated_description ?? "Draft description in progress.";

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    location: row.location,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    applicantsCount: row.applicants_count ?? 0,
    shortlistedCount: row.shortlisted_count ?? 0,
    descriptionPreview: description.slice(0, 220),
    pipelineDistribution: [
      { status: "APPLIED", label: "Applied", count: row.applied_count ?? 0 },
      { status: "SCREENING_FAILED", label: "Screened out", count: row.screening_failed_count ?? 0 },
      {
        status: "QUALIFICATION_FAILED",
        label: "Qualification blocked",
        count: row.qualification_failed_count ?? 0
      },
      {
        status: "INTERVIEW_PENDING",
        label: "AI interview queued",
        count: row.interview_pending_count ?? 0
      },
      {
        status: "INTERVIEW_COMPLETED",
        label: "Interview complete",
        count: row.interview_completed_count ?? 0
      },
      { status: "SHORTLISTED", label: "Shortlisted", count: row.shortlisted_count ?? 0 },
      { status: "REJECTED", label: "Rejected", count: row.rejected_count ?? 0 },
      { status: "HIRED", label: "Hired", count: row.hired_count ?? 0 }
    ]
  };
}

function mapManagerJobCandidate(row: ManagerJobCandidateRow): ManagerJobCandidateEntry {
  return {
    applicationId: row.application_id,
    candidateId: row.candidate_id,
    candidateName: row.candidate_name,
    currentCompany: row.current_company,
    currentTitle: row.current_title,
    status: row.status as ManagerJobCandidateEntry["status"],
    resumeScore: toNumber(row.resume_score),
    interviewScore: toNumber(row.interview_score),
    insightSummary:
      row.hiring_recommendation ??
      "Candidate intelligence is available for resume, interview, and application history review."
  };
}

export class JobsRepository {
  async list(): Promise<Job[]> {
    const result = await query<JobRow>("SELECT * FROM jobs ORDER BY created_at DESC");
    return result.rows.map(mapJob);
  }

  async findById(jobId: string): Promise<Job | null> {
    const result = await query<JobRow>("SELECT * FROM jobs WHERE id = $1 LIMIT 1", [jobId]);
    return result.rows[0] ? mapJob(result.rows[0]) : null;
  }

  async create(input: CreateJobInput, createdBy: string): Promise<Job> {
    const result = await query<JobRow>(
      `
        INSERT INTO jobs (
          title,
          department,
          location,
          employment_type,
          status,
          min_experience_years,
          salary_min,
          salary_max,
          currency,
          joining_timeline,
          relocation_required,
          intake_answers,
          generated_description,
          structured_analysis,
          created_by
        )
        VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13::jsonb, $14)
        RETURNING *
      `,
      [
        input.title,
        input.department ?? null,
        input.location ?? null,
        input.employmentType ?? "FULL_TIME",
        input.minExperienceYears ?? null,
        input.salaryMin ?? null,
        input.salaryMax ?? null,
        input.currency ?? null,
        input.joiningTimeline ?? null,
        input.relocationRequired ?? false,
        JSON.stringify(input.intakeAnswers ?? []),
        input.generatedDescription,
        JSON.stringify({}),
        createdBy
      ]
    );

    return mapJob(result.rows[0]);
  }

  async updateIntake(jobId: string, answers: JobIntakeAnswer[]): Promise<Job | null> {
    const result = await query<JobRow>(
      `
        UPDATE jobs
        SET intake_answers = $2::jsonb, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [jobId, JSON.stringify(answers)]
    );

    return result.rows[0] ? mapJob(result.rows[0]) : null;
  }

  async updateDescription(jobId: string, description: string): Promise<Job | null> {
    const result = await query<JobRow>(
      `
        UPDATE jobs
        SET generated_description = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [jobId, description]
    );

    return result.rows[0] ? mapJob(result.rows[0]) : null;
  }

  async updateStructuredAnalysis(
    jobId: string,
    structuredAnalysis: Record<string, unknown>
  ): Promise<Job | null> {
    const result = await query<JobRow>(
      `
        UPDATE jobs
        SET structured_analysis = $2::jsonb, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [jobId, JSON.stringify(structuredAnalysis)]
    );

    return result.rows[0] ? mapJob(result.rows[0]) : null;
  }

  async updateStatus(jobId: string, status: JobStatus): Promise<Job | null> {
    const result = await query<JobRow>(
      `
        UPDATE jobs
        SET status = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [jobId, status]
    );

    return result.rows[0] ? mapJob(result.rows[0]) : null;
  }

  async listPublic(): Promise<Job[]> {
    const result = await query<JobRow>(
      "SELECT * FROM jobs WHERE status IN ('APPROVED', 'PUBLISHED') ORDER BY created_at DESC"
    );

    return result.rows.map(mapJob);
  }

  async listManagerDashboardJobs(createdBy: string): Promise<ManagerJobDashboardItem[]> {
    const result = await query<ManagerJobDashboardRow>(
      `
        SELECT
          j.*,
          COALESCE(stats.applicants_count, 0) AS applicants_count,
          COALESCE(stats.shortlisted_count, 0) AS shortlisted_count,
          COALESCE(stats.applied_count, 0) AS applied_count,
          COALESCE(stats.screening_failed_count, 0) AS screening_failed_count,
          COALESCE(stats.qualification_failed_count, 0) AS qualification_failed_count,
          COALESCE(stats.interview_pending_count, 0) AS interview_pending_count,
          COALESCE(stats.interview_completed_count, 0) AS interview_completed_count,
          COALESCE(stats.rejected_count, 0) AS rejected_count,
          COALESCE(stats.hired_count, 0) AS hired_count
        FROM jobs j
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*)::int AS applicants_count,
            COUNT(*) FILTER (WHERE a.status = 'SHORTLISTED')::int AS shortlisted_count,
            COUNT(*) FILTER (WHERE a.status = 'APPLIED')::int AS applied_count,
            COUNT(*) FILTER (WHERE a.status = 'SCREENING_FAILED')::int AS screening_failed_count,
            COUNT(*) FILTER (WHERE a.status = 'QUALIFICATION_FAILED')::int AS qualification_failed_count,
            COUNT(*) FILTER (WHERE a.status = 'INTERVIEW_PENDING')::int AS interview_pending_count,
            COUNT(*) FILTER (WHERE a.status = 'INTERVIEW_COMPLETED')::int AS interview_completed_count,
            COUNT(*) FILTER (WHERE a.status = 'REJECTED')::int AS rejected_count,
            COUNT(*) FILTER (WHERE a.status = 'HIRED')::int AS hired_count
          FROM applications a
          WHERE a.job_id = j.id
        ) stats ON true
        WHERE j.created_by = $1
        ORDER BY j.updated_at DESC
      `,
      [createdBy]
    );

    return result.rows.map(mapManagerJobDashboardItem);
  }

  async findManagerDashboardJob(jobId: string, createdBy: string): Promise<ManagerJobDashboardItem | null> {
    const result = await query<ManagerJobDashboardRow>(
      `
        SELECT
          j.*,
          COALESCE(stats.applicants_count, 0) AS applicants_count,
          COALESCE(stats.shortlisted_count, 0) AS shortlisted_count,
          COALESCE(stats.applied_count, 0) AS applied_count,
          COALESCE(stats.screening_failed_count, 0) AS screening_failed_count,
          COALESCE(stats.qualification_failed_count, 0) AS qualification_failed_count,
          COALESCE(stats.interview_pending_count, 0) AS interview_pending_count,
          COALESCE(stats.interview_completed_count, 0) AS interview_completed_count,
          COALESCE(stats.rejected_count, 0) AS rejected_count,
          COALESCE(stats.hired_count, 0) AS hired_count
        FROM jobs j
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*)::int AS applicants_count,
            COUNT(*) FILTER (WHERE a.status = 'SHORTLISTED')::int AS shortlisted_count,
            COUNT(*) FILTER (WHERE a.status = 'APPLIED')::int AS applied_count,
            COUNT(*) FILTER (WHERE a.status = 'SCREENING_FAILED')::int AS screening_failed_count,
            COUNT(*) FILTER (WHERE a.status = 'QUALIFICATION_FAILED')::int AS qualification_failed_count,
            COUNT(*) FILTER (WHERE a.status = 'INTERVIEW_PENDING')::int AS interview_pending_count,
            COUNT(*) FILTER (WHERE a.status = 'INTERVIEW_COMPLETED')::int AS interview_completed_count,
            COUNT(*) FILTER (WHERE a.status = 'REJECTED')::int AS rejected_count,
            COUNT(*) FILTER (WHERE a.status = 'HIRED')::int AS hired_count
          FROM applications a
          WHERE a.job_id = j.id
        ) stats ON true
        WHERE j.id = $1 AND j.created_by = $2
        LIMIT 1
      `,
      [jobId, createdBy]
    );

    return result.rows[0] ? mapManagerJobDashboardItem(result.rows[0]) : null;
  }

  async listManagerJobCandidates(jobId: string): Promise<ManagerJobCandidateEntry[]> {
    const result = await query<ManagerJobCandidateRow>(
      `
        SELECT
          a.id AS application_id,
          c.id AS candidate_id,
          c.full_name AS candidate_name,
          c.current_company,
          COALESCE(c.permanent_profile ->> 'currentTitle', NULL) AS current_title,
          a.status,
          a.resume_match_score AS resume_score,
          a.interview_score,
          ci.hiring_recommendation
        FROM applications a
        INNER JOIN candidates c ON c.id = a.candidate_id
        LEFT JOIN candidate_insights ci ON ci.candidate_id = c.id
        WHERE a.job_id = $1
        ORDER BY
          CASE a.status
            WHEN 'SHORTLISTED' THEN 1
            WHEN 'INTERVIEW_COMPLETED' THEN 2
            WHEN 'INTERVIEW_PENDING' THEN 3
            WHEN 'APPLIED' THEN 4
            WHEN 'QUALIFICATION_FAILED' THEN 5
            WHEN 'SCREENING_FAILED' THEN 6
            WHEN 'REJECTED' THEN 7
            ELSE 8
          END,
          a.applied_at DESC
        LIMIT 12
      `,
      [jobId]
    );

    return result.rows.map(mapManagerJobCandidate);
  }
}

export const jobsRepository = new JobsRepository();
