# Component discovery and local review workflow

This is the shared workflow for creating or extending components and charts. Skills and agents
must preserve its two human approval gates. The local review and Git handoff also apply to other
implementation tasks. Read [AGENTS.md](../../AGENTS.md) and the
[component anatomy](component-anatomy.md) first.

The main conversation owns questions and approvals. Specialists return research, proposals,
implementation or test evidence; they cannot approve their own recommendations or publish work
on behalf of the main conversation. Use the available question tool and wait for the user.

## 1. Research before decisions

For an existing project used as inspiration, start with `adapt-reference-project` and the
[reference-project convention](reference-projects.md). Read-only source analysis and a token,
component and migration map inform this workflow; they do not replace either approval gate.

- Check the inventory, existing contracts, architecture decisions and dependencies. Start a local
  work branch from up-to-date `develop`; preserve unrelated work.
- For a new component, get the `researcher` report before deciding its feature set. For an extension,
  research the new behavior; reuse linked findings when they still cover the requested change.
  An exact bug fix within an already approved contract does not need another feature interview.
- Prefer standards, then compare 2-4 relevant public implementations. Include sources, licenses,
  web/native differences, accessibility requirements, edge cases, bundle/dependency costs and
  practical limits. State when there is no applicable standard or a source could not be checked.
- Separate mandatory platform/accessibility requirements from recommended features and optional
  enhancements. A recommendation is not approval to add a dependency, import a full catalog or
  expand the API. Never copy implementation, assets or documentation without authorization and
  license compliance.

## 2. Scope approval gate

After research, the main conversation presents the findings and asks informed questions, not just
questions about ambiguities. Offer a recommendation, alternatives and the cost of each choice.
Ask in small batches (usually 3-5 related decisions); do not bury the user in a complete API form.

Cover what matters to this component:

- Purpose, essential features, suggested enhancements and explicit exclusions.
- Variants, sizes (semantic and custom), tones, separate visual properties, icons/content and slots.
- States, interactions, ownership, events, forms, keyboard, labels, responsive behavior and motion.
- Customization hooks, tokens, light/dark and themes; platform differences and fallbacks.
- Data sources, catalog scope, loading strategy, bundle cost, licensing and new dependencies.
- Acceptance scenarios and the available web, wrapper and native test environments.

Examples illustrate needs; they are not exclusive lists of supported values. Do not silently turn
an example icon, color or state into a special case. Avoid irrelevant options for simple components.
Figma and screenshots are inputs to this discussion, not specifications of unseen behavior.

Summarize **included / excluded / deferred**, proposed defaults, platform differences and acceptance
criteria. **STOP for explicit user approval before generating files, editing the contract or
implementing the component.** The user may explicitly accept the recommended defaults; silence,
a research recommendation or an initial "implement this" request is not scope approval.

After approval, record the decisions in `docs/design/<name>.md` (and an ADR when warranted).
Include the approved scope, exclusions, API/visual decisions and acceptance scenarios rather than
conversation transcripts. When approved decisions already exist, reuse them instead of asking
again. Reopen this gate if new research or implementation requires a meaningful scope, API,
dependency or design change; explain the difference before proceeding.

## 3. Implement the accepted scope

- Generate the scaffold; finalize the core contract and shared scenarios before platform behavior.
  Keep the approved visual spec and contract consistent.
- Implement the web component, React/Angular adapters and native component without duplicating
  behavior across wrappers. Do not stop at native stubs.
- Complete the docs (EN/ES), Playground, native demo, AI references and changeset where applicable.
  Extend shared generator/control support only for a demonstrated gap, not speculative features.
- Keep examples representative: normal use, relevant states, customization and documented limits.
  The Playground and native demo must exercise the accepted API, not just render a default.

## 4. Validate with evidence

Agents run the checks themselves using available tools; do not make the user the default tester.
Run focused regressions while working, then the required repository checks before the local review
commit: `npx biome ci . && npx turbo run typecheck test build`, `npm run check-terms` and
`npm run status`. Check changesets when publishable packages changed. Do not install tools or
dependencies merely to satisfy this list without the required authorization.

Report this matrix for the affected component, with an exact command/test path or observed scenario
and environment for every row:

