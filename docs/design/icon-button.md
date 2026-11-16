# Icon button design

## Scope and anatomy

Icon button activates an action or toggles a boolean state. It contains one decorative icon supplied
as content, rendered with the existing Cosmos Icon. The interactive surface is exposed as the `base`
part. An explicit, non-empty localized label names the button.

The icon follows ADR 0005: consumers import individual structured icon definitions; the component
does not add an icon registry or load the full catalog. Web uses a default slot; native uses a child
and provides the surface foreground to the existing Icon.

## Visual design

- Match Button's `solid`, `soft`, `outline`, and `ghost` variants and `primary`, `neutral`, and
  `danger` tones. Defaults are `solid` and `primary`.
- Square visual controls use the `sm`, `md`, and `lg` control tokens; `md` is the default.
- Native reserves at least 44 by 44 logical points for interaction, even when the visual surface
  is smaller. Web uses the control tokens and exposes the same visual sizes.
- Theme tokens supply color, spacing, radius, focus and motion; component CSS properties and the
  `base` part provide focused overrides. Native accepts its standard `style` customization.
- Hover, active, focus-visible, disabled, and toggle-pressed states remain distinguishable in
  light and dark themes. Reduced motion disables nonessential transitions.

## Ownership and accessibility

| State | Ownership and mapping |
| --- | --- |
| Toggle pressed | Unbound state is autonomous. A bound value is controlled; activation proposes the opposite value without committing it. The web event is `cosm-pressed-change`, with `onPressedChange` in React and native and `pressedChange` in Angular. |

Activation emits `cosm-press`, `onPress`, `press`, and `onPress` respectively. DOM, React and
Angular receive the typed event; native callbacks receive its detail.

The button has a stable accessible name and its decorative icon is not announced separately.
Web uses a native button and Enter/Space activation; toggle mode exposes `aria-pressed`. Native
exposes an appropriate role and accessibility state. Disabled controls do not activate. Web
defaults to `type="button"` and supports submit and reset; native has no HTML form behavior.

## Deferred and excluded

Loading, tooltip, mixed toggle state, icon-name registry, new dependencies, and replacing existing
Text Field controls are outside the approved scope.

## Acceptance scenarios

- Pointer/touch and web keyboard activation emit one press; disabled activation emits none.
- Autonomous toggle changes on activation; a controlled toggle emits a proposal and remains
  unchanged until its owner supplies the new value, including when the bound value is false.
- The label remains stable and is announced once; the icon is decorative and a missing label is
  explicitly rejected.
- Submit and reset work in web forms; action buttons do not submit by default.
- Demos exercise variants, tones, sizes, disabled and toggle state, and icon customization.
- Validate contract and platform drift, real browser and wrapper integration, native web and
  available device runtimes. Report unavailable checks rather than treating mocks as runtime proof.
