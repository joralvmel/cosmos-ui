## Summary

<!-- What changes and why. Link the issue if there is one. -->

## Checklist

- [ ] Contract updated in `packages/core/src/specs/` (if the public API changed) and every platform kept in parity
- [ ] Tests added or updated (shared scenarios, drift tests, platform tests)
- [ ] Docs page updated in English and Spanish; `llms.md` updated if the API changed
- [ ] Only Cosmos tokens used for styling; light and dark checked
- [ ] Accessibility checked: keyboard, focus visible, labels/roles, reduced motion
- [ ] Changeset added for each publishable package (`npm run changeset`)
- [ ] Third-party code or assets recorded in `THIRD_PARTY_NOTICES.md`
- [ ] `npx biome ci . && npx turbo run typecheck test build` passes locally
