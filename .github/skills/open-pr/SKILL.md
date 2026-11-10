---
name: open-pr
description: 'Opens a pull request for an existing pushed branch (develop for work branches, main only for release PRs). Prefer finish-work, which validates first.'
---

# open-pr

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- Branch
- Summary

## Steps

1. Run `verify-identity` (including the `gh` account and remote).
2. Choose the base: `develop` for `feat|fix|docs|chore|refactor|test/*` branches; `main` only for `develop` (use `release-pr`).
3. Push if needed (`git push -u origin <branch>`); never force-push without confirmation.
4. `gh pr create --base <base>` with `.github/pull_request_template.md` filled, linked issues and the validation that was run.

## Files

- Pull request

## Checklist

- [ ] Correct base branch
- [ ] Template complete
- [ ] CI started

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
