---
name: frontend-ui-design
description: Design or review user interfaces, interaction states, accessibility, localization and responsive composition for any application; use when UI detail or UX validation is requested.
argument-hint: "[screen-or-flow]"
---

# Frontend UI Design

**Invocation scope:** $ARGUMENTS. If absent, use only the explicitly requested task; ask when a material boundary is unclear.

1. Identify the end user's task, current screen context and vocabulary from this product.
2. Describe navigation, forms, feedback, focus behavior and meaningful empty/loading/success/error/disabled/conflict states.
3. Check keyboard access, readable contrast, long labels, required locales and responsive layouts based on the project's actual audiences.
4. Reuse established design tokens and components where available. Treat global theme, library or layout changes as explicit decisions when they affect scope.
5. Define the smallest cohesive component/interaction contract, including acceptance examples and unresolved choices.

References and prototypes are design evidence, not automatic authority over product semantics or API contracts. Do not assume a particular framework, locale or repository layout.

**Handoff:** When a useful next step exists, suggest at most one matching skill with its concrete scope; in a host supporting namespaced plugin slash commands, show the exact command. Never auto-run the next skill or infer permission to merge, deploy or change persistent data.
