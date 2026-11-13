---
name: open-pr
description: 'After explicit acceptance of the current local review commit, pushes the branch and opens or updates its PR to develop. Without that approval, returns to local review.'
---

# open-pr

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- Branch
- Summary
- Explicit user acceptance of the reviewed HEAD and its reported validation/limitations

## Steps

Follow the [component workflow](../../../docs/conventions/component-workflow.md). This skill is
the remote delivery phase, not a bypass around `finish-work` or the human review pause.

1. Confirm explicit user approval for the current reviewed HEAD. Compare `git rev-parse HEAD`
   with the SHA presented for review and check `git status --porcelain`. With a different HEAD,
   pending task edits, missing evidence or no recoverable approval, **STOP** and return to
   `finish-work` for validation/commit/review. An initial request to implement and open a PR does not
   approve unseen changes. A direct request to open the already presented, unchanged review commit
   can be that approval; invoking a skill without that context cannot.
2. Run `verify-identity` (including the `gh` account and remote). Use `develop` as base for work
   branches. Promotion from `develop` to `main` uses `release-pr` with explicit release intent;
   never push implementation work directly to either protected branch.
3. Find a PR for this repository/head/base with `gh pr list --head <branch> --base develop --state all`.
   Also check for an unexpected base. Reuse an existing open PR; do not create duplicates. If the
   branch has already been merged/closed or the base is wrong, stop and explain before proceeding.
4. Push the approved branch if needed (`git push -u origin <branch>`); never force-push by default.
   Fetch/push conflicts are not permission to rebase or merge unreviewed changes and push them:
   resolve safely, create a new local review commit and obtain acceptance again.
5. For a new PR, fill `.github/pull_request_template.md`, including scope, linked issue, validation
   evidence and unavailable/deferred checks, then use
   `gh pr create --base develop --title "<type(scope): summary>" --body-file <filled-template>`.
   For an open PR, update its summary/evidence instead. Do not guess reviewers or add yourself as
   a required reviewer. Add appropriate existing labels; request a Copilot review only if asked.
6. Verify the remote HEAD matches the approved local commit. Report the PR URL and actual check
   status (`gh pr checks <number>`); pending checks are not green. Never merge automatically.

## Files

- Pull request

## Checklist

- [ ] Correct base branch
- [ ] Explicit approval matches unchanged HEAD; validation evidence is available
- [ ] Template complete
- [ ] CI started

## Done

The approved commit is present on the expected remote work branch and the correct PR is open or
updated. Report its actual checks and leave merging to the maintainer.
