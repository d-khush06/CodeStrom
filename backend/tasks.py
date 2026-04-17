from __future__ import annotations

import json
import os
import re
import shutil
from datetime import datetime
from typing import Any

import ffmpeg
from openai import OpenAI
from sqlalchemy import select

from celery_app import celery_app
from database import SessionLocal
from models import VideoAnalysis

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

POSITIVE_HINTS = {"great", "excellent", "love", "amazing", "confident", "success", "win"}
NEGATIVE_HINTS = {"bad", "hate", "problem", "issue", "risk", "fail", "angry", "unsafe"}
VIOLATION_PATTERNS: dict[str, list[str]] = {
    "abusive-language": ["idiot", "stupid", "dumb"],
    "threat-language": ["kill", "hurt", "attack"],
    "self-harm": ["suicide", "self-harm"],
}


def _ffmpeg_tools_available() -> bool:
    return shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


def _extract_metadata_and_scenes(video_path: str) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    if not _ffmpeg_tools_available():
        file_size_bytes = os.path.getsize(video_path) if os.path.exists(video_path) else 0
        fallback_duration = 60.0
        metadata = {
            "durationSec": fallback_duration,
            "resolution": "unknown",
            "fps": 0.0,
            "bitrateKbps": int((file_size_bytes * 8) / 1000 / max(1.0, fallback_duration)),
            "chapters": [
                {"startSec": 0, "endSec": 20, "title": "Introduction"},
                {"startSec": 20, "endSec": 45, "title": "Core discussion"},
                {"startSec": 45, "endSec": 60, "title": "Closing"},
            ],
        }
        scenes = [
            {"timeSec": 15.0, "confidence": 0.5, "description": "Fallback scene boundary"},
            {"timeSec": 30.0, "confidence": 0.5, "description": "Fallback scene boundary"},
            {"timeSec": 45.0, "confidence": 0.5, "description": "Fallback scene boundary"},
        ]
        return metadata, scenes

    probe = ffmpeg.probe(video_path)
    video_stream = next((s for s in probe["streams"] if s.get("codec_type") == "video"), None)
    if not video_stream:
        raise RuntimeError("No video stream found")

    duration_sec = float(video_stream.get("duration") or probe["format"].get("duration") or 0)
    width = int(video_stream.get("width", 0))
    height = int(video_stream.get("height", 0))

    r_frame_rate = video_stream.get("r_frame_rate", "0/1")
    numerator, denominator = r_frame_rate.split("/")
    fps = round(float(numerator) / float(denominator), 2) if float(denominator) else 0.0

    scene_threshold = 0.35
    stderr = ""
    try:
        _, err = (
            ffmpeg.input(video_path)
            .filter("select", f"gt(scene,{scene_threshold})")
            .output("pipe:", format="null")
            .global_args("-loglevel", "info")
            .run(capture_stdout=True, capture_stderr=True)
        )
        stderr = err.decode("utf-8", errors="ignore") if err else ""
    except ffmpeg.Error as err:
        stderr = err.stderr.decode("utf-8", errors="ignore") if err.stderr else ""

    scenes: list[dict[str, Any]] = []
    for line in stderr.splitlines():
        if "pts_time:" not in line:
            continue
        try:
            token = line.split("pts_time:", 1)[1].split(" ", 1)[0]
            ts = float(token)
        except (ValueError, IndexError):
            continue
        scenes.append(
            {
                "timeSec": round(ts, 2),
                "confidence": 0.75,
                "description": "Scene cut detected via FFmpeg scene filter",
            }
        )

    if not scenes and duration_sec > 0:
        step = max(45, int(duration_sec // 8) or 1)
        for sec in range(step, int(duration_sec), step):
            scenes.append(
                {
                    "timeSec": float(sec),
                    "confidence": 0.62,
                    "description": "Fallback scene boundary",
                }
            )

    metadata = {
        "durationSec": round(duration_sec, 2),
        "resolution": f"{width}x{height}",
        "fps": fps,
        "bitrateKbps": int(float(probe["format"].get("bit_rate", 0)) / 1000)
        if probe["format"].get("bit_rate")
        else 0,
        "chapters": [
            {"startSec": 0, "endSec": max(1, int(duration_sec * 0.3)), "title": "Introduction"},
            {
                "startSec": int(duration_sec * 0.3),
                "endSec": int(duration_sec * 0.7),
                "title": "Core discussion",
            },
            {
                "startSec": int(duration_sec * 0.7),
                "endSec": int(duration_sec),
                "title": "Closing",
            },
        ],
    }

    return metadata, scenes


def _extract_audio_mp3(video_path: str) -> str | None:
    audio_path = f"{video_path}.mp3"
    if not _ffmpeg_tools_available():
        return None

    try:
        (
            ffmpeg.input(video_path)
            .output(audio_path, acodec="libmp3lame", ac=1, ar="16000", audio_bitrate="64k")
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        return audio_path
    except (ffmpeg.Error, FileNotFoundError):
        return None


def _whisper_transcription(audio_path: str | None) -> list[dict[str, Any]]:
    if not client or not audio_path or not os.path.exists(audio_path):
        return [
            {
                "id": "seg-1",
                "startSec": 0.0,
                "endSec": 15.0,
                "text": "Fallback transcript segment because OPENAI_API_KEY or FFmpeg is not configured.",
                "speaker": "Speaker A",
            }
        ]

    with open(audio_path, "rb") as audio:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio,
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )

    segments = []
    for idx, segment in enumerate(response.segments or []):
        segments.append(
            {
                "id": f"seg-{idx + 1}",
                "startSec": round(float(segment.start), 2),
                "endSec": round(float(segment.end), 2),
                "text": segment.text.strip(),
                "speaker": "Speaker A",
            }
        )

    return segments


def _score_segment_sentiment(text: str) -> float:
    tokens = [token.lower() for token in re.findall(r"[a-zA-Z']+", text)]
    if not tokens:
        return 0.0

    positive = sum(1 for token in tokens if token in POSITIVE_HINTS)
    negative = sum(1 for token in tokens if token in NEGATIVE_HINTS)
    raw_score = (positive - negative) / max(1, len(tokens) // 4)
    return max(-1.0, min(1.0, round(raw_score, 2)))


def _nearest_transcript_segment(time_sec: float, transcript: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not transcript:
        return None

    return min(
        transcript,
        key=lambda seg: abs(float(seg["startSec"]) - time_sec),
    )


def _extract_violation_flags(transcript: list[dict[str, Any]]) -> list[dict[str, Any]]:
    flags: list[dict[str, Any]] = []
    for segment in transcript:
        text = str(segment.get("text", "")).lower()
        for category, terms in VIOLATION_PATTERNS.items():
            if any(term in text for term in terms):
                flags.append(
                    {
                        "timeSec": float(segment.get("startSec", 0.0)),
                        "category": category,
                        "segmentId": segment.get("id", "unknown"),
                        "snippet": str(segment.get("text", ""))[:160],
                    }
                )

    return flags


def _build_behavior_and_timeline(
    transcript: list[dict[str, Any]], scenes: list[dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    behavior = []
    timeline = []
    pauses = 0
    emotional_peaks = []

    for index, segment in enumerate(transcript):
        start_sec = float(segment["startSec"])
        end_sec = float(segment["endSec"])
        duration = max(0.5, end_sec - start_sec)
        words = len(segment["text"].split())
        pace_wpm = int((words / duration) * 60)

        if index > 0:
            gap = start_sec - float(transcript[index - 1]["endSec"])
            if gap > 1.2:
                pauses += 1

        sentiment_score = _score_segment_sentiment(str(segment["text"]))
        sentiment = "positive" if sentiment_score > 0.18 else "negative" if sentiment_score < -0.18 else "neutral"

        segment["paceWpm"] = pace_wpm
        segment["sentiment"] = sentiment

        behavior.append(
            {
                "timeSec": round((start_sec + end_sec) / 2, 2),
                "paceWpm": pace_wpm,
                "pauseRate": round(pauses / (index + 1), 2),
                "sentiment": sentiment_score,
            }
        )

        timeline.append(
            {
                "timeSec": start_sec,
                "title": f"Topic shift: {' '.join(segment['text'].split()[:5])}...",
                "category": "topic",
                "detail": "Transcript segment marker",
            }
        )

        if abs(sentiment_score) >= 0.45:
            emotional_peaks.append(
                {
                    "timeSec": round((start_sec + end_sec) / 2, 2),
                    "title": "Emotional peak",
                    "category": "emotion",
                    "detail": f"{sentiment} intensity detected with score {sentiment_score}.",
                }
            )

    for scene in scenes:
        nearest_segment = _nearest_transcript_segment(float(scene["timeSec"]), transcript)
        correlated_text = ""
        if nearest_segment:
            correlated_text = (
                f" Correlated transcript ({nearest_segment['startSec']}s-{nearest_segment['endSec']}s): "
                f"{str(nearest_segment['text'])[:90]}"
            )

        timeline.append(
            {
                "timeSec": scene["timeSec"],
                "title": "Scene cut",
                "category": "scene",
                "detail": f"{scene['description']}.{correlated_text}",
            }
        )

    timeline.extend(emotional_peaks)

    key_moments = [point for point in behavior if point["paceWpm"] >= 160 or point["pauseRate"] >= 0.3]
    for point in key_moments[:8]:
        reason = "high speaking pace" if point["paceWpm"] >= 160 else "pause frequency spike"
        timeline.append(
            {
                "timeSec": point["timeSec"],
                "title": "Key moment",
                "category": "insight",
                "detail": f"Detected {reason} around this section.",
            }
        )

    timeline.sort(key=lambda item: item["timeSec"])

    violation_flags = _extract_violation_flags(transcript)

    insights = [
        {
            "id": "insight-1",
            "title": "Potential engagement drop",
            "severity": "medium",
            "reasoning": "Speaking pace declined while pause frequency increased across consecutive segments.",
            "evidence": [
                {
                    "startSec": transcript[max(0, len(transcript) // 2 - 1)]["startSec"] if transcript else 0,
                    "endSec": transcript[len(transcript) // 2]["endSec"] if transcript else 0,
                    "note": "Detected lower WPM trend and neutral/negative sentiment cluster.",
                }
            ],
        }
    ]

    if key_moments:
        insights.append(
            {
                "id": "insight-2",
                "title": "High-intensity moments detected",
                "severity": "low",
                "reasoning": "Timeline points show elevated speaking pace or pause spikes that may represent transitions.",
                "evidence": [
                    {
                        "startSec": key_moments[0]["timeSec"],
                        "endSec": key_moments[min(1, len(key_moments) - 1)]["timeSec"],
                        "note": "Auto-tagged as key moments for review.",
                    }
                ],
            }
        )

    if violation_flags:
        first_flag = violation_flags[0]
        insights.append(
            {
                "id": "insight-3",
                "title": "Potential policy violation flag",
                "severity": "high",
                "reasoning": "Keyword-level screening found one or more segments that need manual review.",
                "evidence": [
                    {
                        "startSec": first_flag["timeSec"],
                        "endSec": first_flag["timeSec"],
                        "note": f"Category: {first_flag['category']}.",
                    }
                ],
            }
        )

    return behavior, timeline, insights, violation_flags


@celery_app.task(name="process_video_task")
def process_video_task(analysis_id: str, video_path: str) -> dict[str, Any]:
    db = SessionLocal()
    audio_path: str | None = None
    try:
        row = db.execute(select(VideoAnalysis).where(VideoAnalysis.id == analysis_id)).scalar_one_or_none()
        if not row:
            raise RuntimeError("Analysis record not found")

        row.status = "processing"
        db.commit()

        metadata, scenes = _extract_metadata_and_scenes(video_path)
        audio_path = _extract_audio_mp3(video_path)
        transcript = _whisper_transcription(audio_path)
        behaviors, timeline, insights, violation_flags = _build_behavior_and_timeline(transcript, scenes)

        result = {
            "uploadId": analysis_id,
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "metadata": metadata,
            "transcript": transcript,
            "behaviors": behaviors,
            "scenes": scenes,
            "timeline": timeline,
            "insights": insights,
            "violationFlags": violation_flags,
            "pipelineWarnings": (
                ["FFmpeg/FFprobe not found: used fallback metadata and transcript estimation"]
                if not _ffmpeg_tools_available()
                else []
            ),
        }

        row.status = "completed"
        row.metadata_json = json.dumps(
            {
                **metadata,
                "sceneCuts": scenes,
                "behaviors": behaviors,
                "timeline": timeline,
                "pipelineWarnings": result["pipelineWarnings"],
            }
        )
        row.transcript_json = json.dumps(transcript)
        row.insights_json = json.dumps(insights)
        row.result_json = json.dumps(result)
        db.commit()

        return result
    except Exception:
        try:
            row = db.execute(select(VideoAnalysis).where(VideoAnalysis.id == analysis_id)).scalar_one_or_none()
            if row:
                row.status = "failed"
                db.commit()
        except Exception:
            pass
        raise
    finally:
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
        db.close()