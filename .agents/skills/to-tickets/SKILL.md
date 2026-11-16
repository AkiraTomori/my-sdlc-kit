---
name: to-tickets
description: Break a confirmed feature spec into small, demoable end-to-end tickets with clear blocking dependencies; use only when implementation planning is requested.
disable-model-invocation: true
argument-hint: "[approved-spec]"
---

# To Tickets

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Read the confirmed feature outcome, scope and relevant design.
2. Split work into narrow vertical slices that each deliver a meaningful user behavior, rather than separate frontend/backend/test phases.
3. For each proposed ticket, give its title, user-visible result, prerequisites/blockers and completion criteria.
4. Ask the owner whether the granularity and dependencies are right. Adjust before publication.
5. Publish only to the tracker the owner has chosen, after they agree to the breakdown.

Use domain language; omit brittle implementation file paths. A feature inventory, draft spec or classification alone is not permission to create a backlog or implement it.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
