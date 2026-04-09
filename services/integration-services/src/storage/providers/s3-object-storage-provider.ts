import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createTimestamp } from "../../shared/id.js";
import { BaseObjectStorageProvider } from "../object-storage-provider.js";
import type {
  ObjectDownloadLink,
  ObjectStorageUploadInput,
  StoredObject
} from "../types.js";

export interface S3ObjectStorageProviderOptions {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  publicBaseUrl?: string;
  signedUrlTtlSeconds?: number;
}

export class S3ObjectStorageProvider extends BaseObjectStorageProvider {
  private readonly client: S3Client;
  private readonly signedUrlTtlSeconds: number;

  constructor(private readonly options: S3ObjectStorageProviderOptions) {
    super();
    this.signedUrlTtlSeconds = options.signedUrlTtlSeconds ?? 900;
    this.client = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey
      }
    });
  }

  async uploadObject(input: ObjectStorageUploadInput): Promise<StoredObject> {
    const key = this.buildObjectKey(input.descriptor);
    const body = normalizeBody(input.data);
    const result = await this.client.send(
      new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: key,
        Body: body,
        ContentType: input.contentType,
        CacheControl: input.cacheControl,
        Metadata: input.metadata
      })
    );

    return {
      provider: "s3",
      bucket: this.options.bucket,
      key,
      contentType: input.contentType,
      sizeBytes: body.byteLength,
      metadata: input.metadata ?? {},
      uploadedAt: createTimestamp(),
      etag: result.ETag,
      publicUrl: this.options.publicBaseUrl
        ? `${this.options.publicBaseUrl.replace(/\/$/, "")}/${key}`
        : undefined
    };
  }

  async getDownloadUrl(key: string, fileName?: string): Promise<ObjectDownloadLink> {
    const expiresAt = new Date(Date.now() + this.signedUrlTtlSeconds * 1000).toISOString();
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.options.bucket,
        Key: key,
        ResponseContentDisposition: fileName
          ? `attachment; filename="${fileName.replace(/"/g, "")}"`
          : undefined
      }),
      { expiresIn: this.signedUrlTtlSeconds }
    );

    return { url, expiresAt };
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.options.bucket,
        Key: key
      })
    );
  }
}

function normalizeBody(data: Buffer | Uint8Array | string): Buffer {
  if (typeof data === "string") {
    return Buffer.from(data);
  }

  return Buffer.from(data);
}
