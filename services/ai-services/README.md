# AI Hiring Intelligence Service

AI service layer for the hiring platform monorepo. This package owns:

- AI-led job intake and job description drafting
- Resume screening and match scoring
- Deterministic qualification evaluation
- AI interview question generation
- AI interview evaluation
- Candidate intelligence report assembly
- Manager interview question suggestions

## Runtime modes

- `AI_PROVIDER=openai`: use OpenAI Responses API with structured outputs
- `AI_PROVIDER=openrouter`: use an OpenAI-compatible provider such as OpenRouter for text-based AI tasks
- `AI_PROVIDER=mock`: use deterministic local mocks for offline development
- `AI_PROVIDER=auto`: use OpenAI when `OPENAI_API_KEY` exists, otherwise fall back to mock

## Install

```bash
npm install
```

## Scripts

```bash
npm run build
npm run typecheck
```

## Usage

```ts
import { createAIHiringIntelligenceService } from "./src/index.js";

const service = createAIHiringIntelligenceService();

const draft = await service.generateJobDescription({
  jobTitle: "Growth Marketing Manager",
  businessProblem: "Own paid growth efficiency and pipeline quality.",
  requiredSkills: ["Performance marketing", "Attribution", "Lifecycle campaigns"],
  experienceLevel: "mid_senior",
  successOutcomes: ["Reduce CAC by 15%", "Improve lead-to-demo conversion"]
});
```

## Integration notes

- Backend services should call the orchestration methods from this package instead of wiring prompts directly.
- Qualification gating is intentionally deterministic so HR policies remain auditable.
- Resume pass/fail uses `RESUME_PASS_THRESHOLD`, defaulting to `70`.
- Every AI task returns provider metadata so downstream services can log whether the result came from OpenAI or mock mode.

## OpenAI integration

The OpenAI provider uses the official Node SDK Responses API with structured outputs. Models are environment-configurable so the backend can route high-volume tasks to a faster model and final reports to a higher-capability model.

## OpenRouter usage

For OpenRouter-backed text features, set:

- `AI_PROVIDER=openrouter`
- `OPENAI_API_KEY=<your openrouter key>`
- `OPENAI_BASE_URL=https://openrouter.ai/api/v1`
- `AI_MODEL_PRIMARY=<openrouter model id>`
- `AI_MODEL_FAST=<openrouter model id>`
- `AI_MODEL_EXTRACTION=<openrouter model id>`

Optional but recommended:

- `APP_BASE_URL=<your frontend url>`
- `APP_TITLE=AI Hiring Intelligence Platform`

Use direct OpenAI later for Realtime voice features.
