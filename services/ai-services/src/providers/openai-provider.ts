import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { AiServiceConfig } from "../config/env.js";
import type { ModelProfile, StructuredAiProvider, StructuredAiRequest, StructuredAiResponse } from "./types.js";

export class OpenAiStructuredProvider implements StructuredAiProvider {
  private readonly client: OpenAI;

  constructor(private readonly config: AiServiceConfig) {
    if (!config.openAiApiKey) {
      throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai.");
    }

    this.client = new OpenAI({
      apiKey: config.openAiApiKey,
      ...(config.openAiBaseUrl ? { baseURL: config.openAiBaseUrl } : {}),
      ...(config.openAiOrganization ? { organization: config.openAiOrganization } : {}),
      ...(config.openAiProject ? { project: config.openAiProject } : {})
    });
  }

  async generateObject<T>(request: StructuredAiRequest<T>): Promise<StructuredAiResponse<T>> {
    const model = this.resolveModel(request.modelProfile ?? "primary");
    const response = await this.client.responses.parse({
      model,
      reasoning: {
        effort: request.reasoningEffort ?? this.config.reasoningEffort
      },
      input: [
        {
          role: "system",
          content: request.systemPrompt
        },
        {
          role: "user",
          content: request.userPrompt
        }
      ],
      text: {
        format: zodTextFormat(request.outputSchema as never, request.taskName)
      },
      metadata: {
        service: "ai-hiring-intelligence",
        task: request.taskName
      }
    });

    const data = response.output_parsed;
    if (!data) {
      throw new Error(`OpenAI returned no parsed output for task ${request.taskName}.`);
    }

    return {
      data,
      provider: "openai",
      model,
      mock: false,
      responseId: response.id
    };
  }

  private resolveModel(profile: ModelProfile): string {
    return this.config.models[profile];
  }
}
