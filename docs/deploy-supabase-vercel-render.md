# Supabase + Vercel + Render Deployment Guide

This guide maps the current monorepo to the recommended production setup:

- Supabase: PostgreSQL and optional Storage/Auth
- Vercel: `apps/frontend`
- Render: `apps/backend`

## 1. Create Supabase Project

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run the schema from [001_initial_schema.sql](/Users/gokul.rithesh/Documents/New project/packages/database/sql/migrations/001_initial_schema.sql).
4. Optionally run the demo seed from [001_demo_seed.sql](/Users/gokul.rithesh/Documents/New project/packages/database/sql/seeds/001_demo_seed.sql).

### Database URL to use

For the Render-hosted backend, use the Supabase pooler connection string in session mode for a persistent Node server. In Supabase, open `Connect` and copy the pooler string.

Set it as:

- `DATABASE_URL=postgresql://...pooler.supabase.com:5432/postgres`

## 2. Deploy Backend to Render

This repo includes a Blueprint at [render.yaml](/Users/gokul.rithesh/Documents/New project/render.yaml).

### Render setup

1. Push this repository to GitHub/GitLab.
2. In Render, choose `New > Blueprint`.
3. Connect the repo.
4. Render will detect `render.yaml`.
5. Fill the prompted secret values:
   - `DATABASE_URL`
   - `CORS_ORIGIN`
   - `EMAIL_FROM`
   - `OPENAI_API_KEY`
   - any provider keys you actually use
6. Deploy the Blueprint.

### Backend env values

Minimum values to get the API up:

- `DATABASE_URL`: Supabase session pooler connection string
- `CORS_ORIGIN`: your Vercel frontend URL
- `EMAIL_FROM`: sender address

Optional for live features:

- `OPENAI_API_KEY`
- `EMAIL_PROVIDER_API_KEY`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI`
- object storage keys if you are not replacing storage with Supabase Storage yet

### Health check

Render should use:

- `/api/health/ready`

## 3. Deploy Frontend to Vercel

### Vercel monorepo settings

Create a Vercel project from this same repo and set:

- Root Directory: `apps/frontend`
- Framework Preset: `Next.js`
- Node.js version: `20` or newer

### Frontend environment variables

Set these in Vercel:

- `NEXT_PUBLIC_API_MODE=live`
- `NEXT_PUBLIC_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`

The frontend env template is in [apps/frontend/.env.example](/Users/gokul.rithesh/Documents/New project/apps/frontend/.env.example).

## 4. Wire CORS and URLs

After Vercel gives you the frontend URL:

1. Add that URL to the Render backend as `CORS_ORIGIN`.
2. Redeploy the backend if needed.
3. Update any auth or redirect callback URLs once custom domains are added.

## 5. Optional Supabase Storage Migration

The current repo already has an abstract storage layer in:

- [object-storage-service.ts](/Users/gokul.rithesh/Documents/New project/services/integration-services/src/storage/object-storage-service.ts)

You can either:

- keep the S3-compatible abstraction and point it at another object store, or
- replace the storage adapter with a Supabase Storage implementation

## 6. Smoke Test Checklist

After deploy:

1. Open the frontend landing page.
2. Confirm backend health at `/api/health/ready`.
3. Create a demo session with `POST /api/auth/demo-session`.
4. Create a job with `POST /api/jobs`.
5. Submit intake and generate a JD.
6. Open the HR dashboard.
7. Submit a public application.
8. Run screening and interview completion endpoints.

## Platform Notes

- Vercel monorepos: set a separate project for the `apps/frontend` directory.
- Render Blueprint secrets: keys marked `sync: false` are prompted during first creation.
- Supabase connections: use a Postgres connection string from the project dashboard; for persistent servers, the pooler session mode is the right fit.

## Official Docs

- Vercel monorepos: [Using Monorepos](https://vercel.com/docs/monorepos)
- Vercel project settings: [Project settings](https://vercel.com/docs/project-configuration/project-settings)
- Render Blueprints: [Render Blueprints](https://render.com/docs/infrastructure-as-code)
- Render Blueprint spec: [Blueprint YAML Reference](https://render.com/docs/blueprint-spec)
- Render Node/Express deploys: [Deploy a Node Express App](https://render.com/docs/deploy-node-express-app)
- Supabase Postgres connections: [Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers)
