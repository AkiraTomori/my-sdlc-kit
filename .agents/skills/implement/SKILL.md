---
name: implement
description: Implement a selected, authorized feature slice, bug fix or enabling engineering task in any repository; use only when the user asks for code changes or explicitly starts implementation.
argument-hint: "[approved-slice]"
disable-model-invocation: true
---

# Implement

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. **Establish scope.** Find the current project's `AGENTS.md`, active spec/ticket, agreed outcome and acceptance examples. Confirm implementation was requested; ask only if a missing decision materially changes the result.
2. **Check readiness.** Inspect the actual source, scripts, tests, dependencies and interfaces. Distinguish a usable design/contract from a working app. If runtime foundations are missing, propose or implement the smallest explicitly authorized runnable slice rather than claiming the entire product is ready.
3. **Deliver vertically.** Follow the chosen stack and module boundaries in this repository. Implement the user-visible behavior through only the layers it needs, preserving ownership, validation, errors, concurrency, existing data and backward compatibility.
4. **Build feedback into the slice.** Use Red → Green → Refactor where a meaningful behavioral seam exists. Run focused checks while developing and appropriately broader checks before presenting a result.
5. **Inspect the real diff.** Explain delivered behavior, test results, outstanding risks and next dependency. Keep unrelated changes untouched. Ask before migrations against existing data, new external resources, production writes, destructive actions, broad refactors or merges.

A feature inventory, design prototype, draft SQL schema or unsigned API contract alone does not prove implementation readiness. This skill never grants permission to merge or deploy, and it contains no project-specific phase, branch or technology rule.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
