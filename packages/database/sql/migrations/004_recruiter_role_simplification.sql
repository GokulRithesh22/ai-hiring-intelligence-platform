DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    BEGIN
      ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'PAUSED';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;

  UPDATE users
  SET role = 'RECRUITER'
  WHERE role IN ('MANAGER', 'HR');
END $$;
