---
name: finish-work
description: 'Validates implementation work, automatically creates a local commit and pauses for user testing. Push and PR creation resume only after approval of the reviewed HEAD.'
---

# finish-work

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- Pull request title (Conventional Commits)
- Issue number (optional)
- Current user feedback or approval of a previously presented commit, when resuming

## Steps

Follow the [component workflow](../../../docs/conventions/component-workflow.md), especially its
local review gate. Scope approval and an initial request to finish/open a PR do not approve unseen
implementation changes.

1. On a work branch, inspect the diff and current HEAD. If resuming after explicit approval of the
   previously reviewed, unchanged HEAD with a clean worktree, use `open-pr` below. Otherwise complete
   implementation/revisions within the accepted scope before proceeding.
2. Run `npx biome ci . && npx turbo run typecheck test build`, `npm run check-terms` and
   `npm run status`. For package changes confirm a changeset (`npx changeset status --since=origin/develop`).
   Collect the relevant runtime evidence matrix; identify failed/unavailable checks and any
   explicitly deferred limitations. Never claim mocks or exports are real-device tests.
3. Run `verify-identity` (account and remote included), then `commit` to automatically create a
   **local Conventional Commit** of the validated task files. Honor an explicit no-commit request.
   Do not make an empty commit if this HEAD already contains the validated change.
4. Report branch, `git rev-parse HEAD`, changes, evidence/limitations and local validation steps
   (including required dependency builds and demo commands or URLs). Do not leave temporary test
   servers running unless the user requested them.
5. **STOP for user validation. Do not push or create a PR.** Wait for explicit approval of this
   exact reviewed HEAD. If the user requests changes, implement them, validate, make a **new commit**
   (no amend by default) and repeat this pause. This also applies to branches with an existing PR.
6. Only after that approval, resume via `open-pr`, which rechecks the HEAD and identity, pushes the
   approved branch and opens or reuses its PR to `develop`. A new commit invalidates previous
   approval. If there is no diff and no approval, keep waiting; do not treat rerunning this skill
   as acceptance.

## Files

- Local Git history; a pull request only after the separate approval

## Checklist

- [ ] Validation green
- [ ] Changeset present when needed
- [ ] Local commit SHA and evidence presented to the user
- [ ] Paused without push/PR; any revision has a new commit and another review pause

## Done

The local review handoff is complete when the validated commit and instructions have been
presented. Await user feedback; remote delivery belongs to `open-pr` only after acceptance.
