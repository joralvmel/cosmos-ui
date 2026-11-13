# Icon visual specification

## Anatomy and contract

- One inline SVG exposed as the `icon` CSS part.
- The contract has no slots, interactions, events, or public states.
- Decorative rendering uses `aria-hidden`; informative rendering uses one image role and a required
  text label.

## Ownership and events

| Public state | Ownership / binding behavior |
| --- | --- |
| None | No controlled or autonomous state. |

The icon emits no DOM events; React, Angular and React Native therefore expose no event callbacks.

## Sizes

| Size | Width and height |
| --- | ---: |
| `sm` | 16 px |
| `md` (default) | 20 px |
| `lg` | 24 px |
| Positive finite number | CSS pixels on web; logical units on native |

`--cosm-icon-size` overrides the displayed size. Size-specific fallback hooks are
`--cosm-icon-size-sm`, `--cosm-icon-size-md`, and `--cosm-icon-size-lg`.

## Color and themes

- The web icon inherits `currentColor` from its surrounding context.
- `stroke` and `fill` are independent; the latter defaults to `none`. Node-level fill wins over
  root fill, including transparent nodes. `strokeWidth` defaults to 2 nonnegative SVG units.
- Only compatible closed geometry such as heart and star is suitable for the filled examples.
- React Native uses the active theme's foreground token because native SVG does not inherit CSS
  `currentColor`; the root `color` is that token, so node fills of `currentColor` match it.
- Do not add a variant, tone, hover treatment, or animation to this non-interactive graphic.
- The same semantic foreground is used in light and dark modes and across built-in themes.

## Accessibility

- Decorative icons are hidden from assistive technology and never receive focus.
- Informative icons expose one named image; `decorative=false` requires a non-empty `label`.
- Use a separate labeled interactive component when an icon is part of an action.
