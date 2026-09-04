#!/usr/bin/env python3
"""Label exact WorldDirector V2 deployable feature strings with one Gemini key.

Each worker owns one deterministic shard, reads exactly one secret, stops on 429, never rotates keys,
and sends only featureTextV2 plus Core's legal proposal set. Hidden Level/canon/game authority is not
part of the teacher request.
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

PROPOSALS = ("NONE", "MAZE_PRESSURE", "ENTITY_PRESSURE", "ITEM_OPPORTUNITY")
REASONS = {
    "RECOVERY", "VARIETY", "ESCALATION", "RESOURCE_PACING", "EXPLORATION_PRESSURE",
    "SAFE_ABSTAIN", "ANTI_REPETITION", "LOCAL_CONTEXT", "OTHER",
}

SYSTEM = """You are a teacher for a tiny on-device WorldDirector V2 pacing classifier.
You receive ONLY the exact featureTextV2 that the eventual LiteRT model can observe and a legal
proposal set already computed by deterministic Core. Choose exactly one legal proposal per sample.

Interpret the V2 tokens as observable pacing memory:
- h1 is the most recent prior action/pressure, then h2, h3, h4.
- density/streak/since/entropy tokens summarize recent pacing, not hidden world facts.
- Prefer NONE after dense/repetitive pressure or when restraint improves pacing.
- Prefer ITEM_OPPORTUNITY when resource pacing is useful and legal.
- Prefer ENTITY_PRESSURE when exploration has been calm for long enough and it is legal.
- Prefer MAZE_PRESSURE for repeated/deep exploration when recent maze pressure is not already dense.
- Use variety and anti-repetition. Never infer Level identity, exits, puzzle solutions, secret evidence,
  Entity/item identity, inventory, player text, or private canon.

