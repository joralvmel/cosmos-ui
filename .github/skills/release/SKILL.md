---
name: release
description: 'Runs the release flow: release PR develop → main, the Changesets "Version Packages" PR, npm publish with provenance and GitHub Releases; also snapshot prereleases with the next dist-tag.'
---

# release

Main agent: `release-manager`. Read `AGENTS.md` first.

## Inputs

- Release scope (stable or snapshot)

## Steps

1. Confirm the one-time setup is done (`publish-setup`): trusted publishers on npm, environment `npm`, `COSMOS_PUBLISH_ENABLED=true`.
2. Confirm CI is green on develop and `npm run check-packs` passes locally.
3. Stable: run `release-pr` and merge the release PR with a merge commit. The `Release` workflow opens "Version Packages" on main; review versions and changelogs, approve and merge it. The workflow then publishes to npm with provenance, pushes tags and creates GitHub Releases.
4. Snapshot: `gh workflow run release.yml --ref develop -f snapshot=true`; it publishes `x.y.z-next-<datetime>` with the dist-tag `next` and no Git tags.
5. Verify: `npm view @joralvmel/cosmos-<pkg> versions dist-tags`, the GitHub Releases page and the docs deployment on main.
6. After the release, merge main back into develop if Version Packages changed files there (`gh pr create --base develop --head main`).

## Files

- `.changeset/**`
- Package versions and CHANGELOG.md (generated)
- `.github/workflows/release.yml`

## Checklist

- [ ] Version Packages reviewed
- [ ] Published with provenance
- [ ] GitHub Releases created
- [ ] develop synced with main

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
