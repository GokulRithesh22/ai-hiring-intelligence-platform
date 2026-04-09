export const STORED_ARTIFACT_KINDS = [
  "resume",
  "cover-letter",
  "interview-audio",
  "interview-transcript",
  "candidate-report",
  "linkedin-profile-export"
] as const;

export type StoredArtifactKind = (typeof STORED_ARTIFACT_KINDS)[number];

export interface ObjectStorageDescriptor {
  tenantId: string;
  artifactKind: StoredArtifactKind;
  fileName: string;
  candidateId?: string;
  jobId?: string;
  applicationId?: string;
  interviewSessionId?: string;
}

export interface ObjectStorageUploadInput {
  contentType: string;
  data: Buffer | Uint8Array | string;
  descriptor: ObjectStorageDescriptor;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

export interface StoredObject {
  provider: string;
  bucket: string;
  key: string;
  contentType: string;
  sizeBytes: number;
  metadata: Record<string, string>;
  uploadedAt: string;
  etag?: string;
  publicUrl?: string;
}

export interface ObjectDownloadLink {
  url: string;
  expiresAt: string;
}

export interface CandidateArtifactUploadRequest {
  tenantId: string;
  candidateId: string;
  jobId?: string;
  applicationId?: string;
  interviewSessionId?: string;
  fileName: string;
  contentType: string;
  data: Buffer | Uint8Array | string;
  metadata?: Record<string, string>;
}
