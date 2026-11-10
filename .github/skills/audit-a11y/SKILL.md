---
name: audit-a11y
description: 'Audits accessibility on web and React Native: axe, keyboard, focus, screen readers, contrast and motion.'
---

# audit-a11y

Main agent: `test-engineer`. Read `AGENTS.md` first.

## Inputs

- Component or page

## Steps

1. Web: run axe (Playwright) on the docs examples; navigate with keyboard only; check focus order and visible focus.
2. Check names, roles, states (aria-*) and announcements with NVDA/VoiceOver.
3. Check contrast through the theme validation and in forced-colors mode.
4. Check `prefers-reduced-motion`.
5. Native: TalkBack/VoiceOver in the Expo demo, 44pt targets, focus order.

## Files

- Findings in the PR description; fixes in the component files

## Checklist

- [ ] No axe violations
- [ ] Keyboard complete
- [ ] Screen reader output correct

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
