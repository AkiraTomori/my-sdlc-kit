---
name: grill
description: Interview the owner relentlessly about a plan, feature or design until every decision it depends on is settled; use only when the owner asks to be grilled or to stress-test an idea before a spec.
argument-hint: "[plan-or-idea]"
disable-model-invocation: true
---

# Grill

**Invocation scope:** $ARGUMENTS. If absent, grill the plan or idea currently under discussion; ask what it is if nothing is.

Interview the owner until you both share one understanding of the plan. Map it as a **decision tree**: every decision branches into the decisions that depend on it.

## How to run a round

1. Read the project's `AGENTS.md`, the active spec and any decisions already recorded, so settled questions are not asked again.
2. The **frontier** is every open decision whose prerequisites are already settled: questions you can ask now without guessing answers you have not heard yet. Ask the whole frontier in one round, then wait.
3. Number each question and give your recommended answer. Word each question so that "yes" accepts the recommendation:

   ```
   ❓ **Q1 - <short title>**: <question, with options when they help>

   ➡️ <recommended answer and the one-line reason>
   ```

4. After the owner answers, recompute the frontier. A question that depends on another question still open in this round belongs to a later round.

## Facts versus decisions

Finding **facts** is your job, never the owner's. When a question needs a fact from the repository or tools, look it up (delegate to `repo_explorer` when the search is broad) instead of asking. Only the questions downstream of a running lookup wait for it; ask the rest of the frontier now.

**Decisions** belong to the owner. Put each one to them; never mark a decision as settled on their behalf.

## Finishing

The session ends when the frontier is empty: every branch visited, nothing silently assumed. Then:

1. Summarise the settled decisions, the assumptions the owner accepted and anything explicitly left out of scope.
2. Ask the owner to confirm the summary. Do not write code, specs or tickets before they confirm.
3. When confirmed, record the decisions where the project keeps them (the active spec's decision section, an issue or PR) only if the owner asks; otherwise leave the summary in the conversation.

There is no question limit; the owner can stop at any time and accept the current state. Ask as plain text unless the project's `AGENTS.md` says to use the host's question tool.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope (usually `/sdlc:spec <scope>`); in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.

<!-- Adapted from mattpocock/skills `grilling` (MIT, see LICENSE.mattpocock). -->
