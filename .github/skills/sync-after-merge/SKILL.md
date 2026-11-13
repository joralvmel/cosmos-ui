---
name: sync-after-merge
description: 'After a pull request is merged: returns to develop, pulls with prune and deletes the local work branch.'
---

# sync-after-merge

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- Work branch (default: current branch)

## Steps

1. Check the pull request is merged: `gh pr view <branch> --json state --jq .state` must be `MERGED`; stop otherwise.
2. Verify identity and remote; preserve local changes and fetch. For a work PR, switch to develop
   and fast-forward only. Delete only the confirmed merged work branch, never main or develop;
   check for local-only commits before using `-D` after a squash merge.
3. After publication, check `git merge-base --is-ancestor origin/main origin/develop`.
   If false, open/reuse a synchronization PR main → develop and require **Create a merge commit**,
   not squash or rebase. File equality does not prove ancestry. Never delete main after the merge.
4. If synchronization conflicts, follow the repair procedure in `release-pr`: prepare a dedicated
   work branch from develop, merge main, resolve only evidence-backed conflicts, regenerate the
   lockfile through npm, validate, commit locally and pause for review. After acceptance, its PR
   into develop must also use a merge commit. Ask only for unresolved semantic decisions.
5. If branch protection blocks a synchronization merge commit, report that prerequisite and obtain
   approval to apply the `setup-repo` policy. Do not squash as a workaround or bypass required checks.
6. After approved synchronization merges, fetch and verify main is an ancestor of develop.
   Report remaining PRs/checks and the next approval; optionally close a linked resolved issue.

## Files

- Local branches

## Checklist

- [ ] develop up to date
- [ ] Work branch removed locally and remotely
- [ ] After publication, main is an ancestor of develop or a reviewed synchronization is pending

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
