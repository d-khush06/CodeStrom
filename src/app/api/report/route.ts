import type { AnalysisResult } from "@/lib/analysis/types";
import { buildPdfReport } from "@/lib/report/pdf";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const format = new URL(request.url).searchParams.get("format") ?? "json";
  const payload = await request.json().catch(() => null);

  if (!payload || !payload.analysis) {
    return Response.json({ error: "Missing analysis payload." }, { status: 400 });
  }

  const analysis = payload.analysis as AnalysisResult;

  if (format === "pdf") {
    const pdfBytes = buildPdfReport(analysis);
    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=analysis-report.pdf",
      },
    });
  }

  return Response.json({ report: analysis });
}
