---
name: research-reference
description: 'Researches specifications and public libraries for a feature, compares behavior, accessibility, APIs and licenses, and recommends a dependency or an own implementation.'
---

# research-reference

Main agent: `researcher`. Read `AGENTS.md` first.

## Inputs

- Feature or component to research
- Constraints (platforms, bundle size, license)

## Steps

1. Read the specification first: WAI-ARIA APG pattern, HTML Living Standard, Open UI proposal.
2. Compare 2-4 public implementations (e.g. Web Awesome, React Aria, Zag.js, Radix, Floating UI, Tamagui) on behavior, keyboard, ARIA, API shape and edge cases.
3. Record the license of each option and whether it can be a dependency.
4. Recommend: use as dependency, or implement in Cosmos following the documented behavior. Never copy code without keeping its license and updating `THIRD_PARTY_NOTICES.md`.

## Files

- `docs/research/<topic>.md` (only if asked to persist)

## Checklist

- [ ] Sources linked
- [ ] Licenses listed
- [ ] Keyboard and ARIA requirements extracted
- [ ] Clear recommendation

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
