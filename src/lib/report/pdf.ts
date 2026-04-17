import type { AnalysisResult } from "@/lib/analysis/types";

function escapePdfText(input: string) {
  return input.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdfFromLines(lines: string[]) {
  const header = "%PDF-1.4\n";
  const contentLines = lines.map((line) => `(${escapePdfText(line)}) Tj`);
  const textStream =
    "BT\n" +
    "/F1 12 Tf\n" +
    "72 720 Td\n" +
    "14 TL\n" +
    contentLines.join("\nT*\n") +
    "\nET";
  const contentLength = textStream.length;

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${textStream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let byteCount = header.length;
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(byteCount);
    byteCount += obj.length;
  }

  const xrefStart = byteCount;
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += "0000000000 65535 f \n";

  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }

  const trailer =
    "trailer\n" +
    `<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    "startxref\n" +
    `${xrefStart}\n` +
    "%%EOF";

  const pdf = header + objects.join("") + xref + trailer;
  return new TextEncoder().encode(pdf);
}

export function buildPdfReport(analysis: AnalysisResult) {
  const lines: string[] = [
    "Video Analysis Report",
    `Upload ID: ${analysis.uploadId}`,
    `Generated: ${analysis.generatedAt}`,
    "",
    "Metadata",
    `Duration: ${analysis.metadata.durationSec}s`,
    `Resolution: ${analysis.metadata.resolution}`,
    `FPS: ${analysis.metadata.fps}`,
    `Bitrate: ${analysis.metadata.bitrateKbps} kbps`,
    "",
    "Insights",
  ];

  for (const insight of analysis.insights) {
    lines.push(`- ${insight.title} (${insight.severity})`);
  }

  lines.push("", "Timeline highlights");
  for (const event of analysis.timeline.slice(0, 6)) {
    lines.push(`- ${event.title} @ ${event.timeSec}s`);
  }

  return buildPdfFromLines(lines);
}
