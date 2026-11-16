---
name: database
description: Reason about persistent data, relationships, ownership, consistency or a database change for a selected feature; use only when the task touches data semantics or storage.
argument-hint: "[data-scope]"
---

# Database

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

## During product/design work

1. Start with the user behavior and domain terms. Identify entities, relationships, lifecycles and the owner of each fact.
2. State invariants, privacy boundaries, expected concurrent actions and what a failed write must preserve.
3. Explain alternatives at the logical level. Do not decide tables, indexes, migrations or a provider merely because an older project used them.
4. Return the smallest useful data contract and unresolved product choices.

## During authorized implementation

1. Inspect the actual database and callers, then choose the minimal change.
2. Plan compatibility with existing data, constraints, transactions, locking, migration order and recovery before modifying persistent state.
3. Prefer incremental/reversible changes when practical. Never silently drop or rewrite stored data or an already applied migration.
4. Use focused behavior checks and relevant database integration feedback; report what actually ran.

A feature discussion does not authorize DDL, data migration, production access, service provisioning or schema deletion.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
