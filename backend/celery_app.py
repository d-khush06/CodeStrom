from __future__ import annotations

import os

from celery import Celery

REDIS_URL = os.getenv("REDIS_URL")

if REDIS_URL:
    broker_url = REDIS_URL
    result_backend = REDIS_URL
    task_always_eager = False
else:
    broker_url = "memory://"
    result_backend = "cache+memory://"
    task_always_eager = True

celery_app = Celery(
    "video_analytics",
    broker=broker_url,
    backend=result_backend,
)

celery_app.conf.update(
    task_track_started=True,
    result_expires=3600,
    task_always_eager=task_always_eager,
)
