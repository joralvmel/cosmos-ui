---
name: release-pr
description: 'Recommends the release type (none, snapshot, patch/minor, major) and opens the release pull request develop → main with the summary of pending changesets.'
---

# release-pr

Main agent: `release-manager`. Read `AGENTS.md` first.

## Inputs

- Release name or notes (optional)
- Intent: assessment only, or prepare/open the release PR. A read-only request never authorizes
  implementation. A request to prepare/open authorizes local prerequisite work, not its push,
  merge or publication.

## Choose the release type

Inspect the current remote state, merged work, checks on the exact SHA, pending changesets,
dependency coverage and mergeability. Recommend a type and explain the reasons:

| Situation | Recommend |
| --- | --- |
| No pending changesets, red CI or incomplete merged work | No release yet; list what is missing |
| Merged work needs real-consumer testing before a promise | Snapshot on `next` (`release` skill) |
| Validated fixes or additions | Regular release; changesets decide patch/minor |
| Breaking changes | Follow the repository's versioning policy and include migration notes; confirm any API-stability commitment before proposing `1.0.0`. Never downgrade a bump merely to avoid it |

Release readiness depends on the pending work being complete and validated, not on catalog
completeness or a version milestone.

For assessment only, report the recommendation and prerequisites without changing files or
opening PRs. Verify remote SHAs through GitHub if fetching is outside the requested read-only
scope; do not treat stale local refs as current evidence.

## Steps

1. For prepare/open intent, verify identity, remote and a clean worktree, then
   `git fetch origin --prune`. Reuse an existing release PR. Verify required checks on the current
   `origin/develop` SHA, not merely the last successful run. Preserve unrelated work.
2. Check ancestry with `git merge-base --is-ancestor origin/main origin/develop` and simulate the
   promotion with `git merge-tree --write-tree origin/main origin/develop`. Distinguish conflicts
   from command failures. If published commits are missing from develop, use `sync-after-merge`
   to prepare synchronization before promotion. A conflict is a repair task, not an automatic
   abandonment: create a dedicated work branch from current develop and merge origin/main there.
   Inspect base/ours/theirs file by file, preserve published versions and changelogs as well as
   newer develop behavior and dependencies, and regenerate a conflicted lockfile through npm.
   Never blanket-select ours/theirs, hand-edit the lockfile, or reset/rebase shared branches.
   Resolve only where history and manifests establish the intended result. If a resolution
   requires a product/API/dependency decision, ask about that specific decision. Validate the
   resolution and create a local review commit through `finish-work`; pause before push.
   If linear-history protection prevents the required synchronization merge, request approval
   for the reviewed `setup-repo` policy; never squash synchronization as a workaround.
3. Cover runtime dependency updates merged from Dependabot: on an up-to-date `develop` work branch,
   run `npm run deps:changeset`. It writes a `patch` changeset for packages whose runtime
   dependencies changed since main and lists the ones that need a manual decision (`upgrade-stack`).
   If it writes changes, validate and commit locally through `finish-work`, then pause for review.
   After acceptance, open/reuse the prerequisite PR to develop. Synchronization PRs must use a
   merge commit to preserve main's ancestry; changeset-only work PRs use squash.
4. If a prerequisite PR needs review/merge, report its URL, required method and the exact approval
   needed next. Do not silently stop or open a knowingly conflicted release PR. After its merge,
   fetch and repeat ancestry, dependency and exact-SHA checks before continuing in the same task.
   Do not merge prerequisites automatically.
5. List pending changesets: `npx changeset status --since=origin/main --verbose`; if there are none,
   report no package release needed. Do not manufacture bumps or change versions manually.
6. Write the body: packages and bumps from the status output, highlights from each `.changeset/*.md`,
   breaking changes first, and evidence/limitations.
7. With the user's authorization to open, create/reuse
   `gh pr create --base main --head develop --title "chore(release): <name or date>" --label release --body-file <body>`.
   Report its URL and checks, then wait. Opening a PR does not authorize its merge or publication.
8. Only after explicit merge approval, use **Create a merge commit** (not squash);
   `release.yml` then opens or updates "Version Packages". Review/merge of that PR is a separate
   publication approval under `release`.

## Files

- Pull request develop → main

## Checklist

- [ ] Release type chosen and justified
- [ ] Published history synchronized without squash; promotion is conflict-free
- [ ] Runtime dependency updates covered (`npm run deps:changeset`)
- [ ] Pending changesets listed
- [ ] Breaking changes highlighted
- [ ] Release PR opened/reused and checks reported; merge/publication approval still explicit

## Done

The authorized stage is complete: either a justified assessment, a validated local prerequisite
commit awaiting review, a prerequisite PR awaiting merge, or a release PR with reported checks.
State the exact next approval at every pause; do not claim publication.
