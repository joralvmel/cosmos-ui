---
name: add-changeset
description: 'Writes a Changesets release note for every publishable package changed in the branch.'
---

# add-changeset

Main agent: `release-manager`. Read `AGENTS.md` first.

## Inputs

- Branch or change description

## Steps

1. Find changed publishable packages: `git diff --name-only origin/develop... -- packages/` and `npx changeset status --since=origin/develop`.
2. Choose bumps: `patch` (fixes/internal), `minor` (new component/prop/event/token/theme), `major` (removed/renamed API, with migration).
3. Create `.changeset/<slug>.md` listing the packages and a one-sentence summary for consumers.

## Files

- `.changeset/<slug>.md`

## Checklist

- [ ] Only `packages/*` listed
- [ ] Summary in imperative mood

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
