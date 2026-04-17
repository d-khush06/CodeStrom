import { saveUpload } from "@/lib/server/uploadStore";
import type { UploadRecord } from "@/lib/analysis/types";

const ALLOWED_TYPES = new Set(["video/mp4", "video/quicktime", "video/x-msvideo"]);

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ error: "Missing video file." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: "Unsupported file format." }, { status: 415 });
  }

  const upload: UploadRecord = {
    uploadId: crypto.randomUUID(),
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    receivedAt: new Date().toISOString(),
  };

  saveUpload(upload);

  return Response.json({
    uploadId: upload.uploadId,
    file: {
      name: upload.fileName,
      type: upload.fileType,
      size: upload.fileSize,
    },
    receivedAt: upload.receivedAt,
  });
}
