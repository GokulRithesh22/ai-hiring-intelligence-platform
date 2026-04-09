INSERT INTO users (email, full_name, role)
VALUES
  ('manager@aihiring.local', 'Demo Hiring Manager', 'MANAGER'),
  ('hr@aihiring.local', 'Demo HR Reviewer', 'HR'),
  ('recruiter@aihiring.local', 'Demo Recruiter', 'RECRUITER')
ON CONFLICT (email) DO NOTHING;
