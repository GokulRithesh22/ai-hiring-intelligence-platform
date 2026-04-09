# Backend

Production-minded Express API for the AI Hiring Intelligence Platform.

## Implemented Domains

- `auth`: demo auth bootstrap for manager, HR, recruiter, and admin roles
- `jobs`: title-first draft creation, intake persistence, JD generation, and approval submission
- `hr-approvals`: pending queue review and decision workflow
- `public-jobs`: candidate-facing listings and application intake
- `candidates`: permanent candidate records
- `applications`: screening, qualification, interview start, shortlist, and rejection actions
- `interview-sessions`: question storage, transcript capture, and completion scoring
- `candidate-insights`: persistent intelligence report retrieval
- `dashboard`: HR summary metrics and candidate table
- `email-events`: email audit event retrieval
- `health`: liveness and readiness checks

## Key Routes

- `POST /api/auth/demo-session`
- `GET /api/auth/me`
- `GET /api/health`
- `GET /api/health/live`
- `GET /api/health/ready`
- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `POST /api/jobs`
- `POST /api/jobs/:jobId/intake`
- `POST /api/jobs/:jobId/generate-description`
- `POST /api/jobs/:jobId/submit-for-approval`
- `GET /api/hr/approvals/pending`
- `POST /api/hr/approvals/:jobId/decision`
- `GET /api/public/jobs`
- `GET /api/public/jobs/:jobId`
- `POST /api/public/jobs/:jobId/apply`
- `GET /api/candidates`
- `GET /api/candidates/:candidateId`
- `POST /api/candidates`
- `GET /api/applications`
- `GET /api/applications/:applicationId`
- `POST /api/applications`
- `POST /api/applications/:applicationId/screen-resume`
- `POST /api/applications/:applicationId/evaluate-qualification`
- `POST /api/applications/:applicationId/start-interview`
- `POST /api/applications/:applicationId/shortlist`
- `POST /api/applications/:applicationId/reject`
- `GET /api/interview-sessions/:sessionId`
- `POST /api/interview-sessions/:sessionId/complete`
- `GET /api/candidate-insights/:candidateId`
- `GET /api/email-events`
- `GET /api/dashboard/hr/summary`
- `GET /api/dashboard/hr/candidates`

## Demo Auth

Create a demo session and send the returned bearer token, or the `x-demo-user-id` plus `x-demo-role` headers, to protected endpoints.
