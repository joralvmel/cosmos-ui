# Calendar design

## Purpose

Calendar is an inline, single-date selection control for choosing a Gregorian date. It is the
reusable date-grid primitive that unblocks Date Picker and Date Range Picker; it does not own a text
field, overlay, or date-range interaction.

## Public API and ownership

| API | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `YYYY-MM-DD \| undefined` | `undefined` | Controlled selected date. |
| `defaultValue` | `YYYY-MM-DD \| undefined` | `undefined` | Initial selected date for autonomous use. |
| `min` | `YYYY-MM-DD \| undefined` | `undefined` | Earliest selectable date, inclusive. |
| `max` | `YYYY-MM-DD \| undefined` | `undefined` | Latest selectable date, inclusive. |
| `locale` | `string \| undefined` | Environment locale | Locale for month/day names, week start, and RTL direction. |
| `disabled` | `boolean` | `false` | Disables selection and navigation. |

The selected date is the only public state. When `value` is bound, the component proposes a new
date and waits for the consumer to update `value`; without a binding, it commits the selection
autonomously. Browsed month and active day are internal. DOM emits `cosm-change`, React exposes
`onChange`, Angular exposes `valueChange`, and React Native exposes `onValueChange`; each proposal
has `{ value: string }` detail with the selected `YYYY-MM-DD` value.

No separate size, variant, or tone is exposed. The calendar fills its available inline width and
keeps seven equal weekday columns. `min` and `max` mark out-of-range dates unavailable and prevent browsing beyond the range. Invalid
dates and reversed bounds are rejected explicitly.

## Anatomy and customization

| Part | Contract part | Purpose |
| --- | --- | --- |
| `base` | `base` | Calendar root and direction context. |
| `header` | `header` | Month heading and navigation row. |
| `previous` | `previous` | Previous-month button. |
| `heading` | `heading` | Localized month and year. |
| `month-trigger` | `month-trigger` | Opens the in-place month choices. |
| `year-trigger` | `year-trigger` | Opens the in-place year choices. |
| `next` | `next` | Next-month button. |
| `grid` | `grid` | Seven-column calendar grid. |
| `weekday` | `weekday` | Localized weekday abbreviation. |
| `day` | `day` | Date cell, including adjacent-month dates. |
| `month-option` | `month-option` | Month choice in the month selection view. |
| `year-option` | `year-option` | Year choice in the year selection view. |

Web customization is through Cosmos theme tokens, the documented parts, and `--cosm-calendar-*`
hooks. No custom day renderer or arbitrary per-day content is provided. Native styling follows
`useTheme()` and the equivalent component props; it does not expose DOM parts.

The header contains previous/next controls and separate month and year buttons. Activating either
replaces the date grid with an in-place set of month or year buttons; years are paged in groups of
12. Choosing a month or year changes only the displayed month, not the selected date. Choices with
no dates inside `min`/`max` are unavailable. This avoids a dependency on Select or Dialog and works
with native buttons on every platform.

The visible month initially contains the selected date, or today when no date is selected. Today is
visibly distinguished but is not selected implicitly. Adjacent-month dates complete the week rows
and can be selected; doing so moves the displayed month. There is one month at a time.

## Visual and platform contract

Use the neutral calendar surface and text tokens, the primary/primary-foreground pairing for the
selected date, muted text for adjacent-month dates, and the disabled token for unavailable dates.
Today has a non-color-only marker. Hover, active, selected, and focus-visible are distinct states;
the focus ring remains visible in light/dark themes and forced-colors mode. The calendar has no
loading or invalid state. Respect reduced motion; no animation is required.

Day targets are at least 44 CSS pixels on web touch layouts and 44 points on native. At widths that
cannot fit seven targets, the date grid scrolls horizontally while the month header remains visible.
Web uses semantic buttons in an ARIA grid, with exactly one day in the Tab sequence. Native uses
accessible pressable date items with localized full-date labels, selected/disabled state, and
touch-safe hit areas. RTL follows the resolved locale while preserving chronological date semantics.

The navigation controls use the existing structured Lucide `chevron-left` and `chevron-right`
definitions through Cosmos `icon`; no inline SVG or copied artwork. The catalog records `button`
and `icon` as direct dependencies. No runtime dependency is added.

## Keyboard and accessible behavior

