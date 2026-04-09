import type { StructuredAiProvider, StructuredAiRequest, StructuredAiResponse } from "./types.js";

export class MockStructuredAiProvider implements StructuredAiProvider {
  async generateObject<T>(request: StructuredAiRequest<T>): Promise<StructuredAiResponse<T>> {
    const data = request.mockFactory();

    return {
      data,
      provider: "mock",
      model: "mock-local",
      mock: true
    };
  }
}
