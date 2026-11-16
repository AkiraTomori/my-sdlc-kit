---
name: spec
description: Clarify and specify a product feature, bug fix or engineering capability from the user's perspective; use for discovery, scope, acceptance behavior and open decisions in any project.
argument-hint: "[feature-or-problem]"
---

# Spec

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Find the current project's source of truth and the requested outcome. Separate observed behavior, confirmed requirements, proposals and unanswered decisions.
2. Ask only questions whose answers materially change purpose, boundaries, permissions or user journeys. Otherwise synthesize available evidence.
3. Describe the user's problem, desired result, included/excluded behavior, observable acceptance examples and relevant constraints.
4. Explain UI journeys, domain responsibility and data/API implications at the level the task requires; avoid imposing a framework, folder layout or provider.
5. Record approved decisions in the project's designated owner document when requested; keep unresolved choices explicit.

Specifying work is not, by itself, authorization to modify code, persistent data or deployment. Do not invent numerical gates or reports unless the project needs them.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
