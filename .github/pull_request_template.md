## Summary

<!-- What changes and why. Link the issue if there is one. -->

## Local review and scope

<!-- Accepted scope/design and exclusions (component work); locally reviewed commit SHA and user
acceptance before push. List any explicitly deferred checks. Not applicable? Explain why. -->

## Validation evidence

<!-- Use passed / failed / unavailable / not applicable, with commands or observed scenarios and
environment. Delete no area merely because it was not run. See docs/conventions/component-workflow.md. -->

| Area | Result | Command/scenario, environment and limitations |
| --- | --- | --- |
| Unit, shared scenarios and drift | | |
| Web component browser | | |
| React wrapper browser | | |
| Angular wrapper browser | | |
| React Native mocked tests | | |
| React Native Web | | |
| Android build / runtime (separate results) | | |
| iOS build / runtime (separate results) | | |
| Visual / accessibility | | |

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
