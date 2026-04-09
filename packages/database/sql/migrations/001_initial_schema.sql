CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('MANAGER', 'HR', 'RECRUITER', 'ADMIN');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type') THEN
    CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('DRAFT', 'PENDING_HR_APPROVAL', 'APPROVED', 'PAUSED', 'REJECTED', 'PUBLISHED', 'CLOSED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_source') THEN
    CREATE TYPE candidate_source AS ENUM ('CAREERS_PAGE', 'LINKEDIN', 'REFERRAL', 'DIRECT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM ('APPLIED', 'SCREENING_FAILED', 'QUALIFICATION_FAILED', 'INTERVIEW_PENDING', 'INTERVIEW_COMPLETED', 'SHORTLISTED', 'REJECTED', 'HIRED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_status') THEN
    CREATE TYPE interview_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_event_type') THEN
    CREATE TYPE email_event_type AS ENUM ('APPLICATION_RECEIVED', 'INTERVIEW_INVITE', 'INTERVIEW_COMPLETED', 'CANDIDATE_SHORTLISTED', 'CANDIDATE_REJECTED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_delivery_status') THEN
    CREATE TYPE email_delivery_status AS ENUM ('PENDING', 'SENT', 'FAILED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type employment_type NOT NULL DEFAULT 'FULL_TIME',
  status job_status NOT NULL DEFAULT 'DRAFT',
  min_experience_years NUMERIC(4, 1),
  salary_min NUMERIC(12, 2),
  salary_max NUMERIC(12, 2),
  currency TEXT,
  joining_timeline TEXT,
  relocation_required BOOLEAN NOT NULL DEFAULT FALSE,
  intake_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_description TEXT NOT NULL,
  approved_description TEXT,
  approval_notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  resume_file_url TEXT,
  resume_text TEXT,
  current_location TEXT,
  total_experience_years NUMERIC(4, 1),
  current_company TEXT,
  source candidate_source NOT NULL DEFAULT 'CAREERS_PAGE',
  permanent_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'APPLIED',
  resume_match_score NUMERIC(5, 2),
  qualification_passed BOOLEAN,
  qualification_answers JSONB,
  interview_score NUMERIC(5, 2),
  screening_decision_reason TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  status interview_status NOT NULL DEFAULT 'NOT_STARTED',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  communication_score NUMERIC(5, 2),
  knowledge_score NUMERIC(5, 2),
  confidence_score NUMERIC(5, 2),
  overall_score NUMERIC(5, 2),
  summary TEXT,
  transcript TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  evaluation_score NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL UNIQUE REFERENCES candidates(id) ON DELETE CASCADE,
  latest_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  resume_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  linkedin_insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  interview_transcript TEXT,
  evaluation_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  claim_verification_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_manager_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  hiring_recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
  event_type email_event_type NOT NULL,
  recipient_email TEXT NOT NULL,
  provider_message_id TEXT,
  status email_delivery_status NOT NULL DEFAULT 'PENDING',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_interview_items_session_id ON interview_items(session_id);
CREATE INDEX IF NOT EXISTS idx_email_events_application_id ON email_events(application_id);
CREATE INDEX IF NOT EXISTS idx_candidate_insights_candidate_id ON candidate_insights(candidate_id);
