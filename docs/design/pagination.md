# Pagination: approved scope

Pagination uses buttons, not links. It supports Lit, React, Angular and React Native.
`totalPages` is required and is a nonnegative safe integer. `page` is controlled;
`defaultPage` starts autonomous state at 1. Pages must be positive safe integers.
Invalid values are rejected. Effective pages clamp to the available range; autonomous
state commits a clamp on shrink (anchored at 1 for zero), while controlled state never
mutates its owner and follows the supplied page again on regrowth. Input corrections,
current-page activation, disabled actions and boundaries do not emit changes.

Numbered presentation shows the first, last and current neighbours with decorative
ellipses, keeping seven equal-width positions (or all pages for smaller totals).
Near either boundary, extra neighbors fill the range so the navigation arrows do not move.
Compact presentation shows a
localized summary. Both hide for zero or one page. Previous and next controls are
always available when visible; first and last are opt-in. The selected page supports
solid, soft and outline variants; sizes are sm, md and lg. Tokens, theme emphasis,
focus and hover states, custom height and native 44pt minimum targets apply.

Provide a required navigation label, localized control labels, page and summary
templates, locale-formatted numbers, and explicit RTL support. Icons are decorative
per-icon Cosmos Lucide imports. Web uses a named navigation landmark, native buttons
with `aria-current="page"`, ordinary Tab/Enter/Space and button type; native exposes
selected and disabled semantics and React Native Web current-page semantics. Preserve
focus during interaction without stealing it on unrelated prop changes. Composition
uses stable Button/IconButton with the approved minimal typed current-page, focus and
sizing extensions. Wrappers forward only.

Excluded: links/routing, page-size selection, jump input, unknown totals, fetching,
loading, infinite scrolling, automatic compact mode, custom content and extra tones.
Applications own fetching, announcements and content focus.

## Acceptance scenarios

- Validate type, integer, safe range and lower bounds; test zero, one and huge totals.
- Exercise controlled and autonomous changes, shrink and regrowth, boundaries and
  disabled/current actions without spurious events.
- Verify bounded, constant-slot page ranges, equal ellipsis/page widths, both presentations, variants, sizes,
  optional edge controls, localized labels, numerals and RTL.
- Verify native button semantics, keyboard activation, focus restoration and style hooks,
  including the native minimum target and composition regressions.
- Exercise generated examples across all four frameworks.

## Evidence matrix

| Evidence | Status |
| --- | --- |
| Shared/unit and platform mock tests | Passed: range bounds, input validation, ownership, clamp/regrowth, localization, semantics, focus and minimum targets; four platform scenario/drift drivers |
| Browser Web Component | Passed in Chromium: pointer, Enter/Space, boundaries and re-enabling, focus fallback to current page, controlled/autonomous Playground, invalid-input feedback, compact/numbered, RTL and 56px custom controls |
| Actual React and Angular mounts | Passed: React state and Angular signals accept proposals, render subsequent pages, support keyboard activation and disable the last boundary; not mocked wrappers |
| Theme and layout checks | Passed: Cosmos/Nebula light/dark computed colors, 375px/1280px widths without pagination overflow, reduced-motion transition duration 0s |
| Expo Web interaction | Passed: controlled and autonomous selections, keyboard, first/last, compact, disabled, RTL, localized summary, controlled shrink/regrowth and measured 56px custom minimum |
| Android export | Passed: Expo Android Hermes bundle and assets; export is not device execution |
| Android device touch/runtime | Unavailable: adb reports no connected devices; deferred with maintainer approval |
| iOS and manual screen readers | Optional; not verified |

The browser checks caught two real integration defects now covered by regressions:
derived `page` getters must not suppress a new controlled request, and the composed
IconButton must schedule a follow-up render when the browser's form-disabled reaction
runs during Lit attribute reflection. Normal IconButton fieldset updates retain their
existing synchronous scheduling. Both boundary directions were exercised again in Chromium.

