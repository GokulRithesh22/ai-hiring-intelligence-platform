import { BaseLinkedInJobProvider } from "../linkedin-provider.js";
import type { LinkedInJobPostInput, LinkedInPostingDraft } from "../types.js";

export class ExternalApplyLinkedInProvider extends BaseLinkedInJobProvider {
  async createExternalPostingDraft(
    input: LinkedInJobPostInput
  ): Promise<LinkedInPostingDraft> {
    return {
      provider: "linkedin-external",
      payload: this.buildPayload(input),
      warnings: []
    };
  }
}
