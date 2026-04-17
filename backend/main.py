from __future__ import annotations

import json
import os
import tempfile
import uuid
from io import BytesIO
from typing import Any

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy import select, text

from database import Base, SessionLocal, engine
from models import VideoAnalysis
from schemas import StatusResponse, UploadResponse
from tasks import process_video_task

ALLOWED_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo"}
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")

app = FastAPI(title="Video Transcript Correlation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)


def _ensure_schema_compatibility() -> None:
    """Best-effort additive migration for local MVP runs."""
    with engine.begin() as conn:
        if engine.dialect.name == "sqlite":
            existing = {
                row[1]
                for row in conn.execute(text("PRAGMA table_info(video_analysis)"))
            }
            if not existing:
                return

            if "file_path" not in existing:
                conn.execute(text("ALTER TABLE video_analysis ADD COLUMN file_path VARCHAR(1024)"))
            if "metadata" not in existing:
                conn.execute(text("ALTER TABLE video_analysis ADD COLUMN metadata TEXT"))
            if "transcript" not in existing:
                conn.execute(text("ALTER TABLE video_analysis ADD COLUMN transcript TEXT"))
            if "insights" not in existing:
                conn.execute(text("ALTER TABLE video_analysis ADD COLUMN insights TEXT"))
            if "result_json" not in existing:
                conn.execute(text("ALTER TABLE video_analysis ADD COLUMN result_json TEXT"))

            if "file_name" in existing:
                conn.execute(
                    text(
                        "UPDATE video_analysis SET file_path = COALESCE(file_path, file_name) "
                        "WHERE file_path IS NULL OR file_path = ''"
                    )
                )


Base.metadata.create_all(bind=engine)
_ensure_schema_compatibility()
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def _build_pdf(analysis: dict[str, Any]) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    _, height = letter

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(40, height - 50, "Video Correlation Report")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(40, height - 80, f"Upload ID: {analysis.get('uploadId', '-')}")
    pdf.drawString(40, height - 95, f"Generated: {analysis.get('generatedAt', '-')}")

    y = height - 130
    metadata = analysis.get("metadata", {})
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(40, y, "Metadata")
    pdf.setFont("Helvetica", 11)
    y -= 18
    pdf.drawString(40, y, f"Duration: {metadata.get('durationSec', 0)}s")
    y -= 16
    pdf.drawString(40, y, f"Resolution: {metadata.get('resolution', '-')}")
    y -= 16
    pdf.drawString(40, y, f"FPS: {metadata.get('fps', 0)}")
    y -= 16
    pdf.drawString(40, y, f"Bitrate: {metadata.get('bitrateKbps', 0)} kbps")
    y -= 16
    pdf.drawString(40, y, f"Chapter markers: {len(metadata.get('chapters', []))}")
    y -= 16
    pdf.drawString(40, y, f"Scenes detected: {len(analysis.get('scenes', []))}")
    y -= 16
    pdf.drawString(40, y, f"Timeline events: {len(analysis.get('timeline', []))}")

    y -= 28
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(40, y, "Insights")
    y -= 18
    pdf.setFont("Helvetica", 11)
    for insight in analysis.get("insights", []):
        if y < 80:
            pdf.showPage()
            y = height - 60
        pdf.drawString(40, y, f"- {insight.get('title', '-')}")
        y -= 16

    y -= 8
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(40, y, "Violation Flags")
    y -= 18
    pdf.setFont("Helvetica", 11)
    for flag in analysis.get("violationFlags", []):
        if y < 80:
            pdf.showPage()
            y = height - 60
        pdf.drawString(40, y, f"- {flag.get('timeSec', 0)}s [{flag.get('category', '-')}] {flag.get('snippet', '-')[:70]}")
        y -= 16

    y -= 8
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(40, y, "Timeline Highlights")
    y -= 18
    pdf.setFont("Helvetica", 11)
    for event in analysis.get("timeline", [])[:15]:
        if y < 80:
            pdf.showPage()
            y = height - 60
        pdf.drawString(
            40,
            y,
            f"- {event.get('timeSec', 0)}s [{event.get('category', '-')}] {event.get('title', '-')}",
        )
        y -= 16

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer.read()


@app.post("/upload", response_model=UploadResponse)
async def upload(request: Request, file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported file format. Use MP4, MOV, or AVI.")

    suffix = os.path.splitext(file.filename or "video.mp4")[1] or ".mp4"
    stored_name = f"{uuid.uuid4()}{suffix}"
    temp_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(temp_path, "wb") as temp_file:
        temp_file.write(await file.read())

    base_url = str(request.base_url).rstrip("/")

    db = SessionLocal()
    try:
        analysis = VideoAnalysis(
            task_id="pending",
            file_name=file.filename or stored_name,
            file_path=temp_path,
            status="pending",
            metadata_json=None,
            transcript_json=None,
            insights_json=None,
            result_json=None,
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        task = process_video_task.delay(str(analysis.id), temp_path)
        analysis.task_id = task.id
        db.commit()

        return UploadResponse(
            task_id=task.id,
            analysis_id=str(analysis.id),
            status=analysis.status,
            video_url=f"{base_url}/uploads/{stored_name}",
        )
    except Exception:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise
    finally:
        db.close()


@app.get("/status/{task_id}", response_model=StatusResponse)
async def status(task_id: str):
    db = SessionLocal()
    try:
        row = db.execute(select(VideoAnalysis).where(VideoAnalysis.task_id == task_id)).scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Task not found")

        if row.result_json:
            result = json.loads(row.result_json)
        elif row.metadata_json or row.transcript_json or row.insights_json:
            parsed_metadata = json.loads(row.metadata_json) if row.metadata_json else {}
            result = {
                "metadata": parsed_metadata,
                "scenes": parsed_metadata.get("sceneCuts", []),
                "transcript": json.loads(row.transcript_json) if row.transcript_json else [],
                "insights": json.loads(row.insights_json) if row.insights_json else [],
            }
        else:
            result = None
        return StatusResponse(task_id=task_id, status=row.status, result=result)
    finally:
        db.close()


@app.post("/export")
async def export(payload: dict[str, Any]):
    analysis = payload.get("analysis")
    format_type = payload.get("format", "json")

    if not analysis:
        raise HTTPException(status_code=400, detail="Missing analysis payload")

    if format_type == "pdf":
        pdf_bytes = _build_pdf(analysis)
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=analysis-report.pdf"},
        )

    return JSONResponse(content={"report": analysis})


@app.get("/health")
async def health():
    return {"status": "ok"}