Playground snippets are checked across HTML, React, Angular and React Native. Their generic
event callbacks log proposals; controlled consumers must update their own state, as documented.
Native mock assertions, Expo Web interaction and Android export are separate evidence; none
is a claim of Android or iOS device testing. No new runtime dependency or copied library code.

### Layout refinement evidence

The maintainer requested stationary numbered controls, separate documentation variant rows,
and consistent theme geometry. Nebula was the only built-in theme using `soft` radii; with
approval, it now uses `rounded` globally, matching the other built-in themes on web and native.

- Chromium measurements passed for sm/md/lg with totals 6, 7, 8, 20, 100 and 1000:
  page and ellipsis widths match, and arrow geometry stays identical across sampled
  boundary and middle pages.
- Cosmos/Nebula, light/dark and LTR/RTL passed stationary-arrow checks at viewport
  widths 375px and 1280px; all pagination buttons resolve to an 8px corner radius.
- Each documentation variant has its own vertically ordered preview.
- Expo Web passed equal-cell and unchanged-position measurements at 375px and 1280px,
  disabled/re-enabled controls and Enter activation. The custom example retains its
  56px height and at least 44px width; the numbered cells were visually checked.
- All 49 build/typecheck/test tasks, Biome and blocked-terms checks passed. The revised
  native component also passed Android Hermes export; device limitations above still apply.

### Web motion refinement

Numbered web controls now transition background, border and foreground with the normal-duration
theme token (200ms by default); newly inserted numbers fade in without moving hit targets.
Chromium verified actual running transitions and entry animations for solid/soft/outline,
immediate state and single-event delivery, unchanged arrow coordinates through pages 1-7,
and keyboard activation. Reduced-motion mode disables both effects. Browser media emulation
was restored to its default after testing. React and Angular share this web renderer; native
motion is unchanged. All 49 validation tasks and lint/blocked-terms checks passed again.

The subsequent centered-range refinement keeps numbered controls keyed by their physical slot,
not the page number. A 10-to-11 selection therefore retains the central selected control while
crossfading its old and new numerals. Outgoing text is decorative and hidden from accessibility;
focus follows the original logical page if it remains visible, otherwise the existing fallback
applies. Unit regressions cover central-control identity, outgoing text semantics, single-event
delivery and focus across reused slots. Chromium verified an actual overlapping 10-to-11
crossfade, pointer focus, and stable center/arrow geometry across 36 combinations of viewport
width (375/1280), direction, size and variant. Reduced motion hides outgoing text immediately,
disables the animations, and browser media emulation is restored after the checks.

## Research and accepted decisions

Required semantics come from the [HTML button definition](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element),
[navigation landmarks](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/) and
[`aria-current`](https://www.w3.org/TR/wai-aria-1.2/#aria-current).
There is no pagination-specific APG keyboard widget: ordinary buttons remain in the Tab order.
The [React Native accessibility reference](https://reactnative.dev/docs/accessibility)
informs native selected/disabled state rather than copying web-only landmark behavior.

The reviewed public references were [GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/),
[MUI Pagination](https://mui.com/material-ui/react-pagination/),
[Chakra Pagination](https://www.chakra-ui.com/docs/components/pagination) and
[React Native Paper DataTablePagination](https://github.com/callstack/react-native-paper/blob/main/src/components/DataTable/DataTablePagination.tsx).
All four implementations use MIT licenses. They informed behavior only; Cosmos composes its
own stable primitives and uses per-icon Lucide definitions under [ADR 0005](../adr/0005-icons-lucide.md).

Recommended and accepted for the initial version: bounded numbered ranges, an explicit compact
presentation, ownership semantics, localized templates/numerals and theme/custom-size hooks.
Optional first/last controls were accepted, off by default. URL links, arbitrary content,
page-size selection and remote-data behavior were excluded rather than partially implemented.
