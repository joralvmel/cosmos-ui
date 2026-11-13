---
name: release
description: 'Coordinates a release from assessment through approved PRs, publication verification, consumer tests and synchronization; also supports snapshots.'
---

# release

The main conversation coordinates this workflow as `release-manager`, using `release-pr`,
`sync-after-merge` and other specialists when useful. Keep approval questions in the main
conversation, not in a background agent. Read `AGENTS.md` first.

## Input and approvals

One request to run the release authorizes assessment and the non-destructive checks below. It does
not itself authorize a merge, publishing, workflow approval, snapshot dispatch, or pushing a
prerequisite repair. Recommend the release type from actual evidence; a regular `0.x` release
does not require readiness for `1.0.0`. If there are no releasable changes, explain and finish.

At each approval gate show the relevant PR URL, exact head and base SHAs, checks, consequences,
and pending evidence. Use the available interactive question/approval tool (such as
`vscode/askQuestions`) to offer approve,
request changes, or stop; if it is unavailable, ask in chat and wait for an explicit response.
Do not treat silence, scope approval, an open PR, or a previous approval as approval for the next
operation. The user may merge in GitHub or explicitly authorize the agent to merge. When they
respond, query GitHub again: verify the actual state, SHAs, required checks and conflicts. A changed
head or base invalidates the approval; explain the changes and request approval again.
If the session cannot remain open, report the exact stage, PR, SHAs and next action so it can be
resumed in the same or another chat. Never claim to be waiting in the background indefinitely.

## Orchestrate the release

1. **Assess and prepare.** Verify identity, remote, current branch and worktree without overwriting
   unrelated work. Use `release-pr` to inspect current remote SHAs, merged changes, changesets,
   dependency coverage, exact-SHA checks and mergeability. Recommend none, snapshot or a regular
   release with package versions, migration notes and evidence. Resolve evidence-backed prerequisite
   conflicts and changesets through `release-pr`; present each local repair commit for approval
   before push and its PR for approval before merge. Resume after an approved repair. Run
   `npm run check-packs` and the relevant validation. Do not invent changesets or edit generated
   versions/changelogs manually.
2. **Promote.** Open or reuse the `develop` → `main` release PR via `release-pr`. Wait for checks
   and show their results. Ask for explicit approval of that exact PR before merging with a
   **merge commit**. Verify the merge and continue; opening it does not authorize merging it.
3. **Review Version Packages.** Find or reuse the Changesets-generated PR on `main`. Compare its
   packages, versions, dependency ranges, changelogs and migration notes with accepted changesets
   and prior releases. Check its exact-head CI and required checks; skipped checks are not passes.
   If a workflow requires manual authorization, explain why and provide the link; request explicit
   approval before authorizing it, or let the user do so. Never run untrusted code merely to clear a
   check. Wait for the result and investigate failures instead of bypassing protection.
   Explain that merging this PR triggers npm publication and may have no further approval gate.
   Ask for separate explicit approval to merge **and publish** this exact PR. Verify current state
      and checks again immediately before merging; if the user merges it, confirm that in GitHub.
4. **Verify publication.** Track the release and docs workflow runs to completion. Check each expected
   exact package version and dist-tag on npm, provenance/attestations, Git tags, GitHub Releases and
   docs deployment. Separate what is published, pending and failed; workflow success alone does not
   prove registry availability. Registry propagation can be delayed: retry a bounded number of times
   and report persistent discrepancies without republishing, moving tags or concealing errors.
   Never retry publication blindly or overwrite an existing version.
5. **Test as a consumer.** Create uniquely named temporary consumers outside the monorepo for the
   relevant affected platforms, installing exact published versions from npm with no workspace links
   or aliases. Check dependency resolution, `npm audit signatures`, builds and available browser
   runtime scenarios; run native devices only when available. Report Expo compatibility and audit
   findings separately from signature verification. Distinguish bundles, mocks, browser, Android and
   iOS runtime and accessibility evidence; do not claim a device test based on an export. Stop only
   servers started for these checks and clean up only the exact temporary paths created. If a tool,
   platform or network is unavailable, report it and the exact next action.
6. **Synchronize.** After publication, use `sync-after-merge` to open or reuse a PR from `main` to
   `develop`, resolving evidence-backed conflicts on a reviewed repair branch if needed. Ask for
   separate approval before merging the sync PR with a **merge commit**, never squash or rebase.
   Verify the merge, fetch and confirm `origin/main` is an ancestor of `origin/develop`. Never delete
   `main` or `develop`. Report final links, published versions, tests, limitations and open work.

For a snapshot, use `release-pr` to assess it and explicitly request approval before dispatching
`release.yml` on `develop` with `snapshot=true`. Explain the `next` dist-tag and that publication
is real; then verify the snapshot and test relevant consumers. Do not move `latest`, create regular
release tags, or run the regular promotion/synchronization steps for a snapshot.

When a required check is pending, wait within the session if tooling permits; use bounded waits.
For action-required, failure, timeout, cancellation or missing permissions, report the exact blocker
and offer the next safe action. After the user acts, recheck and resume the same workflow rather than
requiring a new prompt. Do not bypass checks, protections or approval gates.

## Done

For a regular release, approved PRs are merged, published versions and available consumer checks are
verified, and `main` ancestry is confirmed in `develop`. A snapshot ends with its publication and
available consumer checks verified. Otherwise report the precise pending stage and evidence.
