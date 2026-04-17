import type { SceneChange } from "@/lib/analysis/types";

type TimelineHighlightsProps = {
  scenes: SceneChange[];
};

export function TimelineHighlights({ scenes }: TimelineHighlightsProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.24em] text-white/50">Scene detection</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Scene change log</h3>
      <div className="mt-5 grid gap-3">
        {scenes.map((scene, index) => (
          <div
            key={`${scene.timeSec}-${index}`}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{scene.timeSec}s</span>
              <span>Confidence {scene.confidence.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-sm text-white/80">{scene.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
