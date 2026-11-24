---
name: handoff
description: Compact the current session into a short handoff document so a fresh agent session can continue the work; use only when the owner asks for a handoff.
argument-hint: "[what the next session will focus on]"
disable-model-invocation: true
---

# Handoff

**Invocation scope:** $ARGUMENTS. Treat it as what the next session will focus on and tailor the document to it. If absent, cover the work in progress.

Write a handoff document that lets a fresh agent continue without rereading this conversation. Save it to the OS temporary directory (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows), not inside the repository, and give the owner its path.

## Contents

1. **Goal:** the outcome being worked toward, in one or two lines.
2. **State:** what is done, what is in progress and what has not started. Separate what actually ran and passed from what is unverified.
3. **Decisions:** what the owner confirmed and what is still open. Never present a proposal as approved.
4. **Pointers:** specs, issues, PRs, branches, commits and files by path or URL. Reference them; do not copy their content.
5. **Traps:** dead ends already tried, gotchas and constraints from `AGENTS.md` that the next session must respect.
6. **Next step:** exactly one `/sdlc:<skill> <scope>` command for the next session to run first.

Keep it short enough to read in a minute. Redact secrets, credentials and personal data.

Writing a handoff does not commit, push or change project files.

<!-- Adapted from mattpocock/skills `handoff` (MIT, see LICENSE.mattpocock). -->