Return compact JSON only:
{"labels":[{"sampleId":"...","proposal":"...","confidence":0.0,"reasonCode":"..."}]}
Return one label for every supplied sampleId. confidence must be 0..1. reasonCode must be one of
RECOVERY, VARIETY, ESCALATION, RESOURCE_PACING, EXPLORATION_PRESSURE, SAFE_ABSTAIN,
ANTI_REPETITION, LOCAL_CONTEXT, OTHER.
"""


def calculated_id(feature_text: str) -> str:
    return hashlib.sha256(feature_text.encode("utf-8")).hexdigest()[:24]


def load_unique(path: Path, shard_index: int, shard_count: int, max_items: int, offset: int, seed: int) -> list[dict]:
    by_id: dict[str, dict] = {}
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            text = str(row.get("featureTextV2") or "").strip()
            sample_id = str(row.get("sampleIdV2") or "").strip()
            legal = tuple(str(value).upper() for value in ((row.get("state") or {}).get("legalProposals") or []))
            if not text or not sample_id or not legal:
                continue
            if sample_id != calculated_id(text):
                raise SystemExit(f"V2 sample id mismatch: {sample_id}")
            if any(value not in PROPOSALS for value in legal):
                raise SystemExit(f"invalid legal proposal for {sample_id}")
            if int(sample_id[:8], 16) % shard_count != shard_index:
                continue
            previous = by_id.get(sample_id)
            compact = {"sampleId": sample_id, "featureTextV2": text, "legalProposals": list(legal)}
            if previous is not None and previous != compact:
                raise SystemExit(f"conflicting V2 context for {sample_id}")
            by_id[sample_id] = compact

    rows = list(by_id.values())
    rows.sort(key=lambda row: (-len(row["legalProposals"]), row["sampleId"]))
    if offset >= len(rows):
        return []
    pool = rows[offset:]
    if len(pool) <= max_items:
        return pool

    # Preserve half high-choice contexts and spread the rest deterministically across the shard.
    head = max_items // 2
    selected = pool[:head]
    tail = pool[head:]
    random.Random(seed + shard_index + offset).shuffle(tail)
    selected.extend(tail[: max_items - head])
    return selected


def chunks(rows: list[dict], size: int):
    for index in range(0, len(rows), size):
        yield rows[index:index + size]


def strip_json(text: str) -> str:
    value = text.strip()
    if value.startswith("```"):
        first = value.find("\n")
        if first >= 0:
            value = value[first + 1:]
        fence = value.rfind("```")
        if fence >= 0:
            value = value[:fence]
    start = value.find("{")
    end = value.rfind("}")
    return value[start:end + 1] if start >= 0 and end > start else value.strip()


def call_batch(api_key: str, model: str, batch: list[dict]) -> tuple[str, dict[str, dict], int | None, list[str]]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    prompt = SYSTEM + "\nBATCH=" + json.dumps(batch, ensure_ascii=False, separators=(",", ":"))
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.10,
            "maxOutputTokens": max(512, 112 * len(batch)),
            "responseMimeType": "application/json",
        },
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
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

    expected = {row["sampleId"]: row for row in batch}
    valid: dict[str, dict] = {}
    invalid: list[str] = []
    try:
        content = body["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(strip_json(str(content)))
        returned = parsed.get("labels")
        if not isinstance(returned, list):
            return "invalid_response", {}, status, list(expected)
        seen = set()
        for item in returned:
            sample_id = str(item.get("sampleId") or "")
            if sample_id not in expected or sample_id in seen:
                continue
            seen.add(sample_id)
            proposal = str(item.get("proposal") or "").upper()
            reason = str(item.get("reasonCode") or "OTHER").upper()
            try:
                confidence = float(item.get("confidence"))
            except (TypeError, ValueError):
                invalid.append(sample_id)
                continue
            if proposal not in expected[sample_id]["legalProposals"] or not 0.0 <= confidence <= 1.0:
                invalid.append(sample_id)
                continue
            if reason not in REASONS:
                reason = "OTHER"
            valid[sample_id] = {"proposal": proposal, "confidence": confidence, "reasonCode": reason}
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
    parser.add_argument("--max-items", type=int, default=144)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--delay-seconds", type=float, default=25.0)
    parser.add_argument("--seed", type=int, default=2299)
    parser.add_argument("--model", default=os.environ.get("GEMINI_TEACHER_MODEL", "gemini-3.5-flash-lite"))
    args = parser.parse_args()

    if not 0 <= args.shard_index < args.shard_count:
        raise SystemExit("invalid shard index")
    if args.offset < 0 or args.batch_size < 1 or args.max_items < 1:
        raise SystemExit("invalid offset/batch/max-items")
    api_key = os.environ.get(args.key_env, "").strip()
    if not api_key:
        raise SystemExit(f"missing teacher secret env: {args.key_env}")

    rows = load_unique(Path(args.input), args.shard_index, args.shard_count, args.max_items, args.offset, args.seed)
    labels = []
    failures = []
    requests = 0
    rate_limited = False
    for batch_index, batch in enumerate(chunks(rows, args.batch_size)):
        requests += 1
        status, accepted, http_status, invalid_ids = call_batch(api_key, args.model, batch)
        for sample_id, label in accepted.items():
            source = next(row for row in batch if row["sampleId"] == sample_id)
            labels.append({
                "sampleId": sample_id,
                "worker": args.worker,
                "model": args.model,
                "featureTextV2": source["featureTextV2"],
                "legalProposals": source["legalProposals"],
                "label": label,
            })
        failures.extend({"sampleId": sample_id, "status": "invalid_label", "httpStatus": http_status} for sample_id in invalid_ids)
        if status != "ok" and not invalid_ids:
            failures.extend({"sampleId": row["sampleId"], "status": status, "httpStatus": http_status} for row in batch)
        if status == "rate_limited":
            rate_limited = True
            break
        if batch_index + 1 < ((len(rows) + args.batch_size - 1) // args.batch_size) and args.delay_seconds > 0:
            time.sleep(args.delay_seconds)

    with Path(args.output).open("w", encoding="utf-8") as handle:
        for row in labels:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")

    failure_counts: dict[str, int] = {}
    for failure in failures:
        failure_counts[failure["status"]] = failure_counts.get(failure["status"], 0) + 1
    report = {
        "contract": "WORLD_DIRECTOR_PRESSURE_V2",
        "worker": args.worker,
        "model": args.model,
        "selected": len(rows),
        "offset": args.offset,
        "batchSize": args.batch_size,
        "requestsAttempted": requests,
        "labeled": len(labels),
        "failed": len(failures),
        "rateLimited": rate_limited,
        "failureCounts": failure_counts,
        "secretPersisted": False,
    }
    Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))
    return 0 if labels else 2


if __name__ == "__main__":
    sys.exit(main())
