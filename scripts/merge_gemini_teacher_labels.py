#!/usr/bin/env python3
"""Merge independent Gemini teacher shards into one deterministic training artifact."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--labels-dir", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--report", required=True)
    args = parser.parse_args()

    rows = []
    seen = set()
    duplicates = 0
    for path in sorted(Path(args.labels_dir).glob("teacher-*.jsonl")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                row = json.loads(line)
                sample_id = row["sampleId"]
                if sample_id in seen:
                    duplicates += 1
                    continue
                seen.add(sample_id)
                rows.append(row)
    rows.sort(key=lambda row: row["sampleId"])

    with Path(args.output).open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")

    worker_counts = Counter(row["worker"] for row in rows)
    proposal_counts = Counter(row["label"]["proposal"] for row in rows)
    reason_counts = Counter(row["label"]["reasonCode"] for row in rows)
    confidences = [float(row["label"]["confidence"]) for row in rows]
    report = {
        "labels": len(rows),
        "duplicatesDropped": duplicates,
        "workers": dict(sorted(worker_counts.items())),
        "proposals": dict(sorted(proposal_counts.items())),
        "reasonCodes": dict(sorted(reason_counts.items())),
        "meanConfidence": round(sum(confidences) / len(confidences), 4) if confidences else 0.0,
    }
    Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))
    return 0 if rows else 2


if __name__ == "__main__":
    raise SystemExit(main())
