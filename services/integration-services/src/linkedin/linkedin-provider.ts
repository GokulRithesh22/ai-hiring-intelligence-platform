import { createTimestamp } from "../shared/id.js";
import type {
  LinkedInEmploymentType,
  LinkedInJobPostInput,
  LinkedInJobPostingPayload,
  LinkedInJobProvider,
  LinkedInWorkplaceType
} from "./types.js";

export interface BaseLinkedInProviderOptions {
  sourceSystem: string;
  externalApplyBaseUrl?: string;
}

export abstract class BaseLinkedInJobProvider implements LinkedInJobProvider {
  constructor(protected readonly options: BaseLinkedInProviderOptions) {}

  abstract createExternalPostingDraft(input: LinkedInJobPostInput): Promise<{
    provider: string;
    payload: LinkedInJobPostingPayload;
    warnings: string[];
  }>;

  validateExternalApplyUrl(url: string): string {
    const resolvedUrl = this.resolveApplyUrl(url);
    const parsedUrl = new URL(resolvedUrl);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("LinkedIn application URL must use http or https.");
    }

    if (
      parsedUrl.protocol !== "https:" &&
      parsedUrl.hostname !== "localhost" &&
      parsedUrl.hostname !== "127.0.0.1"
    ) {
      throw new Error("LinkedIn application URL must use https outside local development.");
    }

    if (parsedUrl.hostname.includes("linkedin.com")) {
      throw new Error(
        "LinkedIn postings must use an external application URL, not a LinkedIn-hosted apply flow."
      );
    }

    return parsedUrl.toString();
  }

  protected buildPayload(input: LinkedInJobPostInput): LinkedInJobPostingPayload {
    return {
      sourceSystem: this.options.sourceSystem,
      externalJobId: input.jobId,
      title: input.title.trim(),
      description: input.description.trim(),
      companyName: input.companyName.trim(),
      location: input.location.trim(),
      department: input.department?.trim(),
      employmentType: input.employmentType ?? defaultEmploymentType(),
      workplaceType: input.workplaceType ?? defaultWorkplaceType(),
      experienceLevel: input.experienceLevel?.trim(),
      skills: input.skills?.map((skill) => skill.trim()).filter(Boolean) ?? [],
      compensation: input.compensation,
      applicationMethod: {
        type: "EXTERNAL",
        url: this.validateExternalApplyUrl(input.applicationUrl),
        easyApplyEnabled: false
      },
      listedAt: input.listedAt ?? createTimestamp(),
      expiresAt: input.expiresAt,
      metadata: {
        tenantId: input.tenantId,
        ...(input.metadata ?? {})
      }
    };
  }

  private resolveApplyUrl(url: string): string {
    try {
      return new URL(url).toString();
    } catch {
      if (!this.options.externalApplyBaseUrl) {
        throw new Error(
          "Received a relative LinkedIn application URL without LINKEDIN_EXTERNAL_APPLY_BASE_URL configured."
        );
      }

      return new URL(url, this.options.externalApplyBaseUrl).toString();
    }
  }
}

function defaultEmploymentType(): LinkedInEmploymentType {
  return "FULL_TIME";
}

function defaultWorkplaceType(): LinkedInWorkplaceType {
  return "HYBRID";
}
