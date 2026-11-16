---
name: tdd
description: Use a focused red-green-refactor loop at a stable behavioral boundary for an authorized implementation slice.
argument-hint: "[approved-behavior]"
---

# TDD

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Identify the agreed externally observable behavior and a useful test boundary.
2. Add one meaningful failing behavior test and confirm it fails for the intended reason.
3. Implement the smallest permitted change that makes it pass.
4. Refactor while preserving the observable result, then run affected checks.
5. Report outcomes and limitations faithfully.

Avoid assertions bound to private implementation details and speculative tests for unchosen features. If the user requests only planning or review, do not write or run implementation tests unless separately authorized.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
