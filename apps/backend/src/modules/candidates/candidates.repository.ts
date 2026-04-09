import { query } from "@ai-hiring/database";
import type { Candidate, CreateCandidateInput } from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

interface CandidateRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  resume_file_url: string | null;
  resume_text: string | null;
  current_location: string | null;
  total_experience_years: string | null;
  current_company: string | null;
  source: Candidate["source"];
  permanent_profile: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

function mapCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    linkedinUrl: row.linkedin_url,
    resumeFileUrl: row.resume_file_url,
    resumeText: row.resume_text,
    currentLocation: row.current_location,
    totalExperienceYears: toNumber(row.total_experience_years),
    currentCompany: row.current_company,
    source: row.source,
    permanentProfile: row.permanent_profile ?? {},
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export class CandidatesRepository {
  async list(): Promise<Candidate[]> {
    const result = await query<CandidateRow>("SELECT * FROM candidates ORDER BY created_at DESC");
    return result.rows.map(mapCandidate);
  }

  async findById(candidateId: string): Promise<Candidate | null> {
    const result = await query<CandidateRow>("SELECT * FROM candidates WHERE id = $1 LIMIT 1", [candidateId]);
    return result.rows[0] ? mapCandidate(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const result = await query<CandidateRow>("SELECT * FROM candidates WHERE email = $1 LIMIT 1", [email]);
    return result.rows[0] ? mapCandidate(result.rows[0]) : null;
  }

  async create(input: CreateCandidateInput): Promise<Candidate> {
    const result = await query<CandidateRow>(
      `
        INSERT INTO candidates (
          full_name,
          email,
          phone,
          linkedin_url,
          resume_file_url,
          resume_text,
          current_location,
          total_experience_years,
          current_company,
          source,
          permanent_profile
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
        RETURNING *
      `,
      [
        input.fullName,
        input.email,
        input.phone ?? null,
        input.linkedinUrl ?? null,
        input.resumeFileUrl ?? null,
        input.resumeText ?? null,
        input.currentLocation ?? null,
        input.totalExperienceYears ?? null,
        input.currentCompany ?? null,
        input.source ?? "CAREERS_PAGE",
        JSON.stringify(input.permanentProfile ?? {})
      ]
    );

    return mapCandidate(result.rows[0]);
  }

  async update(candidateId: string, input: Partial<CreateCandidateInput>): Promise<Candidate | null> {
    const existing = await this.findById(candidateId);
    if (!existing) {
      return null;
    }

    const result = await query<CandidateRow>(
      `
        UPDATE candidates
        SET
          full_name = $2,
          phone = $3,
          linkedin_url = $4,
          resume_file_url = $5,
          resume_text = $6,
          current_location = $7,
          total_experience_years = $8,
          current_company = $9,
          permanent_profile = $10::jsonb,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        candidateId,
        input.fullName ?? existing.fullName,
        input.phone ?? existing.phone,
        input.linkedinUrl ?? existing.linkedinUrl,
        input.resumeFileUrl ?? existing.resumeFileUrl,
        input.resumeText ?? existing.resumeText,
        input.currentLocation ?? existing.currentLocation,
        input.totalExperienceYears ?? existing.totalExperienceYears,
        input.currentCompany ?? existing.currentCompany,
        JSON.stringify({
          ...existing.permanentProfile,
          ...(input.permanentProfile ?? {})
        })
      ]
    );

    return result.rows[0] ? mapCandidate(result.rows[0]) : null;
  }
}

export const candidatesRepository = new CandidatesRepository();
