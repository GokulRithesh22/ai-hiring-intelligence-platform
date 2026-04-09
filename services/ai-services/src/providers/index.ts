import type { AiServiceConfig } from "../config/env.js";
import { MockStructuredAiProvider } from "./mock-provider.js";
import { OpenAiStructuredProvider } from "./openai-provider.js";
import type { StructuredAiProvider, StructuredAiRequest, StructuredAiResponse } from "./types.js";

class FallbackStructuredAiProvider implements StructuredAiProvider {
  constructor(
    private readonly primary: StructuredAiProvider,
    private readonly fallback: StructuredAiProvider
  ) {}

  async generateObject<T>(request: StructuredAiRequest<T>): Promise<StructuredAiResponse<T>> {
    try {
      return await this.primary.generateObject(request);
    } catch {
      return this.fallback.generateObject(request);
    }
  }
}

export function createStructuredAiProvider(config: AiServiceConfig): StructuredAiProvider {
  const mockProvider = new MockStructuredAiProvider();

  if (config.provider === "mock") {
    return mockProvider;
  }

  if (config.provider === "openai") {
    return new OpenAiStructuredProvider(config);
  }

  if (!config.openAiApiKey) {
    return mockProvider;
  }

  const openAiProvider = new OpenAiStructuredProvider(config);
  return config.enableMockFallback
    ? new FallbackStructuredAiProvider(openAiProvider, mockProvider)
    : openAiProvider;
}

export * from "./types.js";
