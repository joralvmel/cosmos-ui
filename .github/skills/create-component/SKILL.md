---
name: create-component
description: 'Creates a new Cosmos component end-to-end following docs/conventions/component-anatomy.md: contract and scenarios, Lit Web Component, React and Angular wrappers, React Native component and demo, tests, docs pages (EN/ES), llms.md and changeset.'
---

# create-component

Main agent: `component-builder`. Read `AGENTS.md` first.

## Inputs

- Component name (kebab-case, without `cosm-`)
- Purpose, props, events, slots, accessibility needs

If an existing application/library is the reference, use `adapt-reference-project` first. Its
read-only maps inform research and scope approval; do not copy source APIs or product identity.

## Steps

1. Run `component-status` for the component: it must be in the catalog and its `dependsOn` must be stable (otherwise build the dependencies first or use native primitives and record a catalog note).
2. Start a branch with `start-work` (`feat/<package>-<name>`). Ask `researcher` for references when the behavior is new (`research-reference`).
3. Follow the [component workflow](../../../docs/conventions/component-workflow.md): get research
   before selecting features, present required/recommended/optional capabilities, then ask informed
   design/API questions in the main conversation. **STOP for explicit user scope/design approval.**
   Do not generate or edit contracts while those choices are still open.
4. Record accepted scope, exclusions, defaults and acceptance scenarios in `docs/design/<name>.md`
   with `design-component`. Run `npm run generate -- component <name>` (`--dry-run` first), then
   finalize the generated contract and shared scenarios with `define-contract` before behavior.
5. Implement the Web Component with core headless helpers, keeping the anatomy order and accepted
   visual spec. Reopen scope approval instead of silently adding features, dependencies or API.
6. Complete the React events map and the Angular inputs/outputs from the contract.
7. Implement the native component and its demo screen (`create-native-component` steps 3-6).
8. Write tests on every platform: shared scenarios, drift tests and platform specifics (`add-contract-tests`).
9. Write the docs pages (EN + ES) in the anatomy order and update `llms.md` (`add-docs-page`, `add-playground`).
10. Edit the generated changeset and remove every `TODO(generator)` marker (`npm run status` keeps the component "in progress" while markers remain).
11. Run the structure test and full checks, then collect the workflow's runtime evidence matrix.
    Test real web/wrapper integration and the native demo, not just mocks or exports. Inventory
    completeness alone is not readiness: keep `in-progress` if required acceptance checks are
    failed/unavailable, unless the user explicitly defers those limitations.
12. Run `finish-work`: create a local commit and **STOP for user validation**. Revisions get new
    commits and a fresh pause. Only after approval of the current HEAD does `open-pr` push/create PR.

## Files

- See docs/conventions/component-anatomy.md (contract, scenarios, Web Component, React, Angular, React Native, demo, tests, docs, llms.md, changeset)
- `packages/core/src/catalog.ts`

## Checklist

- [ ] Dependencies stable (or noted in the catalog)
- [ ] No `TODO(generator)` left
- [ ] Structure test green
- [ ] Drift tests green on 4 platforms
- [ ] Docs EN + ES
- [ ] Changeset
- [ ] Research-led scope/design approved and runtime evidence reported
- [ ] Local commit presented; no unapproved push/PR

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
