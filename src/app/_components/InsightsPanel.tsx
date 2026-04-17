import type { Insight } from "@/lib/analysis/types";

type InsightsPanelProps = {
  insights: Insight[];
};

const severityStyles: Record<Insight["severity"], string> = {
  low: "bg-emerald-400/20 text-emerald-200",
  medium: "bg-amber-400/20 text-amber-200",
  high: "bg-rose-400/20 text-rose-200",
};

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.24em] text-white/50">Real-world insights</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Actionable findings</h3>
      <div className="mt-5 space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-white">{insight.title}</h4>
              <span
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                  severityStyles[insight.severity]
                }`}
              >
                {insight.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">{insight.reasoning}</p>
            <div className="mt-3 space-y-2 text-xs text-white/50">
              {insight.evidence.map((evidence, index) => (
                <div key={`${insight.id}-${index}`}>
                  Evidence {index + 1}: {evidence.startSec}s - {evidence.endSec}s · {evidence.note}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
