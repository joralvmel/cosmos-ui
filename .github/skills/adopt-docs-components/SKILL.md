---
name: adopt-docs-components
description: 'Adopts available stable Cosmos components in the docs site itself. Use when asked to replace native or custom documentation controls with library components, refresh the docs after adding components, or review internal component reuse.'
---

# adopt-docs-components

Main agent: `docs-writer`. Read `AGENTS.md` and `apps/docs/AGENTS.md` first.
Follow the [component workflow](../../../docs/conventions/component-workflow.md), including scope
approval and the local review gate.

## Inputs

- Optional component names; otherwise inspect all available stable components.
- Optional docs areas to include or exclude.

## Scope

This is a separately requested docs adoption task, not an automatic step of component creation.
Adding this skill or mentioning it in another task does not authorize running the migration.
Keep adoption in its own work branch and pull request. Do not mix it with pending component work.

Only replace UI owned by `apps/docs`: shared Playground controls, docs components and page
interactions. Do not edit Starlight or other dependencies, generated files, component contracts or
library implementations. Native-demo adoption requires a separate explicit scope.
Preserve snippets and examples whose purpose is to teach a specific API or native HTML behavior.

## Steps

1. Inspect Git state and use `start-work` for an isolated docs branch from current `develop`.
   If unrelated work or an unapproved local review commit is present, stop for guidance instead
   of carrying it into this migration.
2. Run `npm run status` and inspect the inventory, relevant contracts and real implementations.
   Consider only stable components whose existing capabilities cover the use case. Inventory
   completeness is not runtime evidence; check the component's documented limitations.
3. Inventory the docs-owned native/custom controls and propose a mapping table: location,
   existing control, Cosmos replacement, state/event/form mapping, gaps and verification.
   Keep accessible native controls when no stable equivalent covers the requirement. For example,
   a numeric control must not become a Text Field merely because both accept text.
4. Present included, excluded and deferred replacements, then **STOP for explicit scope approval
   before replacing controls**. Do not create missing components, extend APIs, add dependencies or
   migrate every visually similar element without approval. Report component gaps separately.
5. After approval, implement the mapping in shared docs helpers first, not per-page copies.
   Use public component imports, contract props and typed events. Follow state ownership from
   ADR 0003; forward `cosm-change` detail rather than assuming a native `input` event.
   Preserve accessible names, help/error associations, focus, keyboard, disabled/read-only state,
   form behavior, validation and value synchronization. A field controlling its own example must
   use independent control/preview state; do not recursively mount a Playground to create an input.
6. Preserve theme/mode propagation, tokens, responsive layouts, lazy icon loading, generated
   snippets, raw-code copying and the shared Playground frame. Keep API examples accurate and
   update English and Spanish explanatory text where the interaction changes.
7. Add focused docs regressions for the changed interactions. Build dependencies through
   Turborepo before dependent checks because packages consume `dist/`. Run
   `npx turbo run typecheck test build --filter=@joralvmel/cosmos-docs...`.
   In a real browser check actual controls, labels, keyboard, focus, values/events, narrow/wide
   layouts, light/dark and at least two themes; include the component's own Playground when its
   controls were replaced. Inspect console diagnostics and report unavailable checks honestly.
8. Report adopted controls, retained native controls with reasons, deferred gaps and runtime
   evidence. If nothing qualifies, explain the no-op without an empty commit. Otherwise use
   `finish-work` for full validation and a local commit, then **STOP for user validation**.
   Only explicit approval of that unchanged HEAD permits `open-pr` to deliver this separate PR.
   Docs-only changes do not need a publishable-package changeset.

## Checklist

- [ ] Current inventory and replacement mapping reviewed; scope explicitly approved
- [ ] Only docs-owned controls with a stable, compatible equivalent replaced
- [ ] State/events, forms, accessibility, themes and snippet behavior preserved
- [ ] Tests and browser evidence reported; native fallbacks and limitations explained
- [ ] Local review commit presented; no unapproved push or PR
