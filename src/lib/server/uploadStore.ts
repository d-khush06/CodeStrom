import type { UploadRecord } from "@/lib/analysis/types";

const uploadStore = new Map<string, UploadRecord>();

export function saveUpload(record: UploadRecord) {
  uploadStore.set(record.uploadId, record);
  return record;
}

export function getUpload(uploadId: string) {
  return uploadStore.get(uploadId) ?? null;
}
