---
name: sign-off
description: Prepare a concise human product or engineering decision when alternatives materially affect scope, safety or cost.
disable-model-invocation: true
argument-hint: "[decision]"
---

# Human Decision

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Name the concrete question, alternatives, trade-offs and affected feature.
2. Distinguish what the owner has confirmed from what remains proposed.
3. Ask for a specific decision at the moment it is needed, without creating a gate for routine steps.
4. Record the result in the active feature spec, issue or PR, wherever that decision belongs.

Only the human owner may approve a material choice. This skill never marks a decision approved on their behalf or requires a ledger for every small change.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
