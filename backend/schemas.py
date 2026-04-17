from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class UploadResponse(BaseModel):
    task_id: str
    analysis_id: str
    status: str
    video_url: str


class StatusResponse(BaseModel):
    task_id: str
    status: str
    result: dict[str, Any] | None = None
