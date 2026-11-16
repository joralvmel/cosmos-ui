## Summary

<!-- What changes and why. Link the issue if there is one. -->

## Local review and scope

<!-- Accepted scope/design and exclusions (component work); locally reviewed commit SHA and user
acceptance before push. List any explicitly deferred checks. Not applicable? Explain why. -->

## Validation evidence

<!-- Use passed / failed / unavailable / not applicable / not verified (optional), with commands or
observed scenarios and environment. iOS and manual screen readers are optional/non-blocking by
default: do not run them unless explicitly requested or ask for individual waivers. Keep unverified
evidence disclosed, never passed. Required accessibility checks and known defects remain blocking.
See docs/conventions/component-workflow.md#default-readiness-policy. -->

| Area | Result | Command/scenario, environment and limitations |
| --- | --- | --- |
| Unit, shared scenarios and drift | | |
| Web component browser | | |
| React wrapper browser | | |
| Angular wrapper browser | | |
| React Native mocked tests | | |
| React Native Web | | |
| Android build / runtime (separate results) | | |
| iOS build / runtime (optional; separate results if run) | Not verified (optional) | Outside default validation scope unless explicitly requested |
| Visual / accessibility | | |
| Manual screen readers (optional) | Not verified (optional) | Outside default validation scope unless explicitly requested |

## Checklist

- [ ] Contract updated in `packages/core/src/specs/` (if the public API changed) and every platform kept in parity
- [ ] Tests added or updated (shared scenarios, drift tests, platform tests)
- [ ] Docs page updated in English and Spanish; `llms.md` updated if the API changed
- [ ] Only Cosmos tokens used for styling; light and dark checked
- [ ] Accessibility checked: keyboard, focus visible, labels/roles, reduced motion
- [ ] Changeset added for each publishable package (`npm run changeset`)
- [ ] Third-party code or assets recorded in `THIRD_PARTY_NOTICES.md`
- [ ] `npx biome ci . && npx turbo run typecheck test build` passes locally
- [ ] Current local review commit accepted before push; unavailable checks disclosed, not marked passed
