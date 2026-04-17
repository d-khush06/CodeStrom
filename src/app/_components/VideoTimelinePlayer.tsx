"use client";

import * as React from "react";
import type { AnalysisResult } from "@/lib/analysis/types";

type VideoTimelinePlayerProps = {
  analysis: AnalysisResult;
  videoUrl: string | null;
  seekTime: number | null;
  onTimeUpdate?: (timeSec: number) => void;
};

function formatTime(timeSec: number) {
  const minutes = Math.floor(timeSec / 60);
  const seconds = Math.floor(timeSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function VideoTimelinePlayer({
  analysis,
  videoUrl,
  seekTime,
  onTimeUpdate,
}: VideoTimelinePlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (!videoRef.current || seekTime === null) return;
    videoRef.current.currentTime = seekTime;
    videoRef.current.play().catch(() => undefined);
  }, [seekTime]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleUpdate = () => onTimeUpdate?.(video.currentTime);
    video.addEventListener("timeupdate", handleUpdate);

    return () => video.removeEventListener("timeupdate", handleUpdate);
  }, [onTimeUpdate]);

  const markers = analysis.scenes.map((scene) => ({
    timeSec: scene.timeSec,
    label: scene.description,
  }));

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/50">Playback</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Video with scene markers</h3>
        </div>
        <div className="text-xs text-white/40">
          Duration: {analysis.metadata.durationSec}s
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        {videoUrl ? (
          <video ref={videoRef} src={videoUrl} controls className="h-64 w-full" />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-white/50">
            Upload a video to enable playback.
          </div>
        )}
      </div>
      <div className="mt-5 grid gap-3">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Scene markers</span>
          <span>{markers.length} detected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {markers.map((marker, index) => (
            <button
              type="button"
              key={`${marker.timeSec}-${index}`}
              onClick={() => {
                if (!videoRef.current) return;
                videoRef.current.currentTime = marker.timeSec;
                videoRef.current.play().catch(() => undefined);
              }}
              className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/70 transition hover:border-cyan-300/60 hover:text-white"
            >
              {formatTime(marker.timeSec)} · {marker.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
