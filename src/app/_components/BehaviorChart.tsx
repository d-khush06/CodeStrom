import type { BehaviorPoint } from "@/lib/analysis/types";

type BehaviorChartProps = {
  behaviors: BehaviorPoint[];
  durationSec: number;
};

function buildPath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");
}

export function BehaviorChart({ behaviors, durationSec }: BehaviorChartProps) {
  const width = 560;
  const height = 180;
  const padding = 24;

  const paceValues = behaviors.map((point) => point.paceWpm);
  const paceMin = Math.min(...paceValues, 90);
  const paceMax = Math.max(...paceValues, 180);

  const toX = (timeSec: number) =>
    padding + (timeSec / durationSec) * (width - padding * 2);
  const toPaceY = (paceWpm: number) =>
    height - padding - ((paceWpm - paceMin) / (paceMax - paceMin)) * (height - padding * 2);
  const toSentimentY = (sentiment: number) =>
    height - padding - ((sentiment + 1) / 2) * (height - padding * 2);

  const pacePath = buildPath(
    behaviors.map((point) => ({ x: toX(point.timeSec), y: toPaceY(point.paceWpm) }))
  );
  const sentimentPath = buildPath(
    behaviors.map((point) => ({ x: toX(point.timeSec), y: toSentimentY(point.sentiment) }))
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/50">Behavior signals</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Speaking pace and sentiment arc</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/60">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-300" /> Pace
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-300" /> Sentiment
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-6 w-full"
        role="img"
        aria-label="Speaking pace and sentiment chart"
      >
        <defs>
          <linearGradient id="pace" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="sentiment" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
        />
        <path d={pacePath} stroke="url(#pace)" strokeWidth="3" fill="none" />
        <path d={sentimentPath} stroke="url(#sentiment)" strokeWidth="2" fill="none" />
      </svg>
      <div className="mt-4 flex items-center justify-between text-xs text-white/50">
        <span>0s</span>
        <span>{durationSec}s</span>
      </div>
    </div>
  );
}
