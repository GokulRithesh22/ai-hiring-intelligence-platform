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
