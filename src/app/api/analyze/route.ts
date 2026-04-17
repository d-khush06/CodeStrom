import { getUpload } from "@/lib/server/uploadStore";
import { createMockAnalysis } from "@/lib/analysis/mock";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (payload.demo) {
    return Response.json(createMockAnalysis(null));
  }

  const uploadId = typeof payload.uploadId === "string" ? payload.uploadId : "";
  const upload = uploadId ? getUpload(uploadId) : null;

  if (!upload) {
    return Response.json({ error: "Upload not found." }, { status: 404 });
  }

  return Response.json(createMockAnalysis(upload));
}
