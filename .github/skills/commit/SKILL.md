---
name: commit
description: 'Creates a local Conventional Commit after identity and validation checks, then pauses for user review without pushing. Revisions use new commits, not amendments.'
---

# commit

Main agent: `github-ops`. Read `AGENTS.md` first.
Follow the [component workflow](../../../docs/conventions/component-workflow.md) local review gate.

## Inputs

- Change summary

## Steps

1. Make sure you are on a work branch created with `start-work` (never commit directly to `main` or `develop`).
2. Run `verify-identity`.
3. Run `npx biome ci . && npx turbo run typecheck test build` (or the filtered equivalent for the touched packages) and `npm run check-terms`.
4. Stage only the files of the change and write `type(scope): summary` (types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert; scopes are package or area names, comma separated if several).
5. Sign off when the contributor wants DCO: `git commit -s`.
6. Let the hooks run; never use `--no-verify`.
7. Report the new SHA and validation instructions, then stop. Do not push or create/update a PR
   before the user accepts this HEAD. A requested revision creates a new commit and another review
   pause; never amend, squash or rewrite earlier commits without explicit permission.
8. If no task diff exists, report the existing reviewed HEAD; do not manufacture an empty commit
   or treat it as approved. Read-only requests do not authorize a commit.

## Files

- Git history

## Checklist

- [ ] On a work branch
- [ ] Hooks passed
- [ ] One logical change per commit

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
