import { createTimestamp, slugifyFragment } from "../shared/id.js";
import type {
  ObjectDownloadLink,
  ObjectStorageDescriptor,
  ObjectStorageUploadInput,
  StoredObject
} from "./types.js";

export interface ObjectStorageProvider {
  buildObjectKey(descriptor: ObjectStorageDescriptor): string;
  uploadObject(input: ObjectStorageUploadInput): Promise<StoredObject>;
  getDownloadUrl(key: string, fileName?: string): Promise<ObjectDownloadLink>;
  deleteObject(key: string): Promise<void>;
}

export abstract class BaseObjectStorageProvider implements ObjectStorageProvider {
  abstract uploadObject(input: ObjectStorageUploadInput): Promise<StoredObject>;
  abstract getDownloadUrl(key: string, fileName?: string): Promise<ObjectDownloadLink>;
  abstract deleteObject(key: string): Promise<void>;

  buildObjectKey(descriptor: ObjectStorageDescriptor): string {
    const timePart = createTimestamp().replace(/[:.]/g, "-");
    const fileName = sanitizeFileName(descriptor.fileName);
    const segments = [
      slugifyFragment(descriptor.tenantId),
      "candidates",
      slugifyFragment(descriptor.candidateId ?? "unknown"),
      "jobs",
      slugifyFragment(descriptor.jobId ?? "general"),
      "applications",
      slugifyFragment(descriptor.applicationId ?? "unassigned")
    ];

    if (descriptor.interviewSessionId) {
      segments.push("interviews", slugifyFragment(descriptor.interviewSessionId));
    }

    segments.push(descriptor.artifactKind, `${timePart}-${fileName}`);
    return segments.join("/");
  }
}

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.trim().replace(/\s+/g, "-");
  const [name, ...extensions] = normalized.split(".");
  const extension = extensions.length > 0 ? `.${extensions.join(".").toLowerCase()}` : "";
  const safeName = slugifyFragment(name || "artifact");
  return `${safeName}${extension}`;
}
