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
2. `git switch develop` and `git pull --prune --ff-only`.
3. Delete the local branch: `git branch -D <branch>` (squash merges are not ancestors, so `-d` would refuse).
4. Optionally close the linked issue if it was not closed automatically.

## Files

- Local branches

## Checklist

- [ ] develop up to date
- [ ] Work branch removed locally and remotely

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
