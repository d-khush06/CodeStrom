import type { TranscriptSegment } from "@/lib/analysis/types";

type TranscriptPanelProps = {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek?: (timeSec: number) => void;
};

function formatTime(timeSec: number) {
  const minutes = Math.floor(timeSec / 60);
  const seconds = Math.floor(timeSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TranscriptPanel({ segments, currentTime, onSeek }: TranscriptPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/50">Transcript</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Timestamped segments</h3>
        </div>
        <span className="text-xs text-white/40">Click any segment to seek</span>
      </div>
      <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-2">
        {segments.map((segment) => {
          const isActive = currentTime >= segment.startSec && currentTime <= segment.endSec;
          return (
            <button
              type="button"
              key={segment.id}
              onClick={() => onSeek?.(segment.startSec)}
              className={
                "w-full rounded-2xl border px-4 py-3 text-left transition " +
                (isActive
                  ? "border-cyan-400/60 bg-cyan-400/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/30")
              }
            >
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>
                  {formatTime(segment.startSec)} - {formatTime(segment.endSec)}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em]">
                  {segment.speaker}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/80">{segment.text}</p>
              <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
                Sentiment: {segment.sentiment} · Pace: {segment.paceWpm} wpm
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
