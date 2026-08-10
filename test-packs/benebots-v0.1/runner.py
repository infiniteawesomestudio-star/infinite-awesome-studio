#!/usr/bin/env python3
"""BeneBots Answer Fidelity Pack — deterministic runner.

System under test: the benebots-proxy Worker over HTTP, not a prompt file.

Scoring is deterministic on purpose. Plan facts are facts, so an LLM judge would
add variance we do not have to accept here — which is the opposite of the
Infinite Sidekick packs, where judgement is unavoidable.

Commands
  validate   structural check of manifest + cases, no network
  selftest   OFFLINE positive control. Proves each assertion type can both PASS
             and FAIL before any live result is trusted. Run this first, always.
  run        live suite against the worker

Python 3.9+, stdlib only.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

PACK_DIR = Path(__file__).resolve().parent
MANIFEST_PATH = PACK_DIR / "manifest.json"
CASES_PATH = PACK_DIR / "cases.json"
RESULTS_DIR = PACK_DIR / "results"

AMOUNT_RE = re.compile(r"\$\s?\d[\d,]*")


class PackError(Exception):
    pass


# ─── assertion engine ────────────────────────────────────────────────────────

def check(case: Dict[str, Any], response: str) -> Tuple[bool, List[str]]:
    """Return (passed, failures). Pure function — this is what selftest exercises."""
    hay = response.lower()
    fails: List[str] = []

    for needle in case.get("contains_all", []):
        if needle.lower() not in hay:
            fails.append("missing required %r" % needle)

    for needle in case.get("contains_none", []):
        if needle.lower() in hay:
            fails.append("contains forbidden %r" % needle)

    patterns = case.get("regex_any", [])
    if patterns:
        if not any(re.search(p, response, re.I) for p in patterns):
            fails.append("no regex_any pattern matched")

    if case.get("expect_refusal"):
        refs = case.get("refusal_must_reference_any", [])
        if refs and not any(r.lower() in hay for r in refs):
            fails.append("refusal did not reference any of %s" % refs)
        # A refusal that still quotes a figure is normally not a refusal — that is
        # the invented-number failure mode. But a SCOPED refusal is different: on
        # B-01 the bot correctly declines to give medical advice and then answers
        # the benefits half of the question, where real plan figures belong.
        # Distinguishing the two is the whole point of the flag.
        if not case.get("refusal_allows_amounts"):
            found = AMOUNT_RE.findall(response)
            if found:
                fails.append("expected refusal but stated amount(s) %s" % found)

    return (not fails), fails


# ─── loading + validation ────────────────────────────────────────────────────

def load() -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    cases = json.loads(CASES_PATH.read_text(encoding="utf-8"))["cases"]
    return manifest, cases


def validate() -> int:
    manifest, cases = load()
    problems: List[str] = []
    seen = set()
    valid_sev = {"critical", "major", "minor"}

    for c in cases:
        cid = c.get("id", "<no id>")
        if cid in seen:
            problems.append("%s: duplicate id" % cid)
        seen.add(cid)
        if c.get("severity") not in valid_sev:
            problems.append("%s: severity must be one of %s" % (cid, sorted(valid_sev)))
        if not c.get("question"):
            problems.append("%s: no question" % cid)
        if not c.get("why"):
            problems.append("%s: no why (every case states why it exists)" % cid)
        has_assertion = any(
            c.get(k) for k in ("contains_all", "contains_none", "regex_any", "expect_refusal")
        )
        if not has_assertion:
            problems.append("%s: no assertion — a case that cannot fail is not a test" % cid)
        for p in c.get("regex_any", []):
            try:
                re.compile(p)
            except re.error as exc:
                problems.append("%s: bad regex %r (%s)" % (cid, p, exc))

    print("cases: %d" % len(cases))
    print("bar:   %s" % manifest["pass_bar"]["rule"])
    if problems:
        for p in problems:
            print("  FAIL %s" % p)
        return 1
    print("validate: OK")
    return 0


# ─── positive control ────────────────────────────────────────────────────────

SELFTEST = [
    # (name, case fragment, response, expected_pass)
    ("contains_all hit",
     {"contains_all": ["4,400"]}, "The 2026 limit is $4,400 for self-only.", True),
    ("contains_all miss",
     {"contains_all": ["4,400"]}, "The 2026 limit is $4,300 for self-only.", False),
    ("contains_none clean",
     {"contains_all": ["4,400"], "contains_none": ["4,300"]},
     "The 2026 limit is $4,400.", True),
    ("contains_none caught (the twice-live regression)",
     {"contains_all": ["4,400"], "contains_none": ["4,300"]},
     "For 2026 it is $4,400, up from $4,300 in 2025.", False),
    ("regex_any hit",
     {"regex_any": [r"100%\s*(match\s*)?on\s*(the\s*)?first\s*3%"]},
     "We offer a 100% match on the first 3% of pay.", True),
    ("regex_any miss",
     {"regex_any": [r"100%\s*(match\s*)?on\s*(the\s*)?first\s*3%"]},
     "There is a generous employer match.", False),
    ("refusal accepted",
     {"expect_refusal": True, "refusal_must_reference_any": ["HR", "cannot"]},
     "I don't have premium information — please check with HR.", True),
    ("refusal missing reference",
     {"expect_refusal": True, "refusal_must_reference_any": ["HR", "cannot"]},
     "That information is not something I know about.", False),
    ("refusal that leaks a number is NOT a refusal",
     {"expect_refusal": True, "refusal_must_reference_any": ["HR"]},
     "I'm not certain, but it's roughly $450 a month. Ask HR to confirm.", False),
]


def selftest() -> int:
    print("POSITIVE CONTROL — proving each assertion type can PASS and FAIL.")
    print("A checker that cannot fail is worthless; its clean results mean nothing.\n")
    bad = 0
    for name, frag, response, expected in SELFTEST:
        passed, fails = check(frag, response)
        ok = (passed == expected)
        if not ok:
            bad += 1
        print("  %s  %-46s expected=%-5s got=%-5s %s" % (
            "ok  " if ok else "BROKEN",
            name,
            "PASS" if expected else "FAIL",
            "PASS" if passed else "FAIL",
            ("" if ok else "  <-- ENGINE DEFECT"),
        ))
    print()
    if bad:
        print("SELFTEST FAILED (%d). Do not trust any live result until this is green." % bad)
        return 1
    print("selftest: OK — %d/%d. The engine detects true positives and true negatives." % (
        len(SELFTEST), len(SELFTEST)))
    return 0


# ─── live run ────────────────────────────────────────────────────────────────

def ask_worker(url: str, token: str, bot: str, question: str,
               tenant: Optional[str], timeout: int = 90) -> str:
    payload: Dict[str, Any] = {
        "botId": bot,
        "messages": [{"role": "user", "content": question}],
        "maxTokens": 700,
    }
    # Forward-compatible: the worker ignores this today, and honouring it is
    # exactly what the tenant-context build adds. The T-* cases witness that.
    if tenant:
        payload["tenantId"] = tenant

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer %s" % token,
            # Cloudflare's Browser Integrity Check rejects the default
            # "Python-urllib/3.x" signature with error 1010 (403) before the
            # request ever reaches the worker. Any named client is accepted, so
            # we identify ourselves honestly rather than impersonating a browser.
            "User-Agent": "BeneBotsTestPack/0.1 (+internal QA harness)",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    # Sonnet 5 can lead with a thinking block — select by type, never by index.
    blocks = body.get("content", []) or []
    text = next((b.get("text", "") for b in blocks if b.get("type") == "text"), "")
    if not text:
        raise PackError("no text block in response (blocks: %s)" % [b.get("type") for b in blocks])
    return text


def run(url: str, token: str, only: Optional[List[str]]) -> int:
    if selftest() != 0:
        return 1
    print("-" * 72)

    manifest, cases = load()
    if only:
        cases = [c for c in cases if c["id"] in set(only)]
        if not cases:
            raise PackError("no cases matched %s" % only)

    stamp = dt.datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    out_dir = RESULTS_DIR / stamp
    out_dir.mkdir(parents=True, exist_ok=True)

    rows: List[Dict[str, Any]] = []
    for c in cases:
        cid = c["id"]
        try:
            answer = ask_worker(url, token, c.get("bot", "ask"), c["question"], c.get("tenant"))
            err = None
        except (urllib.error.URLError, urllib.error.HTTPError, PackError, OSError) as exc:
            answer, err = "", str(exc)

        if err:
            passed, fails = False, ["transport error: %s" % err]
        else:
            passed, fails = check(c, answer)

        known = bool(c.get("known_defect"))
        rows.append({
            "id": cid, "class": c["class"], "severity": c["severity"],
            "tenant": c.get("tenant"), "known_defect": known,
            "passed": passed, "failures": fails,
            "question": c["question"], "response": answer,
        })

        if passed:
            tag = "PASS"
        elif known:
            tag = "FAIL (known defect — expected)"
        else:
            tag = "FAIL"
        print("%-6s %-34s %s" % (cid, tag, "; ".join(fails)[:80]))
        # Full transcript preserved per case — a summary is not evidence.
        (out_dir / ("%s.json" % cid)).write_text(
            json.dumps(rows[-1], indent=2), encoding="utf-8")

    scored = [r for r in rows if not r["known_defect"]]
    crit = [r for r in scored if not r["passed"] and r["severity"] == "critical"]
    witnesses = [r for r in rows if r["known_defect"]]

    summary = {
        "run": stamp,
        "pass_bar": manifest["pass_bar"]["rule"],
        "scored_total": len(scored),
        "scored_passed": sum(1 for r in scored if r["passed"]),
        "critical_failures": len(crit),
        "known_defect_witnesses": {
            "total": len(witnesses),
            "still_failing": sum(1 for r in witnesses if not r["passed"]),
            "now_passing": [r["id"] for r in witnesses if r["passed"]],
        },
        "verdict": "PASS" if not crit else "FAIL",
        "prompt_note": "Deterministic assertions only. No LLM judge was involved.",
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print("-" * 72)
    print("scored %d/%d, critical failures %d -> %s" % (
        summary["scored_passed"], summary["scored_total"],
        summary["critical_failures"], summary["verdict"]))
    if summary["known_defect_witnesses"]["now_passing"]:
        print("NOTE: known-defect witnesses now PASSING: %s — the tenant build may have landed. "
              "Promote them into the scored bar." % summary["known_defect_witnesses"]["now_passing"])
    print("results: %s" % out_dir)
    return 0 if not crit else 1


def main() -> int:
    ap = argparse.ArgumentParser(description="BeneBots answer fidelity pack")
    ap.add_argument("command", choices=["validate", "selftest", "run"])
    ap.add_argument("--url", default=os.environ.get("BENEBOTS_WORKER_URL", ""))
    ap.add_argument("--token", default=os.environ.get("BENEBOTS_WORKER_TOKEN", ""))
    ap.add_argument("--case", action="append", dest="cases")
    args = ap.parse_args()

    try:
        if args.command == "validate":
            return validate()
        if args.command == "selftest":
            return selftest()
        if not args.url or not args.token:
            print("run needs --url and --token (or BENEBOTS_WORKER_URL / "
                  "BENEBOTS_WORKER_TOKEN in the environment).", file=sys.stderr)
            print("Do not paste the token on the command line — export it first.", file=sys.stderr)
            return 2
        return run(args.url, args.token, args.cases)
    except (PackError, OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
