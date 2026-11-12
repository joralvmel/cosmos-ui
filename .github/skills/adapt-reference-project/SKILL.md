---
name: adapt-reference-project
description: 'Use when taking inspiration from an existing project, porting a component library, adapting a theme or planning migration to Cosmos from React, React Native or another UI stack. Analyzes sources read-only, maps reusable intent to Cosmos and waits for approval before implementation.'
---

# adapt-reference-project

Main conversation coordinates `researcher`, `design-system` and the relevant platform specialist.
Read `AGENTS.md`, the [reference-project convention](../../../docs/conventions/reference-projects.md)
and the [component workflow](../../../docs/conventions/component-workflow.md).

## Inputs

- Source folders/files or public repository links and permission to inspect them
- Theme, components or user need to evaluate; target platforms
- Analysis only (default) or implementation after scope approval
- Reuse/license constraints and desired fidelity

## Steps

1. Establish read-only source boundaries and rights. Inspect only relevant manifests, token/theme
   definitions, representative primitives and usages. Verify the actual stack. Do not run source
   scripts, read secrets or write to the source projects. Keep private code out of web research.
2. Compare with current Cosmos token APIs, inventory and contracts. Research applicable standards
   and public alternatives with `research-reference`; do not blindly translate source props.
3. Return the convention's **theme map, component map and migration plan** in the conversation.
   Separate reusable UI from app logic, supported mappings from gaps, and native implementations
   from web wrappers. Report licensing, accessibility and compatibility limits. Do not persist
   source identities, private paths, source text or branded assets in Cosmos.
4. Recommend a small first slice and ask informed scope/design questions after the findings.
   **STOP for explicit user approval before generation or edits.** Analysis-only ends here without
   changing files or committing; an attached project does not approve every component in it.
5. After approval, save sanitized decisions and use `add-theme`/`add-token`, `create-component` or
   `modify-component` as applicable. Preserve their generator, contract and platform requirements.
   Unsupported token roles or dependencies require approval, not a new package by default.
6. Validate the accepted slice with the component workflow's evidence matrix; disclose visual
   deviations and unavailable checks. Do not modify or test-run the consumer without separate
   authorization. Use `finish-work` for a verified local commit and pause without push or PR.

## Files

- No files for analysis only
- Sanitized `docs/design/<name>.md` and the files required by the approved implementation skill
- `THIRD_PARTY_NOTICES.md` only for authorized reuse requiring attribution

## Checklist

- [ ] Sources read-only; rights and actual frameworks checked
- [ ] Theme map, component map and prioritized migration plan delivered
- [ ] App-specific logic, unsupported mappings and platform differences separated
- [ ] Research-led scope approved before implementation
- [ ] No source identity, private data or unauthorized copied material in tracked files
- [ ] Implementation validated and committed locally; no unapproved push or PR

## Done

For analysis, deliver findings and decisions without edits. For approved implementation, follow the
selected skill and report evidence, limitations and the local review SHA.
