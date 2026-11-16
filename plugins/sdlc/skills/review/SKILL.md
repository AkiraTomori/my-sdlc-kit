---
name: review
description: Review an actual product or code change against the agreed intent, relevant constraints and available evidence.
argument-hint: "[change-or-PR]"
allowed-tools: Read, Glob, Grep
disallowed-tools: Edit, Write, NotebookEdit
context: fork
agent: Explore
background: false
---

# Review

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Read the active repository's AGENTS.md and local instructions explicitly (Explore forks do not preload them). Fix the reviewed scope and compare the actual change with the agreed user result.
2. Inspect the actual diff or changed paths against the requested base. Ask the parent for a diff if read-only tools cannot access it. Look for incorrect behavior, missing states, unintended data effects, security/privacy risks and unnecessary complexity.
3. Check only the evidence that actually exists; state missing verification honestly.
4. Rank concrete findings by impact and show the smallest correction.
5. Return a concise decision-ready review with unresolved risks.

For a planning-only change, review clarity, duplication and feature classification; do not demand runtime metrics or application tests.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
