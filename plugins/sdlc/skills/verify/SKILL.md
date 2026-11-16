---
name: verify
description: Check an implemented feature against its agreed observable behavior when verification is requested.
argument-hint: "[implemented-scope]"
allowed-tools: Read, Glob, Grep
disallowed-tools: Edit, Write, NotebookEdit
---

# Verify

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Identify expected behavior from the confirmed feature specification.
2. Choose checks suited to the actual change; prefer user-visible behavior over internal implementation details.
3. Run only authorized checks in the intended environment.
4. Report what actually ran, passed, failed or remains unverified. Distinguish local observations from remote checks.
5. Preserve failing evidence and explain the next bounded action.

A draft classification or design never triggers tests. Do not invent metrics, claim unrun checks passed or create redundant evidence reports.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
