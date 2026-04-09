import type { IntegrationEnvironmentConfig } from "../config/env.js";
import { loadIntegrationEnvironmentConfig } from "../config/env.js";
import { EmailTriggerService } from "../email/email-trigger-service.js";
import type { EmailProvider } from "../email/email-provider.js";
import { MockEmailProvider } from "../email/providers/mock-email-provider.js";
import { ResendEmailProvider } from "../email/providers/resend-email-provider.js";
import { ExternalApplyLinkedInProvider } from "../linkedin/providers/external-apply-linkedin-provider.js";
import { MockLinkedInProvider } from "../linkedin/providers/mock-linkedin-provider.js";
import type { LinkedInJobProvider } from "../linkedin/types.js";
import { ObjectStorageService } from "../storage/object-storage-service.js";
import type { ObjectStorageProvider } from "../storage/object-storage-provider.js";
import { MockObjectStorageProvider } from "../storage/providers/mock-object-storage-provider.js";
import { S3ObjectStorageProvider } from "../storage/providers/s3-object-storage-provider.js";

export interface IntegrationServices {
  config: IntegrationEnvironmentConfig;
  linkedin: LinkedInJobProvider;
  email: EmailTriggerService;
  emailProvider: EmailProvider;
  storage: ObjectStorageService;
  storageProvider: ObjectStorageProvider;
}

export function createIntegrationServices(
  config: IntegrationEnvironmentConfig = loadIntegrationEnvironmentConfig()
): IntegrationServices {
  const linkedin =
    config.linkedin.provider === "mock"
      ? new MockLinkedInProvider({
          sourceSystem: config.linkedin.sourceSystem,
          externalApplyBaseUrl: config.linkedin.externalApplyBaseUrl ?? config.appBaseUrl
        })
      : new ExternalApplyLinkedInProvider({
          sourceSystem: config.linkedin.sourceSystem,
          externalApplyBaseUrl: config.linkedin.externalApplyBaseUrl ?? config.appBaseUrl
        });

  const emailProvider =
    config.email.provider === "mock"
      ? new MockEmailProvider()
      : new ResendEmailProvider({
          apiKey: config.email.resendApiKey as string
        });

  const email = new EmailTriggerService({
    provider: emailProvider,
    from: {
      email: config.email.fromAddress,
      name: config.email.fromName
    },
    replyTo: config.email.replyTo
      ? {
          email: config.email.replyTo,
          name: config.email.fromName
        }
      : undefined,
    companyName: config.email.companyName,
    templateIds: config.email.templateIds
  });

  const storageProvider =
    config.storage.provider === "mock"
      ? new MockObjectStorageProvider(config.storage.bucket)
      : new S3ObjectStorageProvider({
          bucket: config.storage.bucket,
          region: config.storage.region,
          endpoint: config.storage.endpoint,
          accessKeyId: config.storage.accessKeyId as string,
          secretAccessKey: config.storage.secretAccessKey as string,
          publicBaseUrl: config.storage.publicBaseUrl,
          forcePathStyle: config.storage.forcePathStyle,
          signedUrlTtlSeconds: config.storage.signedUrlTtlSeconds
        });

  return {
    config,
    linkedin,
    email,
    emailProvider,
    storage: new ObjectStorageService(storageProvider),
    storageProvider
  };
}
