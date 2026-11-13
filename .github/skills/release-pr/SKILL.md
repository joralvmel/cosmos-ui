---
name: release-pr
description: 'Recommends the release type (none, snapshot, patch/minor, major) and opens the release pull request develop → main with the summary of pending changesets.'
---

# release-pr

Main agent: `release-manager`. Read `AGENTS.md` first.

## Inputs

- Release name or notes (optional)

## Choose the release type

Decide from the current state, explain the reasons and wait for approval before step 1:

| Situation | Recommend |
| --- | --- |
| No pending changesets, red CI or incomplete merged work | No release yet; list what is missing |
| Merged work needs real-consumer testing before a promise | Snapshot on `next` (`release` skill) |
| Validated fixes or additions | Regular release; changesets decide patch/minor |
| Breaking changes | Major bump with migration notes. On `0.x` a `major` changeset produces `1.0.0`: confirm the user wants that API commitment, otherwise use `minor` |

Release readiness depends on the pending work being complete and validated, not on catalog
completeness or a version milestone.

## Steps

1. `git fetch origin --prune`; ensure CI is green on develop (`gh run list --branch develop --limit 5`).
2. Cover runtime dependency updates merged from Dependabot: on an up-to-date `develop` work branch,
   run `npm run deps:changeset`. It writes a `patch` changeset for packages whose runtime
   dependencies changed since main and lists the ones that need a manual decision (`upgrade-stack`).
   Commit it through a normal PR into develop before continuing; the release PR's CI fails without it.
3. List pending changesets: `npx changeset status --since=origin/main --verbose`; stop if there are none.
4. Write the body: packages and bumps from the status output, highlights from each `.changeset/*.md`, breaking changes first.
5. `gh pr create --base main --head develop --title "chore(release): <name or date>" --label release --body-file <body>`.
6. Merge with **Create a merge commit** (not squash) after approval; `release.yml` then opens or updates the "Version Packages" pull request on main.

## Files

- Pull request develop → main

## Checklist

- [ ] Release type chosen and justified
- [ ] Runtime dependency updates covered (`npm run deps:changeset`)
- [ ] Pending changesets listed
- [ ] Breaking changes highlighted
- [ ] Merge commit used

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
