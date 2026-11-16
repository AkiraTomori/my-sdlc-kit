---
name: design
description: Design a selected feature or technical change across user flows, module interfaces, data semantics and failure behavior; use when a project needs a design decision before implementation.
argument-hint: "[feature-or-change]"
---

# Design

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Start with the intended user or system outcome and confirmed scope; discover missing decisions that change behavior.
2. Describe meaningful states (initial, loading, empty, success, validation failure, stale/conflict, denied access or recovery) where relevant.
3. Identify data concepts, ownership, invariants, concurrent operations and boundaries without assuming a physical schema too early.
4. Locate cohesive module interfaces and dependencies by responsibility. Prefer small, stable interfaces and avoid speculative pass-through layers.
5. Evaluate alternatives only where trade-offs matter. State recommended choices, assumptions and decisions still owned by the user.
6. Fit the design to the repository's actual architecture, coding conventions and deployment constraints; do not import another project's stack or paths.

Design outcomes can inform a ticket or implementation, but do not silently authorize code changes, migrations or external writes.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
