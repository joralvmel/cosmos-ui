---
name: release
description: 'Runs the version and publish flow with Changesets, provenance and the pre-release checklist.'
---

# release

Main agent: `release-manager`. Read `AGENTS.md` first.

## Inputs

- Release scope

## Steps

1. Confirm the pre-release checklist: blocked terms clean, notices and licenses complete, SBOM reviewed, identity check green, CI green.
2. Merge the "Version Packages" pull request created by `release.yml` (`npm run version-packages`).
3. Publishing runs `npm run release` with npm trusted publishing and provenance once `COSMOS_PUBLISH_ENABLED` is set.

## Files

- `.changeset/**`
- package versions (generated)

## Checklist

- [ ] Checklist complete
- [ ] Tags and changelogs generated

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
