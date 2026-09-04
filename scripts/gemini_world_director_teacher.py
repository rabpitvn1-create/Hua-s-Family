#!/usr/bin/env python3
"""Label privacy-safe WorldDirector snapshots with one Gemini teacher worker.

The script never reads more than one API key, never rotates keys after rate limits, never logs
prompt bodies or provider responses, and only accepts proposals already present in the snapshot's
Core-legal proposal set.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ALLOWED_PROPOSALS = {"NONE", "MAZE_PRESSURE", "ENTITY_PRESSURE", "ITEM_OPPORTUNITY"}
ALLOWED_REASON_CODES = {
    "RECOVERY",
    "VARIETY",
    "ESCALATION",
    "RESOURCE_PACING",
    "EXPLORATION_PRESSURE",
    "SAFE_ABSTAIN",
    "ANTI_REPETITION",
    "OTHER",
}

SYSTEM = """You are a teacher for a small on-device game pacing policy.
Choose exactly one proposal from legalProposals. Judge pacing from recent observable history only.
Prefer recovery after combat or dense recent pressure, avoid repeating the same pressure too often,
use NONE when additional pressure would be excessive, and preserve variety across maze/entity/item
pressure. Never infer or reason about hidden exits, puzzle solutions, secret evidence, Level IDs,
Entity identities, or canon not present in the supplied safe snapshot.
Return JSON only with keys: proposal, confidence, reasonCode.
confidence must be a number from 0 to 1.
reasonCode must be one of RECOVERY, VARIETY, ESCALATION, RESOURCE_PACING,
EXPLORATION_PRESSURE, SAFE_ABSTAIN, ANTI_REPETITION, OTHER.
"""


def stable_id(snapshot: dict) -> str:
    payload = f"{snapshot.get('sessionId')}|{snapshot.get('turnIndex')}|{snapshot.get('featureTextV1')}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:20]


def priority(snapshot: dict) -> tuple:
    state = snapshot.get("state") or {}
    legal = state.get("legalProposals") or []
    history = snapshot.get("history") or []
    recent_pressure_types = len({row.get("pressure") for row in history[-8:] if row.get("pressure")})
    danger = (
        float(state.get("combatDensity8", 0))
        + float(state.get("entityPressureDensity8", 0))
        + float(state.get("itemOpportunityDensity8", 0))
        + float(state.get("mazePressureDensity8", 0))
    )
    return (-len(legal), -recent_pressure_types, -danger, stable_id(snapshot))


def load_shard(
    path: Path,
    shard_index: int,
    shard_count: int,
    max_items: int,
    offset: int,
    seed: int,
) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            snapshot = json.loads(line)
            sample_id = stable_id(snapshot)
            slot = int(sample_id[:8], 16) % shard_count
            if slot != shard_index:
                continue
            legal = set((snapshot.get("state") or {}).get("legalProposals") or [])
            if not legal or not legal <= ALLOWED_PROPOSALS:
                continue
            rows.append(snapshot)

    rows.sort(key=priority)
    if offset >= len(rows):
        return []
    pool = rows[offset:]
    if len(pool) <= max_items:
        return pool

    # Keep the most informative half from this page, then deterministic diversity from its tail.
    head = max_items // 2
    selected = pool[:head]
    rest = pool[head:]
    random.Random(seed + shard_index + offset).shuffle(rest)
    selected.extend(rest[: max_items - head])
    return selected


def compact_snapshot(snapshot: dict) -> dict:
    return {
        "featureTextV1": snapshot.get("featureTextV1"),
        "state": snapshot.get("state"),
        "history": (snapshot.get("history") or [])[-16:],
    }


def call_teacher(api_key: str, model: str, snapshot: dict) -> tuple[str, dict | None, int | None]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    prompt = SYSTEM + "\nSAFE_SNAPSHOT=" + json.dumps(compact_snapshot(snapshot), ensure_ascii=False, separators=(",", ":"))
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.15,
            "maxOutputTokens": 96,
            "responseMimeType": "application/json",
        },
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            status = int(response.status)
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        if error.code == 429:
            return "rate_limited", None, int(error.code)
        return "http_error", None, int(error.code)
    except Exception:
        return "transport_error", None, None

    try:
        text = body["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text)
        proposal = str(parsed.get("proposal", "")).upper()
        confidence = float(parsed.get("confidence"))
        reason = str(parsed.get("reasonCode", "OTHER")).upper()
        legal = set((snapshot.get("state") or {}).get("legalProposals") or [])
        if proposal not in legal or proposal not in ALLOWED_PROPOSALS:
            return "invalid_proposal", None, status
        if not 0.0 <= confidence <= 1.0:
            return "invalid_confidence", None, status
        if reason not in ALLOWED_REASON_CODES:
            reason = "OTHER"
        return "ok", {"proposal": proposal, "confidence": confidence, "reasonCode": reason}, status
    except Exception:
        return "invalid_response", None, status


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--report", required=True)
    parser.add_argument("--worker", required=True)
    parser.add_argument("--key-env", required=True)
    parser.add_argument("--shard-index", type=int, required=True)
    parser.add_argument("--shard-count", type=int, default=6)
    parser.add_argument("--max-items", type=int, default=48)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--delay-seconds", type=float, default=15.0)
    parser.add_argument("--seed", type=int, default=2299)
    parser.add_argument("--model", default=os.environ.get("GEMINI_TEACHER_MODEL", "gemini-3.5-flash-lite"))
    args = parser.parse_args()

    if not 0 <= args.shard_index < args.shard_count:
        raise SystemExit("invalid shard index")
    if args.offset < 0:
        raise SystemExit("offset must be non-negative")
    api_key = os.environ.get(args.key_env, "").strip()
    if not api_key:
        raise SystemExit(f"missing teacher secret env: {args.key_env}")

    snapshots = load_shard(
        Path(args.input),
        args.shard_index,
        args.shard_count,
        args.max_items,
        args.offset,
        args.seed,
    )
    labels = []
    failures = []
    rate_limited = False

    for index, snapshot in enumerate(snapshots):
        status, label, http_status = call_teacher(api_key, args.model, snapshot)
        sample_id = stable_id(snapshot)
        if status == "ok" and label:
            labels.append({
                "sampleId": sample_id,
                "worker": args.worker,
                "model": args.model,
                "label": label,
                "snapshot": snapshot,
            })
        else:
            failures.append({"sampleId": sample_id, "status": status, "httpStatus": http_status})
        if status == "rate_limited":
            rate_limited = True
            break
        if index + 1 < len(snapshots) and args.delay_seconds > 0:
            time.sleep(args.delay_seconds)

    out = Path(args.output)
    with out.open("w", encoding="utf-8") as handle:
        for row in labels:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")

    report = {
        "worker": args.worker,
        "model": args.model,
        "offset": args.offset,
        "selected": len(snapshots),
        "labeled": len(labels),
        "failed": len(failures),
        "rateLimited": rate_limited,
        "failureCounts": {},
    }
    for failure in failures:
        report["failureCounts"][failure["status"]] = report["failureCounts"].get(failure["status"], 0) + 1
    Path(args.report).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(
        f"{args.worker}: offset={args.offset} labeled={len(labels)} "
        f"failed={len(failures)} rateLimited={rate_limited}"
    )
    return 0 if labels else 2


if __name__ == "__main__":
    sys.exit(main())
