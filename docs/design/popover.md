# Popover design

## Scope and anatomy

Popover shows consumer-supplied content in a non-modal surface anchored to a consumer-supplied
trigger. It has a trigger and a panel, with no built-in icons. Consumers provide the appropriate
content semantics and accessible name. Icons in examples follow ADR 0005 and use individual icon
definitions with the existing Icon renderer.

## Visual design

- Provide one neutral surface, sized to its content and constrained to the available viewport or
  safe area. Placement and alignment are configurable and adapt to collisions.
- Use theme surface, text, strong border, radius, spacing and shadow tokens in light and dark
  themes. Expose web panel styling hooks and native style overrides.
- Trigger appearance belongs to the consumer. Focus indicators belong to the interactive elements;
  no decorative animation or arrow is included.

## Ownership and accessibility

Open state is autonomous unless bound; controlled changes are proposals until the owner accepts
them. Map `cosm-open-change` to React and native `onOpenChange` and Angular `openChange`.
Web wrappers forward the typed event; native callbacks receive its detail. Closing requests can be
canceled. A panel action can request closure in either ownership mode.

The trigger is keyboard-operable and exposes expanded state. Escape on web and React Native Web
and outside press dismiss by default and are configurable; an outside press must not consume
the target's interaction. Initial focus remains on the trigger unless the consumer opts in.
Restore focus to the trigger for Escape and internal close when appropriate, not for outside
presses. Do not trap focus or apply modal, menu or tooltip semantics. Native supports Android Back
and preserves outside interactions without a touch-consuming backdrop.

## Deferred and excluded

Hover triggers, modal behavior, menu and tooltip semantics, arrows, animation, named sizes and
tones, and guaranteed nested-overlay coordination are excluded. Hardware Escape on native Android
and iOS is deferred; Android Back remains supported. A new positioning dependency requires separate
approval.

## Acceptance scenarios

- A trigger opens and closes the panel with pointer, touch and applicable keyboard input.
- Controlled proposals do not mutate the bound state; autonomous state changes and canceled close
  requests remain consistent. An action inside the panel can request closure.
- Web and React Native Web Escape, Android Back and outside presses follow the configured policy;
  outside targets still receive their interaction. Focus follows the agreed opening and closing
  rules.
- Placement adapts to viewport or safe-area edges and geometry changes, including scrolling and
  orientation changes.
- Demos exercise ownership, placement, dismissal, content and customization. Validate web,
  React and Angular runtime integration, React Native Web and Android runtime separately.
  Disclose iOS and manual screen-reader checks as not verified when not performed.
