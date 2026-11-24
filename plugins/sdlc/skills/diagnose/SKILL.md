---
name: diagnose
description: Diagnose a hard bug or performance regression by first building a tight, red-capable feedback loop, then reproducing, hypothesising and instrumenting; use when something is broken, failing, flaky or slow.
argument-hint: "[symptom]"
---

# Diagnose

**Invocation scope:** $ARGUMENTS. If absent, use the symptom the owner just reported; ask for it if none was given.

Diagnosing is not permission to fix. Phases 1–4 may add throwaway scripts and temporary, tagged instrumentation; the fix in Phase 5 needs the owner's go-ahead (or an active `/sdlc:implement` slice that covers it). Follow the project's `AGENTS.md` for branches and data.

**Redact first.** Replace every secret in commands, output and captured artifacts with `<REDACTED>`. Keep credentials in environment variables, not in the loop's command line.

## Phase 1: Build a feedback loop

This is the skill. With a tight pass/fail signal that goes red on *this* bug, the cause will be found; without one, reading code is guessing. Try, roughly in this order: a failing test at the closest seam, an HTTP script against a dev server, a CLI run diffed against a known-good output, a headless browser script, a replayed captured request or event, a minimal harness around the code path, a fuzz loop, a `git bisect run` harness, or a differential run of old against new. If a human must click, script the steps so they report back in a fixed format.

Then tighten it: faster (narrow scope, cache setup), sharper (assert the exact symptom, not "didn't crash"), deterministic (pin time, seed randomness, isolate files and network). For flaky bugs, raise the reproduction rate until it is debuggable.

**Done when** you can name one command, already run, that is: red-capable on the owner's exact symptom, deterministic, fast (seconds) and runnable without a human. If you cannot build one, stop, list what you tried and ask for access, a redacted artifact (log, HAR, trace) or permission for temporary instrumentation. No loop, no Phase 2.

## Phase 2: Reproduce and minimise

Run the loop and confirm it shows the symptom the owner described, not a nearby failure. Then cut inputs, steps, config and data one at a time, re-running after each cut, until every remaining element is needed for the failure.

## Phase 3: Hypothesise

Write 3–5 ranked, falsifiable hypotheses: "If X is the cause, changing Y makes the bug disappear." Show the list to the owner before testing; they may re-rank it instantly. Do not wait if they are away.

## Phase 4: Instrument

Each probe tests one prediction; change one variable at a time. Prefer a debugger, then targeted logs at the boundaries that separate hypotheses. Tag every debug log with one unique prefix (for example `[DEBUG-a4f2]`) so cleanup is a single search. For performance, measure a baseline first and bisect; do not guess from logs.

## Phase 5: Fix with a regression test (authorized only)

If a seam exists where a test can exercise the real bug pattern, turn the minimised repro into a failing test there (use `/sdlc:tdd`), watch it fail, apply the smallest fix, watch it pass, then re-run the original Phase 1 loop. If no such seam exists, report that as a finding instead of writing a shallow test.

## Phase 6: Clean up and report

- The original loop no longer reproduces the bug.
- The regression test passes, or the missing seam is documented.
- Every tagged debug log and throwaway script is removed (search the prefix).
- The report states the confirmed cause, what actually ran, what remains unverified, and the hypothesis that was right, so it can go into the commit or PR message.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope (usually `/sdlc:implement <fix>` before a fix is authorized, or `/sdlc:verify <scope>` after); in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.

<!-- Adapted from mattpocock/skills `diagnosing-bugs` (MIT, see LICENSE.mattpocock). -->
