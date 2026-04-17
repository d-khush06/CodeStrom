"use client";

import * as React from "react";
import ReactPlayer from "react-player";
import type { AnalysisResult, TimelineEvent, TranscriptSegment } from "@/lib/analysis/types";

function formatTime(timeSec: number) {
  const minutes = Math.floor(timeSec / 60);
  const seconds = Math.floor(timeSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type InteractivePlayerProps = {
  analysis: AnalysisResult | null;
  videoUrl: string | null;
};

export function InteractivePlayer({ analysis, videoUrl }: InteractivePlayerProps) {
  const playerRef = React.useRef<ReactPlayer | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const timelineRef = React.useRef<HTMLDivElement | null>(null);
  const transcriptRef = React.useRef<HTMLDivElement | null>(null);
  const timelineButtonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const transcriptButtonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const duration = analysis?.metadata.durationSec ?? 1;
  const timeline: TimelineEvent[] = analysis?.timeline ?? [];
  const transcript: TranscriptSegment[] = analysis?.transcript ?? [];

  const activeTimelineKey = React.useMemo(() => {
    if (!timeline.length) return null;
    const nearest = timeline.reduce((prev, item) =>
      Math.abs(item.timeSec - currentTime) < Math.abs(prev.timeSec - currentTime) ? item : prev
    );
    return `${nearest.timeSec}-${nearest.title}`;
  }, [timeline, currentTime]);

  const activeTranscriptId = React.useMemo(() => {
    const active = transcript.find((segment) => currentTime >= segment.startSec && currentTime <= segment.endSec);
    return active?.id ?? null;
  }, [transcript, currentTime]);

  React.useEffect(() => {
    if (!activeTimelineKey) return;
    const node = timelineButtonRefs.current.get(activeTimelineKey);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeTimelineKey]);

  React.useEffect(() => {
    if (!activeTranscriptId) return;
    const node = transcriptButtonRefs.current.get(activeTranscriptId);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeTranscriptId]);

  const scrubTo = React.useCallback((timeSec: number) => {
    playerRef.current?.seekTo(timeSec, "seconds");
  }, []);

  if (!analysis) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.24em] text-white/50">Playback</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Interactive player and timeline</h3>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <div className="flex h-80 items-center justify-center text-sm text-white/50">
              Upload a video to start playback and see analysis.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const markerPosition = React.useCallback(
    (timeSec: number) => `${Math.min(100, Math.max(0, (timeSec / duration) * 100))}%`,
    [duration]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.24em] text-white/50">Playback</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Interactive player and timeline</h3>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {videoUrl ? (
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              width="100%"
              height={360}
              controls
              onProgress={(state) => setCurrentTime(state.playedSeconds)}
            />
          ) : (
            <div className="flex h-80 items-center justify-center text-sm text-white/50">
              Upload a video to start playback.
            </div>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>0:00</span>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="relative mt-3 h-14 rounded-xl bg-white/[0.04]">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
            {timeline.slice(0, 40).map((marker, index) => (
              <button
                key={`${marker.timeSec}-${index}`}
                type="button"
                title={`${formatTime(marker.timeSec)} ${marker.title}`}
                onClick={() => scrubTo(marker.timeSec)}
                className="absolute top-2 -translate-x-1/2"
                style={{ left: markerPosition(marker.timeSec) }}
              >
                <span className="block h-8 w-[2px] bg-cyan-300" />
                <span className="mt-1 block text-[10px] text-white/60">{formatTime(marker.timeSec)}</span>
              </button>
            ))}
          </div>

          <div ref={timelineRef} className="mt-4 grid max-h-72 gap-3 overflow-y-auto pr-1 lg:grid-cols-2">
            {timeline.slice(0, 10).map((marker, index) => (
              (() => {
                const markerKey = `${marker.timeSec}-${marker.title}`;
                const isActive = markerKey === activeTimelineKey;
                return (
              <button
                key={`event-${marker.timeSec}-${index}`}
                type="button"
                ref={(node) => {
                  if (!node) {
                    timelineButtonRefs.current.delete(markerKey);
                    return;
                  }
                  timelineButtonRefs.current.set(markerKey, node);
                }}
                onClick={() => scrubTo(marker.timeSec)}
                className={
                  "rounded-xl border px-3 py-2 text-left transition " +
                  (isActive
                    ? "border-cyan-300 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.02] hover:border-cyan-300/60")
                }
              >
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="uppercase tracking-[0.2em]">{marker.category}</span>
                  <span>{formatTime(marker.timeSec)}</span>
                </div>
                <p className="mt-1 text-sm text-white/85">{marker.title}</p>
              </button>
                );
              })()
            ))}
          </div>
        </div>
      </div>

      {transcript.length > 0 && (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.24em] text-white/50">Transcript keyframes</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Click transcript segments to scrub</h3>

        <div ref={transcriptRef} className="mt-4 grid max-h-80 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
          {transcript.length === 0 ? (
            <div className="text-sm text-white/60">No transcript segments yet.</div>
          ) : (
            transcript.slice(0, 12).map((segment) => (
              <button
                key={segment.id}
                type="button"
                ref={(node) => {
                  if (!node) {
                    transcriptButtonRefs.current.delete(segment.id);
                    return;
                  }
                  transcriptButtonRefs.current.set(segment.id, node);
                }}
                onClick={() => scrubTo(segment.startSec)}
                className={
                  "rounded-2xl border p-4 text-left transition " +
                  (activeTranscriptId === segment.id
                    ? "border-cyan-300 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.02] hover:border-cyan-300/60")
                }
              >
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{formatTime(segment.startSec)} - {formatTime(segment.endSec)}</span>
                  <span className="uppercase tracking-[0.18em]">{segment.sentiment}</span>
                </div>
                <p className="mt-2 text-sm text-white/80">{segment.text}</p>
              </button>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
}