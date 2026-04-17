"use client";

import * as React from "react";
import type { AnalysisResult } from "@/lib/analysis/types";
import { demoAnalysis } from "@/lib/analysis/mock";
import { BehaviorChart } from "./BehaviorChart";
import { TranscriptPanel } from "./TranscriptPanel";
import { InsightsPanel } from "./InsightsPanel";
import { VideoTimelinePlayer } from "./VideoTimelinePlayer";
import { TimelineHighlights } from "./TimelineHighlights";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

export function AnalysisDashboard() {
  const [analysis, setAnalysis] = React.useState<AnalysisResult>(demoAnalysis);
  const [isDemo, setIsDemo] = React.useState(true);
  const [uploadId, setUploadId] = React.useState<string | null>(null);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "uploading" | "analyzing" | "ready" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [seekTime, setSeekTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!videoFile) {
      setVideoUrl(null);
      return;
    }

    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  async function handleUpload() {
    if (!videoFile) return;

    setStatus("uploading");
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setUploadId(data.uploadId);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
    }
  }

  async function handleAnalyze() {
    if (!uploadId) return;

    setStatus("analyzing");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      const data = (await response.json()) as AnalysisResult;
      setAnalysis(data);
      setIsDemo(false);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Analysis failed");
    }
  }

  async function handleDemo() {
    setAnalysis(demoAnalysis);
    setIsDemo(true);
    setUploadId(null);
    setStatus("ready");
  }

  async function downloadReport(format: "json" | "pdf") {
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/report?format=${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Report export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = format === "pdf" ? "analysis-report.pdf" : "analysis-report.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Report export failed");
    }
  }

  return (
    <section id="analysis-dashboard" className="mt-16 space-y-10">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/50">Pipeline control</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Upload, analyze, and export</h2>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              This build uses a mock analysis pipeline so the end-to-end flow is visible in a
              hackathon demo. Swap in real services once APIs are chosen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDemo}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:border-cyan-300/60 hover:text-white"
            >
              Load demo
            </button>
            <button
              type="button"
              onClick={() => downloadReport("json")}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:border-cyan-300/60 hover:text-white"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => downloadReport("pdf")}
              className="rounded-full bg-cyan-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-900 shadow-[0_0_18px_rgba(34,211,238,0.45)] transition hover:bg-cyan-400"
            >
              Export PDF
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <label className="text-xs uppercase tracking-[0.24em] text-white/50">
              Video upload
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setVideoFile(file);
                  setUploadId(null);
                  setStatus("idle");
                }}
                className="text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.2em] file:text-cyan-100"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!videoFile || status === "uploading"}
                className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:bg-white/20 disabled:opacity-40"
              >
                {status === "uploading" ? "Uploading" : "Upload"}
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!uploadId || status === "analyzing"}
                className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-900 transition hover:bg-cyan-300 disabled:opacity-40"
              >
                {status === "analyzing" ? "Analyzing" : "Run analysis"}
              </button>
            </div>
            <div className="mt-3 text-xs text-white/50">
              Accepted formats: MP4, MOV, AVI. Max size depends on hosting.
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-xs uppercase tracking-[0.24em] text-white/50">Status</div>
            <div className="mt-3 text-sm text-white/70">
              {status === "error" && errorMessage ? (
                <span className="text-rose-200">{errorMessage}</span>
              ) : isDemo ? (
                "Showing demo analysis ready for presentation."
              ) : uploadId ? (
                `Upload ${uploadId.slice(0, 8)} ready for analysis.`
              ) : (
                "Awaiting upload."
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/50">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                Duration: {analysis.metadata.durationSec}s
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                FPS: {analysis.metadata.fps}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                Resolution: {analysis.metadata.resolution}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                Scenes: {analysis.scenes.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <VideoTimelinePlayer
          analysis={analysis}
          videoUrl={videoUrl}
          seekTime={seekTime}
          onTimeUpdate={(timeSec) => setCurrentTime(timeSec)}
        />
        <BehaviorChart behaviors={analysis.behaviors} durationSec={analysis.metadata.durationSec} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <TranscriptPanel
          segments={analysis.transcript}
          currentTime={currentTime}
          onSeek={(timeSec) =>
            setSeekTime((previous) => (previous === timeSec ? timeSec + 0.01 : timeSec))
          }
        />
        <InsightsPanel insights={analysis.insights} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <TimelineHighlights scenes={analysis.scenes} />
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-white/50">Structured timeline</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Key events and topic shifts</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {analysis.timeline.map((event, index) => (
              <div
                key={`${event.timeSec}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="uppercase tracking-[0.2em]">{event.category}</span>
                  <span>{event.timeSec}s</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">{event.title}</p>
                <p className="mt-1 text-xs text-white/60">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
