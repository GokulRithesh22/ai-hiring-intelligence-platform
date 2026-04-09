import { query } from "@ai-hiring/database";
import type { CreateJobInput, Job, JobIntakeAnswer, JobStatus } from "@ai-hiring/shared-types";

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
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
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
          created_by
        )
        VALUES ($1, $2, $3, $4, 'DRAFT', $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13)
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
}

export const jobsRepository = new JobsRepository();
