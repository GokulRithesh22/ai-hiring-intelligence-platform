export type LinkedInEmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "TEMPORARY"
  | "INTERNSHIP";

export type LinkedInWorkplaceType = "ONSITE" | "HYBRID" | "REMOTE";

export type LinkedInCompensationPeriod = "YEARLY" | "MONTHLY" | "WEEKLY" | "HOURLY";

export interface LinkedInCompensation {
  currency: string;
  minAmount?: number;
  maxAmount?: number;
  period: LinkedInCompensationPeriod;
}

export interface LinkedInJobPostInput {
  tenantId: string;
  jobId: string;
  title: string;
  description: string;
  applicationUrl: string;
  companyName: string;
  location: string;
  department?: string;
  employmentType?: LinkedInEmploymentType;
  workplaceType?: LinkedInWorkplaceType;
  experienceLevel?: string;
  skills?: string[];
  compensation?: LinkedInCompensation;
  metadata?: Record<string, string>;
  listedAt?: string;
  expiresAt?: string;
}

export interface LinkedInExternalApplyMethod {
  type: "EXTERNAL";
  url: string;
  easyApplyEnabled: false;
}

export interface LinkedInJobPostingPayload {
  sourceSystem: string;
  externalJobId: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  department?: string;
  employmentType: LinkedInEmploymentType;
  workplaceType: LinkedInWorkplaceType;
  experienceLevel?: string;
  skills: string[];
  compensation?: LinkedInCompensation;
  applicationMethod: LinkedInExternalApplyMethod;
  listedAt: string;
  expiresAt?: string;
  metadata: Record<string, string>;
}

export interface LinkedInPostingDraft {
  provider: string;
  payload: LinkedInJobPostingPayload;
  warnings: string[];
}

export interface LinkedInJobProvider {
  createExternalPostingDraft(
    input: LinkedInJobPostInput
  ): Promise<LinkedInPostingDraft>;
  validateExternalApplyUrl(url: string): string;
}