| Area | Evidence to collect |
| --- | --- |
| Contract and unit tests | Shared scenarios, API drift, invalid input and relevant edge cases |
| Web component | Actual browser interaction, keyboard, focus, layout, console errors and warnings |
| React | Mount the actual wrapper and verify prop/state/event integration in a browser |
| Angular | Mount the actual wrapper and verify input/output/forms integration in a browser |
| React Native unit tests | Shared scenarios and platform cases; identify mocks explicitly |
| React Native Web | Demo controls, interaction, accessibility props and browser console |
| Android | Native export/build separately from runtime interaction on a named emulator/device |
| iOS | Native export/build separately from runtime interaction on a named simulator/device |
| Visual/accessibility | Light/dark, built-in themes, narrow/wide layout, roles/names/states, motion and applicable assistive technology |

Use **passed / failed / unavailable / not applicable**. Explain unavailable environments and why an
area is not applicable; do not turn an unavailable check into a pass. Existing limitations remain
visible in the local review and PR. Fix regressions and new relevant console errors/warnings;
distinguish unrelated existing diagnostics instead of hiding them.

Mocks, typechecks and exports do not prove device behavior. React Native Web is not Android/iOS.
A programmatic DOM click is not a real pointer, keyboard or touch test. If browser automation
cannot activate an actual control, report that limitation rather than claiming the interaction
passed. Verify generated snippets with the real framework integration when applicable.

File presence, a successful inventory command or coverage alone does not establish readiness.
Keep a component `in-progress` when required acceptance checks are failed or unavailable.
The user may explicitly defer unavailable checks, but they remain unverified in the evidence and
any readiness statement; never fabricate device, screen-reader or browser results.

## 5. Local commit and review gate

`finish-work` validates the final tree, runs `verify-identity` and creates a Conventional Commit
locally on the work branch. No extra request to commit is needed for an implementation task unless
the user explicitly asked for no commit. Stage only task files, allow hooks to run and never
amend, squash or rewrite earlier commits without explicit permission.

Present the branch, commit SHA, change summary, test matrix, remaining limitations and exact steps
or URLs for local validation. The reviewed state is that SHA with a clean task worktree. A
research-only or explanation-only request does not authorize edits or commits.

**STOP after the local commit. Do not push or create a PR until the user explicitly approves the
current reviewed HEAD.** Scope approval from section 2 is not approval to publish. An initial
request to implement, finish or eventually open a PR is not acceptance of unseen changes.

If changes are requested, implement them on the same local work branch, rerun the affected checks,
create a **new commit** and return to this gate. Present the new SHA and wait again; previous
approval does not carry over to changed code. Rerunning `finish-work` with no diff must not create
an empty commit or skip the pause. The same rule applies to updates on a branch with an open PR.

## 6. Approved push and pull request

On explicit approval of the current reviewed HEAD, `open-pr` verifies identity, branch, remote,
worktree, validation evidence and that HEAD has not changed since review. If approval or evidence
cannot be recovered after a session change, ask again or rerun the missing checks. Do not infer it.

- If task files changed, stop: validate, commit and return to local review. A rebase, merge or
  conflict resolution that changes the reviewed tree also needs a new review commit.
- Push the approved work branch normally, never force-push by default. Push updates to an existing
  PR only after the same approval gate.
- Check for an existing PR for this repository/head/base before creating one. Reuse an open PR;
  stop and explain if its base is unexpected or the work branch was already merged/closed.
- Open new work PRs to `develop` with the template, approved scope, evidence matrix and remaining
  limitations. Report the URL and checks. Do not merge automatically.
- Release promotion (`develop` to `main`) still uses the separate `release-pr` process and requires
  explicit release intent. Local review approval is not release or publishing approval.

These are agent workflow instructions, not new GitHub protection rules or an enforcement hook.
Identity hooks and CI remain safeguards; neither proves user acceptance or real-device testing.

## Tool availability

The orchestration roles include the `agent` capability and `vscode/askQuestions`; test/native roles
include qualified `browser/<tool>` references. These match the
[VS Code custom-agent reference](https://code.visualstudio.com/docs/agents/reference/custom-agent-file-reference)
and [browser tools](https://code.visualstudio.com/docs/agents/run/browser-tools). Actual tool
availability depends on the harness, client and permissions. Use the supported question/browser
tools in that session; do not invent tool names or install an MCP server for built-in browser tools.
If a specialist cannot access a tool available to the main conversation, have the main conversation
perform that check. If neither can, disclose the blocker rather than silently skipping the gate.
