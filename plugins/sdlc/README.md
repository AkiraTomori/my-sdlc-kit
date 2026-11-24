# SDLC — reusable delivery workflow plugin (Claude Code)

A project-agnostic plugin of scoped skills, four optional agents and a shell guard. It intentionally contains no product logic, stack, branch or deadline. Read the active repository's `AGENTS.md` first.

## Commands

| Command | Purpose |
| --- | --- |
| /sdlc:grill <idea> | Optional interview until every decision is settled (manual) |
| /sdlc:spec <scope> | Confirm observable outcome and acceptance examples |
| /sdlc:design <scope> | Design interfaces, semantics and failure behavior |
| /sdlc:implement <approved-slice> | Deliver one authorized change |
| /sdlc:verify <scope> | Run appropriate checks and report evidence |
| /sdlc:review <change> | Review a diff or planning change |
| /sdlc:pr <scope> | Prepare a bounded reviewable PR |
| /sdlc:database <scope> | Optional data design and integrity |
| /sdlc:frontend-ui-design <scope> | Optional user interface design |
| /sdlc:to-tickets <scope> | Optional ticket decomposition |
| /sdlc:tdd <scope> | Optional Red–Green–Refactor loop |
| /sdlc:sign-off <decision> | Optional human decision support |
| /sdlc:diagnose <symptom> | Optional loop-first bug diagnosis |
| /sdlc:handoff <next-focus> | Optional session handoff document (manual) |

Use any relevant skill directly. No mandatory orchestrator or automatic progression. Planning does not authorize implementation; PR creation does not authorize merge.

## Package structure

- `.claude-plugin/plugin.json`: Claude Code metadata.
- `skills/<name>/SKILL.md`: fourteen portable skills (`implement`, `pr`, `sign-off`, `to-tickets`, `grill`, `handoff` are manual-only).
- `agents/*.md`: four optional agents — `repo_explorer` (read-only), `implementation_worker` (scoped writes), `test_engineer` (approved tests), `code_reviewer` (read-only). Manual choices, never automatic routes.
- `hooks/hooks.json` + `hooks/guard-actions.mjs`: a `PreToolUse` guard for Bash, active whenever the plugin is enabled. Needs Node.js. It is a best-effort backstop, not a security boundary.

Installation is required before the namespaced slash commands exist. See the repository root README for the submodule setup.

## Workflow discipline

- Read actual project context and approvals, not another product's stack.
- Choose one bounded result, then the relevant skills.
- Verify the real state and label checks passed / failed / skipped / not run.
- Propose at most one next exact command and never auto-execute it.
- Keep branch strategy and business rules in the host project, not in this package.
