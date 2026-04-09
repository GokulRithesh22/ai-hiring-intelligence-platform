CREATE TABLE IF NOT EXISTS candidate_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  role_capability NUMERIC(5, 2) NOT NULL,
  thinking_behavior NUMERIC(5, 2) NOT NULL,
  impact NUMERIC(5, 2) NOT NULL,
  transferability NUMERIC(5, 2) NOT NULL,
  potential NUMERIC(5, 2) NOT NULL,
  final_score NUMERIC(5, 2) NOT NULL,
  confidence_score NUMERIC(4, 3) NOT NULL,
  confidence_label TEXT NOT NULL,
  summary TEXT,
  recommendation TEXT,
  component_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  interview_item_id UUID REFERENCES interview_items(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  rationale TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_scores_candidate_id ON candidate_scores(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_scores_job_id ON candidate_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_interview_evaluations_session_id ON interview_evaluations(session_id);
