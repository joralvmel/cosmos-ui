---
name: audit-a11y
description: 'Audits accessibility on web and React Native: axe, keyboard, focus, screen readers, contrast and motion.'
---

# audit-a11y

Main agent: `test-engineer`. Read `AGENTS.md` first.

## Inputs

- Component or page
- Optional explicit request for manual screen-reader or iOS validation (off by default)

## Steps

1. Web: run axe (Playwright) on the docs examples; navigate with keyboard only; check focus order and visible focus.
2. Check names, roles and states (aria-*) using tests and browser accessibility inspection.
   Check actual reader announcements only when manual screen-reader testing was explicitly requested.
3. Check contrast through the theme validation and in forced-colors mode.
4. Check `prefers-reduced-motion`.
5. Native: check accessibility props, 44pt targets and focus order in the applicable demo.
   TalkBack/VoiceOver runs and iOS validation are optional; do not attempt them unless requested.
6. Follow the [component workflow](../../../docs/conventions/component-workflow.md): record the
   browser/device and actual tool used for each check. If axe, a screen reader or a native runtime
   is unavailable, state that explicitly instead of checking its box. Scripted DOM activation is
   not evidence of real keyboard/touch use; accessibility tree inspection is not a screen-reader run.
   The [readiness policy](../../../docs/conventions/component-workflow.md#default-readiness-policy)
   makes unrun iOS and manual reader checks non-blocking without per-component waivers. Report them
   as not verified (optional), never passed. Known accessibility defects still block readiness.

## Files

- Findings in the PR description; fixes in the component files

## Checklist

- [ ] No axe violations
- [ ] Keyboard complete
- [ ] Optional reader/iOS checks disclosed as not verified, or actual results reported if requested

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