On web, arrow keys move one day or one week, Home/End move to the first/last day of the localized
week, PageUp/PageDown move by month, and Shift+PageUp/Shift+PageDown move by year. Enter/Space
selects the focused enabled date. Month and year choices are native buttons and remain keyboard
reachable with Tab. Focus returns to the active date after a choice. Focus remains on the active
date as the month changes. Month changes are announced, and each date has a localized accessible
name with selected, today, and disabled state conveyed without color alone.

On React Native, dates have native button semantics and localized labels/states. Touch selection is
the primary interaction. React Native Web uses browser keyboard events; Android and iOS follow
native focus and screen-reader behavior rather than claiming the web-only ARIA grid keyboard model.

The first weekday and displayed day names follow the effective locale. Use
`Intl.Locale.getWeekInfo()` where available and the CLDR territory week-start data as a runtime
fallback; do not silently assume a US/Sunday-first calendar. Direction uses locale text metadata
where available and RTL script/language fallback data otherwise. Navigation icons mirror visually
in RTL while previous/next actions retain their chronological meaning.

## Acceptance scenarios

- An unbound calendar selects a date autonomously; a controlled calendar emits a proposal and does
  not change its selected state until `value` changes.
- The selected date's month is initially visible; otherwise the current date's month is visible,
  while no date is selected by default.
- Month and year buttons open in-place choices; selecting one changes the visible month without
  proposing a date change, and unavailable choices respect inclusive bounds.
- Previous/next navigation, adjacent-month selection, and keyboard month/day movement preserve the
  date-only value and update the internal view/focus.
- `min` and `max` are inclusive; out-of-range dates cannot be selected, and month navigation cannot
  move beyond the available range.
- Localized month/day labels and week start follow the explicit locale or platform environment;
  RTL layout follows the locale direction.
- Today, selected, focused, adjacent-month, disabled, and high-contrast states remain discernible.
- Native date targets meet the 44-point minimum and expose localized accessibility labels/states.
- Docs/playground and native demo expose representative value, bounds, and locale controls.

## Exclusions

Date text entry, popover/dialog, time, ranges, multiple month grids, week numbers, arbitrary
disabled dates, custom day contents, non-Gregorian calendars, size/variant props, event scheduling
views, and animations are deferred. Event scheduling is a distinct agenda concern; it needs a
separate event/time-zone contract rather than expanding this single-date selector.

## Research and accepted scope

The user approved this scope after reviewing the inventory, dependency chain, reference behavior,
and platform/accessibility options. Behavioral research informed the interaction model; the
component API and implementation are original.

References:

- [WAI-ARIA APG Date Picker Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/):
  keyboard and announcement guidance; the APG marks its example illustrative, not production-ready.
- [WAI-ARIA APG Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/): composite grid
  keyboard model and roving focus.
- [HTML date input](https://html.spec.whatwg.org/multipage/input.html#date-state-(type=date)):
  date-only value normalization and browser-controlled presentation.
- [React Aria Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html) (Apache-2.0):
  localized calendar and keyboard behavior reference.
- [MUI X Date Calendar](https://mui.com/x/react-date-pickers/date-calendar/) (MIT):
  single-date calendar scope reference.
- [React Native community datetime picker](https://github.com/react-native-datetimepicker/datetimepicker)
  (MIT): native platform picker comparison; not used as a dependency because Cosmos needs a shared
  inline grid.
- [Intl.Locale `getWeekInfo`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo):
  locale first-weekday metadata; availability must be checked on the React Native runtime.
- [Unicode CLDR week data](https://github.com/unicode-org/cldr-json/blob/main/cldr-json/cldr-core/supplemental/weekData.json):
  territory fallback for locale first-weekday metadata.
- [ADR 0005](../adr/0005-icons-lucide.md): structured Lucide icon definitions and Cosmos renderers.

## Validation evidence

- `npx turbo run typecheck test build --filter=...@joralvmel/cosmos-core --filter=...@joralvmel/cosmos-elements --filter=...@joralvmel/cosmos-native --filter=...@joralvmel/cosmos-native-demo --filter=...@joralvmel/cosmos-docs`: passed; 30 tasks, including core, Web, React, Angular, native, native demo, and docs.
- Browser interaction passed on the docs site and React Native Web demo: opened the month/year choices, selected April 2030, and confirmed the selected date remained unchanged.
- Android Expo export passed; no Android device interaction was run.
- `npx biome ci .`, `npm run check-terms`, `npm run status`, and `npx changeset status` passed. Biome reports the existing informational schema mismatch (config 2.6.6, CLI 2.6.7).
- iOS and manual screen-reader checks are not verified (optional).
