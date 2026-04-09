import { createTimestamp } from "../../shared/id.js";
import { BaseObjectStorageProvider } from "../object-storage-provider.js";
import type {
  ObjectDownloadLink,
  ObjectStorageUploadInput,
  StoredObject
} from "../types.js";

interface MockStoredRecord {
  object: StoredObject;
  data: Buffer;
}

export class MockObjectStorageProvider extends BaseObjectStorageProvider {
  readonly objects = new Map<string, MockStoredRecord>();

  constructor(private readonly bucket = "mock-assets") {
    super();
  }

  async uploadObject(input: ObjectStorageUploadInput): Promise<StoredObject> {
    const key = this.buildObjectKey(input.descriptor);
    const buffer = normalizeToBuffer(input.data);
    const uploadedAt = createTimestamp();
    const object: StoredObject = {
      provider: "mock",
      bucket: this.bucket,
      key,
      contentType: input.contentType,
      sizeBytes: buffer.byteLength,
      metadata: input.metadata ?? {},
      uploadedAt,
      publicUrl: `https://mock-storage.local/${this.bucket}/${encodeURIComponent(key)}`
    };

    this.objects.set(key, { object, data: buffer });
    return object;
  }

  async getDownloadUrl(key: string, _fileName?: string): Promise<ObjectDownloadLink> {
    if (!this.objects.has(key)) {
      throw new Error(`Mock storage object not found: ${key}`);
    }

    return {
      url: `https://mock-storage.local/${this.bucket}/${encodeURIComponent(key)}?download=1`,
      expiresAt: createTimestamp()
    };
  }

  async deleteObject(key: string): Promise<void> {
    this.objects.delete(key);
  }
}

function normalizeToBuffer(data: Buffer | Uint8Array | string): Buffer {
  if (typeof data === "string") {
    return Buffer.from(data);
  }

  return Buffer.from(data);
}
