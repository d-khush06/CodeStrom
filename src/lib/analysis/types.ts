export type UploadRecord = {
  uploadId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  receivedAt: string;
};

export type ChapterMarker = {
  startSec: number;
  endSec: number;
  title: string;
};

export type VideoMetadata = {
  durationSec: number;
  resolution: string;
  fps: number;
  bitrateKbps: number;
  chapters: ChapterMarker[];
};

export type TranscriptSegment = {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
  speaker: string;
  sentiment: "positive" | "neutral" | "negative";
  paceWpm: number;
};

export type BehaviorPoint = {
  timeSec: number;
  paceWpm: number;
  pauseRate: number;
  sentiment: number;
};

export type SceneChange = {
  timeSec: number;
  confidence: number;
  description: string;
};

export type TimelineEvent = {
  timeSec: number;
  title: string;
  category: "scene" | "topic" | "emotion" | "insight";
  detail: string;
};

export type Insight = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  reasoning: string;
  evidence: {
    startSec: number;
    endSec: number;
    note: string;
  }[];
};

export type ViolationFlag = {
  timeSec: number;
  category: string;
  segmentId: string;
  snippet: string;
};

export type AnalysisResult = {
  uploadId: string;
  generatedAt: string;
  metadata: VideoMetadata;
  transcript: TranscriptSegment[];
  behaviors: BehaviorPoint[];
  scenes: SceneChange[];
  timeline: TimelineEvent[];
  insights: Insight[];
  violationFlags?: ViolationFlag[];
};
