# Theme repertoire

## Approved scope

Expand the existing theme registry, not the public token vocabulary:

| Theme | Primary family | Intent |
| --- | --- | --- |
| Terra | Green | Grounded and fresh |
| Supernova | Coral red | Warm and energetic |
| Aurora | Cyan/turquoise | Clear and luminous |
| Solstice | Amber/gold | Warm and balanced |

Keep Cosmos and Nebula unchanged and Cosmos as the default. The new palettes should be balanced:
recognizable primary colors, harmonious accents and discreet surfaces, with light and dark modes.
Keep the standard radius preset and existing typography, spacing and motion.

All four use analogous harmony and neutral chroma `0.008`, without per-mode overrides:

| Theme | Primary seed | Light primary | Dark primary |
| --- | --- | --- | --- |
| Terra | `oklch(0.56 0.16 145)` | `#1c882d` | `#50a956` |
| Supernova | `oklch(0.60 0.19 28)` | `#c93029` | `#ea5f52` |
| Aurora | `oklch(0.60 0.14 190)` | `#00837e` | `#00a8a2` |
| Solstice | `oklch(0.68 0.16 82)` | `#926a00` | `#bb8800` |

## Implementation boundaries

- Start every definition with the theme generator, then tune the existing seed and harmony inputs.
- Reuse semantic roles and the existing CSS, Tailwind, JSON and native outputs.
- Keep success, warning, danger and info semantically stable. Brand colors do not replace status
  indicators; pair status color with meaningful text or icons, especially for green/red themes.
- Use the dynamic theme registry in the docs gallery, site/Playground controls and native demo.
- Do not add tokens, dependencies, component APIs or theme-specific component behavior.
- Do not lower WCAG contrast or color-vision-deficiency thresholds to admit a palette.

## Acceptance

- Every built-in theme passes existing validation in both modes: text contrast at least 4.5:1,
  UI/focus at least 3:1 and tested CVD pairs at least CIEDE2000 10.
- New palette scopes/variants and values are present in CSS, Tailwind, JSON and native output.
- Gallery and selectors expose all six themes; previews and shared controls follow the active
  palette/mode, including Playground overrides and return to the site setting.
- Check real colors, keyboard focus, contrast and narrow/wide layouts in web and native demos.
- Update EN/ES docs and generated AI references; add the necessary changeset.
- Finish with a validated local review commit, without push or PR.

## Verification

Generated all four definitions with `npm run generate -- theme <name> --seed "<primary seed>"`.
Existing validation passes for both modes without changing thresholds:

| Theme | Minimum text contrast | Minimum UI contrast | Minimum simulated CVD distance |
| --- | --- | --- | --- |
| Terra | 4.54:1 | 3.07:1 | 13.95 |
| Supernova | 4.55:1 | 3.01:1 | 12.98 |
| Aurora | 4.57:1 | 3.05:1 | 11.28 |
| Solstice | 4.55:1 | 3.10:1 | 13.45 |

- Focused token/output and real Tailwind compilation tests pass; CSS scopes, mode values,
  variants, JSON and native palettes include the new names.
- `npx biome ci .`, all 49 Turborepo typecheck/test/build tasks, `npm run check-terms`,
  `npm run status` and the generated AI-reference drift check pass.
- Chromium gallery: all six themes, both modes, actual 375px/1280px viewports (24 cases).
  Rendered primary colors match native output; minimum solid-button text contrast 4.55:1
  and keyboard-focus contrast 4.38:1. EN/ES galleries contain all six themes.
- Web Text Field and Expo React Native Web demo: each new theme, both modes and both widths
  (16 cases per platform). Actual focused surfaces/borders match the palettes, text contrast
  is at least 13.86:1, focus contrast at least 3.92:1, with no control overflow.
- Playground: eight new theme/mode overrides apply to preview and rendered shared controls;
  returning to Site restores all five themed surfaces. Native demo theme selection also
  works through actual keyboard activation.
- Gallery screenshots reviewed for each added palette in both modes. Browser automation
  required direct Chromium viewport/input commands where the embedded browser's standard
  helpers reported stale dimensions or pointer coordinates; actual widths and hit targets
  were asserted before measurement and interaction.
- Android device/runtime and iOS are not revalidated for this palette expansion. Native output,
  mocked tests, typecheck/build and actual React Native Web interaction are distinct evidence.
  Manual screen readers remain not verified (optional).
