# Badge design

## Purpose

Badge is a noninteractive, static label for a status or category. It can also display a
caller-formatted count as ordinary text. The application owns contextual labeling and any
announcements; Badge does not add a live region.

## Public API

| API | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `soft \| solid \| outline` | `soft` | Visual treatment. |
| `tone` | `neutral \| info \| success \| warning \| danger` | `neutral` | Semantic color intent. |
| `size` | `sm \| md \| lg` | `md` | Label size. |
| `startIcon` | `IconDefinition \| undefined` | `undefined` | Optional decorative leading icon. |

Text uses the web default slot, React children, Angular content projection, and a required
string child on React Native. There is no separate text, count, label, or numeric-size API.
Badge has no events, public states, keyboard behavior, disabled/loading behavior, or interactive
semantics; its contract role is empty.

## Visual and platform contract

The shape is a rounded rectangle with content-driven dimensions and the theme's medium radius
by default. Text wraps instead of truncating. Soft is the default variant; neutral is the default
tone. Semantic tones reuse existing tokens: solid uses intent/intent-foreground, soft uses
intent-subtle/intent-text, and outline uses transparent/intent-text with an intent-text border.
Neutral solid uses neutral foreground/background; neutral soft uses raised surface/foreground;
neutral outline uses transparent/foreground with a strong border. Warning foreground pairings
must preserve the existing token contrast. All tones, variants, and sizes require theme/mode
attention; do not add tokens or dependencies.

The web component exposes `base`, `label`, and conditional `icon` parts, with
`--cosm-badge-background`, `--cosm-badge-color`, `--cosm-badge-border`,
`--cosm-badge-padding-inline`, `--cosm-badge-padding-block`, `--cosm-badge-gap`,
`--cosm-badge-font-family`, `--cosm-badge-font-size`, `--cosm-badge-font-weight`,
`--cosm-badge-line-height`, and `--cosm-badge-radius` hooks. Defaults derive from theme
spacing, typography, and `radius.md`; there is no fixed height.

The icon uses the existing structured `IconDefinition` API and per-icon imports/reuse; web icons
are decorative Lucide icons, and native uses the existing `Icon` component. It has no accessible
name of its own. On native, icon color follows the final text foreground, including `textStyle`
overrides. Native supports container `style`, `textStyle`, and `testID`; caller overrides apply
last, and native font scaling remains enabled. React Native keeps its normal accessibility defaults
and does not create a tab stop.

## Ownership and events

Badge has no component state, so there is no state ownership or controlled/bound inference. It
emits no DOM, React, or Angular events and has no event detail mapping.

## Acceptance scenarios

- Each platform renders its supplied text with the default soft/neutral/medium appearance.
- Each variant, tone, and size can be selected independently without changing text.
- An optional leading decorative icon renders before the label and is omitted when absent.
- Counts are passed as caller-formatted text, including zero; the component does not format,
  suppress, cap, or announce them.
- Long text wraps without truncation; native text scaling is enabled.
- Container/text style overrides on native are honored without changing component-owned behavior.
- Documentation and examples present Badge as static and explain application-owned contextual
  labeling and announcements.

## Catalog dependency

`dependsOn: ['icon']`. Badge depends on the stable icon component and uses its structured icon
definitions; no icon registry or new dependency is introduced.

## Research and accepted scope

The user approved this scope after two decision batches: static labels and caller-formatted counts;
the variants, tones and sizes above; optional leading icons; platform customization hooks; and
application-owned announcements. Click/link/remove behavior, count formatting and overflow,
zero suppression, dots, icon-only content, numeric sizing and animation are excluded from this
version. No new dependency or copied third-party implementation is needed.

References reviewed:

- [HTML span](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-span-element):
  ordinary inline content, without an imposed widget or live-region role.
