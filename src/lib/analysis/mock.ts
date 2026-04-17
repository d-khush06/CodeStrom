import type {
  AnalysisResult,
  BehaviorPoint,
  SceneChange,
  TimelineEvent,
  TranscriptSegment,
  UploadRecord,
} from "./types";

const TOPICS = [
  "Project scope and goals",
  "Data ingestion pipeline",
  "Scene detection and alignment",
  "Behavioral signal modeling",
  "Correlation insights",
  "Deployment plan",
];

const TRANSCRIPT_SNIPPETS = [
  "Welcome everyone, today we will break down the video correlation pipeline.",
  "We start by extracting metadata like duration, resolution, and bitrate.",
  "Next we align transcript segments with scene boundaries for precision.",
  "Watch the speaking pace dip here as the presenter shifts to a demo.",
  "Sentiment peaks when the product value is emphasized.",
  "We flag engagement drops when pauses exceed the baseline threshold.",
];

function buildTranscript(durationSec: number): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const segmentLength = 28;
  let cursor = 0;
  let idx = 0;

  while (cursor < durationSec) {
    const startSec = cursor;
    const endSec = Math.min(cursor + segmentLength, durationSec);
    const text = TRANSCRIPT_SNIPPETS[idx % TRANSCRIPT_SNIPPETS.length];
    const sentiment: TranscriptSegment["sentiment"] =
      idx % 3 === 0 ? "positive" : idx % 3 === 1 ? "neutral" : "negative";

    segments.push({
      id: `seg-${idx + 1}`,
      startSec,
      endSec,
      text,
      speaker: idx % 2 === 0 ? "Speaker A" : "Speaker B",
      sentiment,
      paceWpm: 135 + (idx % 4) * 12,
    });

    cursor += segmentLength + 6;
    idx += 1;
  }

  return segments;
}

function buildBehaviors(durationSec: number): BehaviorPoint[] {
  const points: BehaviorPoint[] = [];
  const step = 10;

  for (let timeSec = 0; timeSec <= durationSec; timeSec += step) {
    const paceWpm = 132 + Math.round(Math.sin(timeSec / 60) * 22);
    const sentiment = Math.sin(timeSec / 80) * 0.7;
    const pauseRate = 0.08 + Math.abs(Math.cos(timeSec / 90)) * 0.18;

    points.push({
      timeSec,
      paceWpm,
      sentiment,
      pauseRate: Number(pauseRate.toFixed(2)),
    });
  }

  return points;
}

function buildScenes(durationSec: number): SceneChange[] {
  const scenes: SceneChange[] = [];
  let timeSec = 0;
  let idx = 1;

  while (timeSec < durationSec) {
    scenes.push({
      timeSec,
      confidence: 0.72 + (idx % 3) * 0.08,
      description: `Scene ${idx}: ${TOPICS[idx % TOPICS.length]}`,
    });

    timeSec += 75;
    idx += 1;
  }

  return scenes;
}

function buildTimeline(durationSec: number): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const step = Math.max(60, Math.floor(durationSec / 6));

  for (let timeSec = 0; timeSec <= durationSec; timeSec += step) {
    const topic = TOPICS[(timeSec / step) % TOPICS.length];

    events.push({
      timeSec,
      title: `Topic shift: ${topic}`,
      category: "topic",
      detail: `Detected semantic transition into ${topic.toLowerCase()}.`,
    });
  }

  events.push({
    timeSec: Math.floor(durationSec * 0.42),
    title: "Engagement dip",
    category: "emotion",
    detail: "Pause frequency increased, and sentiment slope turned negative.",
  });

  events.push({
    timeSec: Math.floor(durationSec * 0.68),
    title: "Demo moment",
    category: "insight",
    detail: "Product walkthrough triggered peak sentiment and pace stability.",
  });

  return events;
}

export function createMockAnalysis(upload: UploadRecord | null): AnalysisResult {
  const durationSec = 600;
  const transcript = buildTranscript(durationSec);
  const behaviors = buildBehaviors(durationSec);
  const scenes = buildScenes(durationSec);
  const timeline = buildTimeline(durationSec);

  return {
    uploadId: upload?.uploadId ?? "demo-upload",
    generatedAt: new Date().toISOString(),
    metadata: {
      durationSec,
      resolution: "1920x1080",
      fps: 30,
      bitrateKbps: 4200,
      chapters: [
        { startSec: 0, endSec: 120, title: "Intro and context" },
        { startSec: 120, endSec: 360, title: "Pipeline walkthrough" },
        { startSec: 360, endSec: 600, title: "Demo and wrap-up" },
      ],
    },
    transcript,
    behaviors,
    scenes,
    timeline,
    insights: [
      {
        id: "insight-1",
        title: "Engagement dip after 4:05",
        severity: "medium",
        reasoning:
          "Speaking pace slowed by 18 percent while pause rate peaked above baseline.",
        evidence: [
          {
            startSec: 245,
            endSec: 305,
            note: "Pause rate exceeded 0.22 with neutral sentiment drift.",
          },
        ],
      },
      {
        id: "insight-2",
        title: "Strong product demo resonance",
        severity: "high",
        reasoning:
          "Sentiment arc crested with a stable pace, suggesting high audience focus.",
        evidence: [
          {
            startSec: 395,
            endSec: 470,
            note: "Positive sentiment and consistent pacing during live demo.",
          },
        ],
      },
    ],
  };
}

export const demoAnalysis = createMockAnalysis(null);
