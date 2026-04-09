import type { ObjectStorageProvider } from "./object-storage-provider.js";
import type {
  CandidateArtifactUploadRequest,
  ObjectDownloadLink,
  StoredObject
} from "./types.js";

export class ObjectStorageService {
  constructor(private readonly provider: ObjectStorageProvider) {}

  uploadResume(input: CandidateArtifactUploadRequest): Promise<StoredObject> {
    return this.provider.uploadObject({
      descriptor: {
        tenantId: input.tenantId,
        candidateId: input.candidateId,
        jobId: input.jobId,
        applicationId: input.applicationId,
        artifactKind: "resume",
        fileName: input.fileName
      },
      contentType: input.contentType,
      data: input.data,
      metadata: input.metadata
    });
  }

  uploadInterviewArtifact(
    artifactKind: "interview-audio" | "interview-transcript",
    input: CandidateArtifactUploadRequest
  ): Promise<StoredObject> {
    return this.provider.uploadObject({
      descriptor: {
        tenantId: input.tenantId,
        candidateId: input.candidateId,
        jobId: input.jobId,
        applicationId: input.applicationId,
        interviewSessionId: input.interviewSessionId,
        artifactKind,
        fileName: input.fileName
      },
      contentType: input.contentType,
      data: input.data,
      metadata: input.metadata
    });
  }

  uploadCandidateReport(input: CandidateArtifactUploadRequest): Promise<StoredObject> {
    return this.provider.uploadObject({
      descriptor: {
        tenantId: input.tenantId,
        candidateId: input.candidateId,
        jobId: input.jobId,
        applicationId: input.applicationId,
        interviewSessionId: input.interviewSessionId,
        artifactKind: "candidate-report",
        fileName: input.fileName
      },
      contentType: input.contentType,
      data: input.data,
      metadata: input.metadata
    });
  }

  uploadLinkedInProfileExport(
    input: CandidateArtifactUploadRequest
  ): Promise<StoredObject> {
    return this.provider.uploadObject({
      descriptor: {
        tenantId: input.tenantId,
        candidateId: input.candidateId,
        jobId: input.jobId,
        applicationId: input.applicationId,
        artifactKind: "linkedin-profile-export",
        fileName: input.fileName
      },
      contentType: input.contentType,
      data: input.data,
      metadata: input.metadata
    });
  }

  getDownloadUrl(key: string, fileName?: string): Promise<ObjectDownloadLink> {
    return this.provider.getDownloadUrl(key, fileName);
  }

  deleteObject(key: string): Promise<void> {
    return this.provider.deleteObject(key);
  }
}
