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
6. Follow the [component workflow](../../../docs/conventions/component-workflow.md): record the
   browser/device and actual tool used for each check. If axe, a screen reader or a native runtime
   is unavailable, state that explicitly instead of checking its box. Scripted DOM activation is
   not evidence of real keyboard/touch use; accessibility tree inspection is not a screen-reader run.

## Files

- Findings in the PR description; fixes in the component files

## Checklist

- [ ] No axe violations
- [ ] Keyboard complete
- [ ] Screen reader output correct

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
