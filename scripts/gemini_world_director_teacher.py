#!/usr/bin/env python3
"""Label privacy-safe WorldDirector snapshots with one Gemini teacher worker.

The script reads exactly one API key, never rotates keys after rate limits, never logs prompt bodies
or provider responses, and only accepts proposals already present in each snapshot's Core-legal set.
Multiple safe snapshots are packed into one provider request to use request quota efficiently.
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
For EACH supplied sample, choose exactly one proposal from that sample's legalProposals.
Judge pacing from recent observable history only. Prefer recovery after combat or dense recent
pressure, avoid repeating the same pressure too often, use NONE when additional pressure would be
excessive, and preserve variety across maze/entity/item pressure. Never infer or reason about hidden
exits, puzzle solutions, secret evidence, Level IDs, Entity identities, or canon not present in the
safe samples.
Return JSON only in this exact shape:
{"labels":[{"sampleId":"...","proposal":"NONE","confidence":0.9,"reasonCode":"RECOVERY"}]}
Return exactly one label for every supplied sampleId and no unknown sampleIds.
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

    head = max_items // 2
    selected = pool[:head]
    rest = pool[head:]
    random.Random(seed + shard_index + offset).shuffle(rest)
    selected.extend(rest[: max_items - head])
    return selected


def compact_snapshot(snapshot: dict) -> dict:
    return {
        "state": snapshot.get("state"),
        "history": (snapshot.get("history") or [])[-12:],
    }


def chunks(rows: list[dict], size: int):
    for index in range(0, len(rows), size):
        yield rows[index:index + size]


def call_teacher_batch(
    api_key: str,
    model: str,
    snapshots: list[dict],
) -> tuple[str, dict[str, dict], int | None, list[str]]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    batch = [
        {"sampleId": stable_id(snapshot), "snapshot": compact_snapshot(snapshot)}
        for snapshot in snapshots
    ]
    prompt = SYSTEM + "\nSAFE_BATCH=" + json.dumps(batch, ensure_ascii=False, separators=(",", ":"))
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.15,
            "maxOutputTokens": max(384, 112 * len(batch)),
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
        with urllib.request.urlopen(request, timeout=60) as response:
            status = int(response.status)
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        if error.code == 429:
            return "rate_limited", {}, int(error.code), []
        return "http_error", {}, int(error.code), []
    except Exception:
        return "transport_error", {}, None, []

    expected = {stable_id(snapshot): snapshot for snapshot in snapshots}
    valid: dict[str, dict] = {}
    invalid: list[str] = []
    try:
        text = body["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text)
        returned = parsed.get("labels")
        if not isinstance(returned, list):
            return "invalid_response", {}, status, list(expected)
        seen = set()
        for item in returned:
            sample_id = str(item.get("sampleId", ""))
            if sample_id not in expected or sample_id in seen:
                continue
            seen.add(sample_id)
            proposal = str(item.get("proposal", "")).upper()
            try:
                confidence = float(item.get("confidence"))
            except (TypeError, ValueError):
                invalid.append(sample_id)
                continue
            reason = str(item.get("reasonCode", "OTHER")).upper()
            legal = set((expected[sample_id].get("state") or {}).get("legalProposals") or [])
            if proposal not in legal or proposal not in ALLOWED_PROPOSALS or not 0.0 <= confidence <= 1.0:
                invalid.append(sample_id)
                continue
            if reason not in ALLOWED_REASON_CODES:
                reason = "OTHER"
            valid[sample_id] = {
                "proposal": proposal,
                "confidence": confidence,
                "reasonCode": reason,
            }
        invalid.extend(sample_id for sample_id in expected if sample_id not in seen)
    except Exception:
        return "invalid_response", {}, status, list(expected)

    return "ok" if valid else "invalid_response", valid, status, sorted(set(invalid))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--report", required=True)
    parser.add_argument("--worker", required=True)
    parser.add_argument("--key-env", required=True)
    parser.add_argument("--shard-index", type=int, required=True)
    parser.add_argument("--shard-count", type=int, default=6)
    parser.add_argument("--max-items", type=int, default=96)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=6)
    parser.add_argument("--delay-seconds", type=float, default=25.0)
    parser.add_argument("--seed", type=int, default=2299)
    parser.add_argument("--model", default=os.environ.get("GEMINI_TEACHER_MODEL", "gemini-3.5-flash-lite"))
    args = parser.parse_args()

    if not 0 <= args.shard_index < args.shard_count:
        raise SystemExit("invalid shard index")
    if args.offset < 0 or args.batch_size <= 0:
        raise SystemExit("offset must be non-negative and batch-size positive")
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
    requests_attempted = 0

    snapshot_by_id = {stable_id(snapshot): snapshot for snapshot in snapshots}
    batches = list(chunks(snapshots, args.batch_size))
    for batch_index, batch in enumerate(batches):
        requests_attempted += 1
        status, batch_labels, http_status, invalid_ids = call_teacher_batch(api_key, args.model, batch)
        for sample_id, label in batch_labels.items():
            labels.append({
                "sampleId": sample_id,
                "worker": args.worker,
                "model": args.model,
                "label": label,
                "snapshot": snapshot_by_id[sample_id],
            })
        for sample_id in invalid_ids:
            failures.append({"sampleId": sample_id, "status": "invalid_label", "httpStatus": http_status})
        if status != "ok" and not invalid_ids:
            failures.extend(
                {"sampleId": stable_id(snapshot), "status": status, "httpStatus": http_status}
                for snapshot in batch
            )
        if status == "rate_limited":
            rate_limited = True
            break
        if batch_index + 1 < len(batches) and args.delay_seconds > 0:
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
        "batchSize": args.batch_size,
        "requestsAttempted": requests_attempted,
        "labeled": len(labels),
        "failed": len(failures),
        "rateLimited": rate_limited,
        "failureCounts": {},
    }
    for failure in failures:
        report["failureCounts"][failure["status"]] = report["failureCounts"].get(failure["status"], 0) + 1
    Path(args.report).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(
        f"{args.worker}: offset={args.offset} requests={requests_attempted} "
        f"labeled={len(labels)} failed={len(failures)} rateLimited={rate_limited}"
    )
    return 0 if labels else 2


if __name__ == "__main__":
    sys.exit(main())
