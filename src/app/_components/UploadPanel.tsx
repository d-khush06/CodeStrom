"use client";

import * as React from "react";
import type { AnalysisResult } from "@/lib/analysis/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

type UploadPanelProps = {
  onAnalysisReady: (analysis: AnalysisResult, videoUrl: string) => void;
};

type UploadResponse = {
  task_id: string;
  analysis_id: string;
  status: string;
  video_url: string;
};

type StatusResponse = {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result: AnalysisResult | null;
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(1)} ${units[exponent]}`;
}

export function UploadPanel({ onAnalysisReady }: UploadPanelProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [taskId, setTaskId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "uploading" | "polling" | "error" | "done">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  function handleFile(newFile: File | null) {
    setFile(newFile);
    setTaskId(null);
    setStatus("idle");
    setErrorMessage(null);
  }

  async function pollUntilComplete(nextTaskId: string, sourceFile: File, backendVideoUrl?: string) {
    setStatus("polling");

    const maxAttempts = 120;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await fetch(`${API_BASE}/status/${nextTaskId}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Status check failed");
      }

      const payload = (await response.json()) as StatusResponse;
      if (payload.status === "completed" && payload.result) {
        const videoUrl = backendVideoUrl || URL.createObjectURL(sourceFile);
        onAnalysisReady(payload.result, videoUrl);
        setStatus("done");
        return;
      }

      if (payload.status === "failed") {
        throw new Error("Processing failed on worker");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Processing timed out");
  }

  async function handleUpload() {
    if (!file) return;

    setStatus("uploading");
    setErrorMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const payload = await new Promise<UploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}/upload`);

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const nextProgress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(nextProgress);
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onload = () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            try {
              const parsed = JSON.parse(xhr.responseText) as { detail?: string };
              reject(new Error(parsed.detail || "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
            return;
          }

          try {
            const parsed = JSON.parse(xhr.responseText) as UploadResponse;
            resolve(parsed);
          } catch {
            reject(new Error("Invalid upload response"));
          }
        };

        xhr.send(formData);
      });

      setTaskId(payload.task_id);
      await pollUntilComplete(payload.task_id, file, payload.video_url);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.24em] text-white/50">Upload</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Drag and drop a video</h2>
      <p className="mt-2 text-sm text-white/60">
        We upload once, then poll task status until analysis is complete.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const droppedFile = event.dataTransfer.files?.[0] ?? null;
          handleFile(droppedFile);
        }}
        className={
          "mt-5 rounded-2xl border-2 border-dashed p-6 transition " +
          (dragActive ? "border-cyan-300/70 bg-cyan-300/10" : "border-white/15 bg-white/[0.02]")
        }
      >
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          className="w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.2em] file:text-cyan-100"
        />
        <div className="mt-4 text-xs text-white/50">
          {file ? `${file.name} · ${formatBytes(file.size)}` : "Drop a video or click to browse."}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || status === "uploading" || status === "polling"}
          className="rounded-full bg-cyan-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-900 transition hover:bg-cyan-300 disabled:opacity-40"
        >
          {status === "uploading"
            ? "Uploading"
            : status === "polling"
              ? "Processing"
              : "Start Analysis"}
        </button>

        {taskId ? <span className="text-xs text-white/50">Task: {taskId.slice(0, 12)}...</span> : null}
        {status === "uploading" ? (
          <span className="text-xs text-cyan-200">Upload progress: {uploadProgress}%</span>
        ) : null}
      </div>

      {status === "error" && errorMessage ? (
        <div className="mt-3 text-xs text-rose-200">{errorMessage}</div>
      ) : null}
      {status === "done" ? (
        <div className="mt-3 text-xs text-emerald-200">Processing complete.</div>
      ) : null}
    </div>
  );
}