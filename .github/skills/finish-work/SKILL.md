---
name: finish-work
description: 'Finishes a task: validates, pushes the branch and opens a pull request to develop with the template filled, labels and reviewers; optionally requests a Copilot review.'
---

# finish-work

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- Pull request title (Conventional Commits)
- Issue number (optional)

## Steps

1. Run `npx biome ci . && npx turbo run typecheck test build`, `npm run check-terms` and `npm run status`; for packages changes confirm a changeset exists (`npx changeset status --since=origin/develop`).
2. Run `verify-identity` (account and remote included).
3. `git push -u origin HEAD` (never force-push without confirmation).
4. Fill `.github/pull_request_template.md`: summary, linked issue (`Closes #<n>`), validation run and the checklist.
5. `gh pr create --base develop --title "<type(scope): summary>" --body-file <filled template> --assignee @me --reviewer <code owner>`; add type labels (`--label type:component`…); package labels are added by the labeler workflow.
6. Optional: `gh pr edit <n> --add-reviewer @copilot` to request a Copilot review.
7. Report the pull request URL and the checks to watch (`gh pr checks <n> --watch`).

## Files

- Pull request

## Checklist

- [ ] Validation green
- [ ] Changeset present when needed
- [ ] PR title is a Conventional Commit
- [ ] Template complete

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
