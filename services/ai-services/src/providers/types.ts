export type ModelProfile = "primary" | "fast" | "extraction";
export type ProviderName = "openai" | "mock";
export type ReasoningEffort = "minimal" | "low" | "medium" | "high";

export interface StructuredAiRequest<T> {
  taskName: string;
  systemPrompt: string;
  userPrompt: string;
  outputSchema: unknown;
  mockFactory: () => T;
  modelProfile?: ModelProfile;
  reasoningEffort?: ReasoningEffort;
}

export interface StructuredAiResponse<T> {
  data: T;
  provider: ProviderName;
  model: string;
  mock: boolean;
  responseId?: string;
}

export interface StructuredAiProvider {
  generateObject<T>(request: StructuredAiRequest<T>): Promise<StructuredAiResponse<T>>;
}
