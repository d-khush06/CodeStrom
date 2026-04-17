"use client";

import * as React from "react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import type { AnalysisResult } from "@/lib/analysis/types";
import { UploadPanel } from "@/app/_components/UploadPanel";
import { InteractivePlayer } from "@/app/_components/InteractivePlayer";

export default function DashboardPage() {
  const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState<"json" | "pdf" | null>(null);
  const [exportError, setExportError] = React.useState<string | null>(null);

  async function downloadReport(format: "json" | "pdf") {
    if (!analysis) return;

    setExporting(format);
    setExportError(null);

    try {
      const apiUrlBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
      const response = await fetch(`${apiUrlBase}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysis, format }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(payload?.detail || "Report export failed");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = format === "pdf" ? "analysis-report.pdf" : "analysis-report.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Report export failed");
    } finally {
      setExporting(null);
    }
  }

  React.useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.24em] text-white/80">
          VIDEO DASHBOARD
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-10 px-6 pb-16">
        <Show when="signed-in">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <UploadPanel
              onAnalysisReady={(result, url) => {
                setAnalysis(result);
                setVideoUrl(url);
              }}
            />
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-white/50">Summary</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Latest extraction</h2>
              {analysis ? (
                <div className="mt-4 grid gap-3 text-sm text-white/70">
                  <div>Duration: {analysis.metadata.durationSec}s</div>
                  <div>Resolution: {analysis.metadata.resolution}</div>
                  <div>FPS: {analysis.metadata.fps}</div>
                  <div>Chapter markers: {analysis.metadata.chapters.length}</div>
                  <div>Scenes: {analysis.scenes.length}</div>
                  <div>Timeline events: {analysis.timeline.length}</div>
                  <div>Violation flags: {analysis.violationFlags?.length ?? 0}</div>
                  <div>Insights: {analysis.insights.length}</div>

                  <div className="mt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => downloadReport("json")}
                      disabled={exporting !== null}
                      className="rounded-full border border-white/25 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:border-cyan-300/60 disabled:opacity-60"
                    >
                      {exporting === "json" ? "Exporting" : "Export JSON"}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadReport("pdf")}
                      disabled={exporting !== null}
                      className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-cyan-300 disabled:opacity-60"
                    >
                      {exporting === "pdf" ? "Exporting" : "Export PDF"}
                    </button>
                  </div>
                  {exportError ? <div className="text-xs text-rose-200">{exportError}</div> : null}
                </div>
              ) : (
                <div className="mt-4 text-sm text-white/60">Upload a video to see analysis.</div>
              )}
            </div>
          </div>

          <InteractivePlayer analysis={analysis} videoUrl={videoUrl} />
        </Show>

        <Show when="signed-out">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl text-sm text-white/70">
            This workspace is protected. Sign in to access the video analysis tools.
          </div>
        </Show>
      </main>
    </div>
  );
}

