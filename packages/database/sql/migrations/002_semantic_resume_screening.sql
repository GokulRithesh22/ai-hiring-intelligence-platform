ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS structured_analysis JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS expected_ctc NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS joining_date DATE;

CREATE TABLE IF NOT EXISTS screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  semantic_similarity NUMERIC(5, 2) NOT NULL DEFAULT 0,
  experience_match NUMERIC(5, 2) NOT NULL DEFAULT 0,
  skills_match NUMERIC(5, 2) NOT NULL DEFAULT 0,
  domain_match NUMERIC(5, 2) NOT NULL DEFAULT 0,
  achievements_match NUMERIC(5, 2) NOT NULL DEFAULT 0,
  final_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  resume_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  job_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  reasoning_summary TEXT,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screening_results_application_id
ON screening_results(application_id);

CREATE INDEX IF NOT EXISTS idx_screening_results_candidate_id
ON screening_results(candidate_id);

CREATE INDEX IF NOT EXISTS idx_screening_results_job_id
ON screening_results(job_id);
