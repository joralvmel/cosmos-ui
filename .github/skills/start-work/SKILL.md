---
name: start-work
description: 'Starts a task: syncs develop, creates a work branch with a normalized name and optionally links it to an issue.'
---

# start-work

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- Type (feat, fix, docs, chore, refactor, test) and short description
- Issue number (optional)

## Steps

1. Run `verify-identity`; make sure the working tree is clean (`git status --porcelain` is empty) or ask how to proceed.
2. `git fetch origin --prune`, `git switch develop`, `git pull --ff-only`.
3. Build the branch name `<type>/<scope>-<description>`: lowercase, words separated by `-`, only `[a-z0-9-]`, at most 50 characters; scope is the package or area (`elements`, `docs`, `tokens`…). Example: `feat/elements-switch`.
4. `git switch -c <branch>`.
5. With an issue: `gh issue develop <number> --base develop --name <branch> --checkout` instead (links the branch to the issue), and assign it with `gh issue edit <number> --add-assignee @me`.
6. For component work, run `component-status` first to confirm the component and its dependencies.

## Files

- Local branch

## Checklist

- [ ] develop up to date
- [ ] Branch name normalized
- [ ] Issue linked (if any)

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
