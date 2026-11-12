---
name: use-reference
description: 'Use when another project should inform Cosmos: copy its color palette into a named Cosmos theme, imitate one behavior or style while creating or modifying a single Cosmos component, or plan replacing an app''s own components with Cosmos one at a time. Sources stay read-only; never batch-create components from a reference.'
---

# use-reference

Main conversation coordinates `researcher`, `design-system` and the relevant platform specialist.
Read `AGENTS.md`, the [reference convention](../../../docs/conventions/reference-projects.md) and
the [component workflow](../../../docs/conventions/component-workflow.md).

Cosmos owns its components and API. A reference is evidence for one decision at a time, never a
library to port: do not map or create components in batch.

## Inputs

- Reference folders/files or public links, and permission to inspect them
- Mode: **palette** (named theme), **component** (one behavior/style for one Cosmos component) or
  **replacement plan** (an app adopting Cosmos)
- Target theme name, component or app screen; target platforms

## Steps

1. Establish read-only source boundaries and rights. Inspect only the relevant theme definition,
   component and its usages. Verify the actual stack. Do not run source scripts, read secrets or
   write to the source project. Keep private code out of web research.
2. **Palette:** extract the exact light/dark colors and map them to Cosmos semantic roles. Hand off
   to `add-theme`: seeds from the brand colors plus per-mode overrides for the copied values.
   Copy the values directly; when one fails WCAG AA or the color-vision checks, explain why and
   propose the nearest passing value. Typography, spacing and motion are not theme inputs.
3. **Component:** describe the observed behavior, states and style of that one element and the
   requested aspect to imitate. Hand off to `create-component` or `modify-component`: the reference
   feeds their research report, questions and acceptance scenarios, not the Cosmos API.
4. **Replacement plan:** in the consumer conversation, list the app's components with their Cosmos
   equivalent (stable, in progress, planned or absent) and a replacement order with rollback. Only
   read the app; replacing a component is a separate, authorized task in that app, one at a time.
5. Present findings and ask the open decisions.
   **STOP for explicit user approval before generation or edits.** Analysis ends here; an attached
   project approves nothing.
6. After approval, the selected skill implements and validates. Keep source identities, private
   paths, prose and branded assets out of tracked files. Use `finish-work` for a verified local
   commit and pause without push or PR.

## Files

- None for analysis or a replacement plan
- The files required by `add-theme`, `create-component` or `modify-component`
- `THIRD_PARTY_NOTICES.md` only for authorized reuse requiring attribution

## Checklist

- [ ] Sources read-only; rights and actual frameworks checked
- [ ] One deliverable: a theme, one component change or a plan; no batch component creation
- [ ] Copied colors validated; deviations explained with the nearest passing value
- [ ] Research-led scope approved before implementation
- [ ] No source identity, private data or unauthorized copied material in tracked files
- [ ] Implementation validated and committed locally; no unapproved push or PR

## Done

Analysis and plans end with findings and decisions, without edits. Approved work follows the
selected skill and reports evidence, deviations and the local review SHA.
