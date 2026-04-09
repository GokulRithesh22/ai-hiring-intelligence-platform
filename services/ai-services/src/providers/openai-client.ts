import OpenAI from "openai";

import { loadAiServiceConfig } from "../config/env.js";

export function createOpenAIClient() {
  const config = loadAiServiceConfig();
  if (!config.openAiApiKey) {
    return null;
  }

  return new OpenAI({
    apiKey: config.openAiApiKey,
    ...(config.openAiBaseUrl ? { baseURL: config.openAiBaseUrl } : {}),
    ...(config.openAiOrganization ? { organization: config.openAiOrganization } : {}),
    ...(config.openAiProject ? { project: config.openAiProject } : {})
  });
}
