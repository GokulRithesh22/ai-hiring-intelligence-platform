import type { EmailAutomationTrigger } from "../email/types.js";

const EMAIL_TRIGGER_ENV_KEYS: Record<EmailAutomationTrigger, string> = {
  "application.received": "EMAIL_TEMPLATE_APPLICATION_RECEIVED",
  "interview.invitation": "EMAIL_TEMPLATE_INTERVIEW_INVITATION",
  "interview.completed": "EMAIL_TEMPLATE_INTERVIEW_COMPLETED",
  "candidate.shortlisted": "EMAIL_TEMPLATE_CANDIDATE_SHORTLISTED",
  "candidate.rejected": "EMAIL_TEMPLATE_CANDIDATE_REJECTED"
};

export interface LinkedInIntegrationConfig {
  provider: "external" | "mock";
  externalApplyBaseUrl?: string;
  sourceSystem: string;
}

export interface EmailIntegrationConfig {
  provider: "resend" | "mock";
  fromAddress: string;
  fromName: string;
  replyTo?: string;
  companyName: string;
  resendApiKey?: string;
  templateIds: Partial<Record<EmailAutomationTrigger, string>>;
}

export interface StorageIntegrationConfig {
  provider: "s3" | "mock";
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicBaseUrl?: string;
  forcePathStyle: boolean;
  signedUrlTtlSeconds: number;
}

export interface IntegrationEnvironmentConfig {
  appBaseUrl?: string;
  linkedin: LinkedInIntegrationConfig;
  email: EmailIntegrationConfig;
  storage: StorageIntegrationConfig;
}

export function loadIntegrationEnvironmentConfig(
  env: NodeJS.ProcessEnv = process.env
): IntegrationEnvironmentConfig {
  const linkedinProvider = readEnum(env.LINKEDIN_PROVIDER, ["external", "mock"], "external");
  const emailProvider = readEnum(env.EMAIL_PROVIDER, ["resend", "mock"], "mock");
  const storageProvider = readEnum(env.STORAGE_PROVIDER, ["s3", "mock"], "mock");

  const config: IntegrationEnvironmentConfig = {
    appBaseUrl: optionalString(env.INTEGRATION_APP_BASE_URL),
    linkedin: {
      provider: linkedinProvider,
      externalApplyBaseUrl: optionalString(env.LINKEDIN_EXTERNAL_APPLY_BASE_URL),
      sourceSystem:
        optionalString(env.LINKEDIN_SOURCE_SYSTEM) ?? "ai-hiring-intelligence-platform"
    },
    email: {
      provider: emailProvider,
      fromAddress: requiredString(env.EMAIL_FROM_ADDRESS, "EMAIL_FROM_ADDRESS"),
      fromName: optionalString(env.EMAIL_FROM_NAME) ?? "AI Hiring Intelligence",
      replyTo: optionalString(env.EMAIL_REPLY_TO),
      companyName: optionalString(env.EMAIL_COMPANY_NAME) ?? "AI Hiring Intelligence",
      resendApiKey: optionalString(env.EMAIL_RESEND_API_KEY),
      templateIds: loadEmailTemplateIds(env)
    },
    storage: {
      provider: storageProvider,
      bucket: requiredString(env.STORAGE_BUCKET, "STORAGE_BUCKET"),
      region: optionalString(env.STORAGE_REGION) ?? "us-east-1",
      endpoint: optionalString(env.STORAGE_ENDPOINT),
      accessKeyId: optionalString(env.STORAGE_ACCESS_KEY_ID),
      secretAccessKey: optionalString(env.STORAGE_SECRET_ACCESS_KEY),
      publicBaseUrl: optionalString(env.STORAGE_PUBLIC_BASE_URL),
      forcePathStyle: readBoolean(env.STORAGE_FORCE_PATH_STYLE, false),
      signedUrlTtlSeconds: readInteger(env.STORAGE_SIGNED_URL_TTL_SECONDS, 900)
    }
  };

  if (config.email.provider === "resend" && !config.email.resendApiKey) {
    throw new Error("EMAIL_RESEND_API_KEY is required when EMAIL_PROVIDER=resend.");
  }

  if (config.storage.provider === "s3") {
    requiredString(config.storage.accessKeyId, "STORAGE_ACCESS_KEY_ID");
    requiredString(config.storage.secretAccessKey, "STORAGE_SECRET_ACCESS_KEY");
  }

  return config;
}

function loadEmailTemplateIds(
  env: NodeJS.ProcessEnv
): Partial<Record<EmailAutomationTrigger, string>> {
  const templateIds: Partial<Record<EmailAutomationTrigger, string>> = {};

  for (const [trigger, envKey] of Object.entries(EMAIL_TRIGGER_ENV_KEYS) as Array<
    [EmailAutomationTrigger, string]
  >) {
    const value = optionalString(env[envKey]);
    if (value) {
      templateIds[trigger] = value;
    }
  }

  return templateIds;
}

function requiredString(value: string | undefined, key: string): string {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
}

function optionalString(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

function readInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid integer environment value: ${value}`);
  }

  return parsed;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  return value === "true";
}

function readEnum<const T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  if (!value) {
    return fallback;
  }

  if ((allowed as readonly string[]).includes(value)) {
    return value as T;
  }

  throw new Error(`Expected one of ${allowed.join(", ")} but received ${value}`);
}
