---
name: release-pr
description: 'Opens the release pull request develop → main with the summary of pending changesets.'
---

# release-pr

Main agent: `release-manager`. Read `AGENTS.md` first.

## Inputs

- Release name or notes (optional)

## Steps

1. `git fetch origin --prune`; ensure CI is green on develop (`gh run list --branch develop --limit 5`).
2. List pending changesets: `npx changeset status --since=origin/main --verbose`; stop if there are none.
3. Write the body: packages and bumps from the status output, highlights from each `.changeset/*.md`, breaking changes first.
4. `gh pr create --base main --head develop --title "chore(release): <name or date>" --label release --body-file <body>`.
5. Merge with **Create a merge commit** (not squash) after approval; `release.yml` then opens or updates the "Version Packages" pull request on main.

## Files

- Pull request develop → main

## Checklist

- [ ] Pending changesets listed
- [ ] Breaking changes highlighted
- [ ] Merge commit used

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
