---
name: pr
description: Prepare or update a scoped pull request in any Git repository when the user authorizes the change.
argument-hint: "[reviewable-scope]"
disable-model-invocation: true
---

# PR

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Confirm the current repository, intended target branch, existing work and requested scope. Follow the user's direction and this project's branch/protection rules; never assume `main`, `dev` or a naming convention globally.
2. Preserve unrelated edits and present the change in a narrow reviewable branch.
3. Open or update the PR without merging, rewriting history or modifying protected branches unless explicitly authorized.
4. Describe observable change, dependencies, validation that actually ran, missing checks and material risk.
5. Leave follow-up decisions in the PR or appropriate issue; avoid recurring paperwork unrelated to the project.

Documentation, code, schema, data migrations and deploys have distinct risk profiles. A PR does not by itself authorize a database operation or production deployment.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
