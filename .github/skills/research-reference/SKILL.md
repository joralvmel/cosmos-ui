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
5. Return required behavior separately from recommended and optional features. Cover customization,
   relevant states, web/native differences, catalog/loading/bundle costs and edge cases. Give
   alternatives, tradeoffs and a short set of questions the main conversation should ask the user.
6. Hand the report to the main conversation for the scope approval gate in the
   [component workflow](../../../docs/conventions/component-workflow.md). Do not implement, approve
   your recommendation or start another researcher. Research completion is not implementation approval.

## Files

- `docs/research/<topic>.md` (only if asked to persist)

## Checklist

- [ ] Sources linked
- [ ] Licenses listed
- [ ] Keyboard and ARIA requirements extracted
- [ ] Clear recommendation
- [ ] Required/recommended/optional features and user decisions separated

## Done

Deliver sourced findings and decision questions. This is read-only research, not a component test
run; do not claim builds, runtime validation or user approval that did not occur.
