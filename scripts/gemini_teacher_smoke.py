#!/usr/bin/env python3
"""Smoke-test Gemini teacher workers without exposing API keys.

Each configured worker performs exactly one minimal generateContent request. Results only
contain worker identity, model, HTTP status, parsed proposal and a coarse error category.
API key values and response headers are never persisted or printed.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

MODEL = os.environ.get("GEMINI_TEACHER_MODEL", "gemini-3.5-flash-lite")
OUT = Path(os.environ.get("GEMINI_TEACHER_SMOKE_OUT", "gemini-teacher-smoke.json"))
WORKERS = [
    ("teacher-1", "GEMINI_API_KEY"),
    ("teacher-2", "GEMINI_API_KEY_2"),
    ("teacher-3", "GEMINI_API_KEY_3"),
    ("teacher-4", "GEMINI_API_KEY_4"),
    ("teacher-5", "GEMINI_API_KEY_5"),
    ("teacher-6", "GEMINI_API_KEY_6"),
]
PROMPT = (
    "Connectivity smoke test for a local game-director teacher. "
    "Return JSON only with proposal set to NONE and confidence set to 1.0. "
    "Do not add explanation."
)


def request_once(worker: str, env_name: str) -> dict:
    key = os.environ.get(env_name, "").strip()
    if not key:
        return {"worker": worker, "model": MODEL, "status": "missing_secret"}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": PROMPT}]}],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": 64,
            "responseMimeType": "application/json",
        },
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            status = int(response.status)
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        return {
            "worker": worker,
            "model": MODEL,
            "status": "http_error",
            "httpStatus": int(error.code),
            "errorCategory": "rate_limited" if error.code == 429 else "request_rejected",
        }
    except Exception as error:  # fail closed; never serialize request/key data
        return {
            "worker": worker,
            "model": MODEL,
            "status": "transport_error",
            "errorCategory": error.__class__.__name__,
        }

    try:
        text = body["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text)
        proposal = str(parsed.get("proposal", "")).upper()
        confidence = float(parsed.get("confidence", 0.0))
        valid = proposal == "NONE" and 0.0 <= confidence <= 1.0
    except Exception:
        proposal = None
        confidence = None
        valid = False

    return {
        "worker": worker,
        "model": MODEL,
        "status": "ok" if valid else "invalid_response",
        "httpStatus": status,
        "proposal": proposal,
        "confidence": confidence,
    }


def main() -> int:
    results = [request_once(worker, env_name) for worker, env_name in WORKERS]
    healthy = sum(result["status"] == "ok" for result in results)
    report = {"model": MODEL, "healthyWorkers": healthy, "totalWorkers": len(results), "workers": results}
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Gemini teacher smoke: {healthy}/{len(results)} workers healthy")
    for result in results:
        suffix = f" http={result.get('httpStatus')}" if "httpStatus" in result else ""
        print(f"{result['worker']}: {result['status']}{suffix}")
    return 0 if healthy > 0 else 2


if __name__ == "__main__":
    sys.exit(main())
