import type { ModelProfile, ReasoningEffort } from "../providers/types.js";

export type ProviderMode = "auto" | "openai" | "openrouter" | "mock";

export interface AiServiceConfig {
  provider: ProviderMode;
  openAiApiKey?: string;
  openAiBaseUrl?: string;
  openAiOrganization?: string;
  openAiProject?: string;
  appBaseUrl?: string;
  appTitle?: string;
  models: Record<ModelProfile, string>;
  reasoningEffort: ReasoningEffort;
  enableMockFallback: boolean;
  resumePassThreshold: number;
}

export function loadAiServiceConfig(env: NodeJS.ProcessEnv = process.env): AiServiceConfig {
  return {
    provider: parseProvider(env.AI_PROVIDER),
    models: {
      primary: env.AI_MODEL_PRIMARY || "gpt-5.4",
      fast: env.AI_MODEL_FAST || "gpt-5.4-mini",
      extraction: env.AI_MODEL_EXTRACTION || "gpt-5.4-nano"
    },
    reasoningEffort: parseReasoningEffort(env.AI_REASONING_EFFORT),
    enableMockFallback: parseBoolean(env.AI_ENABLE_MOCK_FALLBACK, true),
    resumePassThreshold: parseNumber(env.RESUME_PASS_THRESHOLD, 70),
    ...(env.OPENAI_API_KEY ? { openAiApiKey: env.OPENAI_API_KEY } : {}),
    ...(env.OPENAI_BASE_URL ? { openAiBaseUrl: env.OPENAI_BASE_URL } : {}),
    ...(env.OPENAI_ORGANIZATION ? { openAiOrganization: env.OPENAI_ORGANIZATION } : {}),
    ...(env.OPENAI_PROJECT ? { openAiProject: env.OPENAI_PROJECT } : {}),
    ...(env.APP_BASE_URL ? { appBaseUrl: env.APP_BASE_URL } : {}),
    ...(env.APP_TITLE ? { appTitle: env.APP_TITLE } : {})
  };
}

function parseProvider(value: string | undefined): ProviderMode {
  if (value === "openai" || value === "openrouter" || value === "mock" || value === "auto") {
    return value;
  }

  return "auto";
}

function parseReasoningEffort(value: string | undefined): ReasoningEffort {
  if (value === "minimal" || value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
