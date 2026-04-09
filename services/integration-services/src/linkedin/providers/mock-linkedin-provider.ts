import { BaseLinkedInJobProvider } from "../linkedin-provider.js";
import type { LinkedInJobPostInput, LinkedInPostingDraft } from "../types.js";

export class MockLinkedInProvider extends BaseLinkedInJobProvider {
  async createExternalPostingDraft(
    input: LinkedInJobPostInput
  ): Promise<LinkedInPostingDraft> {
    return {
      provider: "mock-linkedin",
      payload: this.buildPayload(input),
      warnings: [
        "Mock LinkedIn provider generated a draft payload only. No external publishing call was made."
      ]
    };
  }
}
