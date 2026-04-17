from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class VideoAnalysis(Base):
    __tablename__ = "video_analysis"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False, default="upload")
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, index=True, default="pending")
    metadata_json: Mapped[str] = mapped_column("metadata", Text, nullable=True)
    transcript_json: Mapped[str] = mapped_column("transcript", Text, nullable=True)
    insights_json: Mapped[str] = mapped_column("insights", Text, nullable=True)
    result_json: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
