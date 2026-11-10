---
name: commit
description: 'Creates a Conventional Commit on a work branch after verifying identity, running validation and the blocked-terms check.'
---

# commit

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- Change summary

## Steps

1. Make sure you are on a work branch created with `start-work` (never commit directly to `main` or `develop`).
2. Run `verify-identity`.
3. Run `npx biome ci . && npx turbo run typecheck test build` (or the filtered equivalent for the touched packages) and `npm run check-terms`.
4. Stage only the files of the change and write `type(scope): summary` (types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert; scopes are package or area names, comma separated if several).
5. Sign off when the contributor wants DCO: `git commit -s`.
6. Let the hooks run; never use `--no-verify`.

## Files

- Git history

## Checklist

- [ ] On a work branch
- [ ] Hooks passed
- [ ] One logical change per commit

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
