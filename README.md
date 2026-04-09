# AI Hiring Intelligence Platform

Production-oriented SaaS monorepo for AI-assisted hiring workflows:

- AI-guided job creation and JD generation
- HR approval and LinkedIn external-apply publishing
- Candidate application portal with resume upload and qualification filtering
- AI interview sessions and candidate intelligence profiles
- Email automation and cloud storage abstractions

## Monorepo

- `apps/frontend`: Next.js product surfaces
- `apps/backend`: Express API and workflow orchestration
- `services/ai-services`: OpenAI-ready screening and interview intelligence
- `services/integration-services`: LinkedIn, email, and storage adapters
- `packages/database`: PostgreSQL schema and helpers
- `packages/shared-types`: shared contracts

## Quick Start

1. Copy `.env.example` to `.env` and adjust values.
2. Install dependencies with `npm install`.
3. Start PostgreSQL with `docker compose up postgres -d`.
4. Run database migration/seed from `packages/database`.
5. Start the frontend and backend workspaces.

Architecture deliverables live in `docs/architecture.md`.

## Recommended Deployment

- Database and storage: Supabase
- Frontend: Vercel
- Backend API: Render

See `docs/deploy-supabase-vercel-render.md` for the repo-specific deployment flow.