- [Radix Badge](https://www.radix-ui.com/themes/docs/components/badge) (MIT) and
  [Fluent Badge](https://fluent2.microsoft.design/components/web/react/core/badge/usage) (MIT):
  separate appearance, color intent and size; counter behavior is a distinct concern.
- [React Native Paper Badge](https://unpkg.com/react-native-paper@5.15.5/src/components/Badge.tsx)
  (MIT): native comparison; Cosmos avoids fixed heights and truncation.
- [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and
  [use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): readable text and
  meaning beyond color.
- [React Native accessibility](https://reactnative.dev/docs/accessibility): native accessibility
  mapping differs from the DOM, including Android-specific live-region support.
- [ADR 0005](../adr/0005-icons-lucide.md): Lucide ISC definitions and existing platform renderers.

## Validation evidence

Verified on Windows on 2026-11-18. File presence and native DOM mocks are not device evidence.

| Area | Result | Evidence |
| --- | --- | --- |
| Contract and platform tests | Passed | Shared scenarios and drift tests in the Badge test files in `packages/elements`, `packages/react`, `packages/angular` and `packages/native`; Playground optional-reference coverage and core snippet-generation tests. |
| Formatting | Passed | `npx biome ci .`; existing schema 2.6.6 / CLI 2.6.7 informational notice remains. |
| Affected package checks | Passed | `npx turbo run typecheck test build --filter=@joralvmel/cosmos-core --filter=@joralvmel/cosmos-elements --filter=@joralvmel/cosmos-react --filter=@joralvmel/cosmos-angular --filter=@joralvmel/cosmos-native --filter=@joralvmel/cosmos-docs --filter=@joralvmel/cosmos-native-demo`. |
| Repository-wide checks | Failed, pre-existing | Full `npx turbo run typecheck test build` fails only the generator's `other targets > adds a theme after the existing ones` assertion, which expects exactly `[cosmos, nebula, aurora]` after the baseline added more themes. Neither the test nor theme definitions changed in this task. All 48 tasks pass with `--filter='!@joralvmel/cosmos-generator'`; the generator failure is not hidden or fixed here. |
| Terms and structure | Passed | `npm run check-terms`; structure coverage in the tools suite; `git diff --check`. |
| Web component | Passed | Chromium docs Playground: all 180 combinations of six built-in themes, two modes, three variants and five tones render; small/medium/large controls, icon add/remove, generated snippets and static semantics verified. |
| React | Passed | Actual compiled wrapper mounted in a temporary Vite browser harness; keyboard activation updates text, tone, variant, size and icon, then resets and clears the icon. |
| Angular | Passed | Actual compiled standalone proxy mounted with Angular bootstrap; signal-bound inputs and projected text update and reset. Tab moves directly between external controls, skipping both static badges. |
| React Native unit tests | Passed, mocked | Existing DOM stand-ins exercise shared scenarios, theme values, icon hiding, string children and style overrides; not native-device proof. |
| React Native Web | Passed | Actual Expo `/badge` screen: theme and light/dark controls for all six themes, optional decorative icon, outline/warning/small controls, zero-count toggle, wrapping and container/text customization. Final custom icon color follows text. Hidden browser tabs required temporary browser focus emulation; it was restored afterward. |
| Android export | Passed | `expo export --platform android` produced a Hermes JavaScript bundle; this is not an APK build. No new standalone APK was built. |
| Android runtime | Passed | Existing Expo Go SDK 58 on Pixel 9 API 35 emulator, Android 15: native screen navigation, variant/tone/size controls, decorative icon, count toggle and multi-line text rendered. Final screen also verified with system font scale 1.5; original 1.0 restored afterward. |
| Visual/accessibility | Passed for observed scenarios | Web RTL icon ordering, consumer radius/foreground hooks, 140px wrapping, forced colors and reduced-motion mode; native 320px wrapping and Android enlarged text. Text contrast measured across 180 web token pairs (minimum 4.553:1) and 180 native hex token pairs (minimum 4.541:1), above 4.5:1 on the documented theme background. Transparent outline badges on custom backgrounds and consumer overrides need application contrast validation. |
| iOS | Not verified (optional) | No iOS checks attempted. |
| Manual screen readers | Not verified (optional) | No NVDA, JAWS, VoiceOver or TalkBack session attempted. |

Production docs interaction produced no new console errors during the observed scenario. The
development server had stale optimized-dependency 504 responses during rebuilds; checks continued
against the production build. Its missing favicon and build-time i18n/sitemap notices are existing
site diagnostics, not Badge failures.

Badge remains `in-progress` solely to disclose the unresolved repository-wide generator check.
Its catalog note must be revisited after that baseline issue is fixed and full validation is green.
