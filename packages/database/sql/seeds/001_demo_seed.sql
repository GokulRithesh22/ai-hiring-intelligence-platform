INSERT INTO users (email, full_name, role)
VALUES
  ('recruiter@aihiring.local', 'Demo Recruiter', 'RECRUITER'),
  ('ops@aihiring.local', 'Demo Recruiting Ops', 'RECRUITER'),
  ('admin@aihiring.local', 'Demo Admin', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
