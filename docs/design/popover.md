# Popover design

## Scope and anatomy

Popover shows consumer-supplied content in a non-modal surface anchored to a consumer-supplied
trigger. It has a trigger and a panel, with an optional close IconButton. Consumers provide the appropriate
content semantics and accessible name. Icons in examples follow ADR 0005 and use individual icon
definitions with the existing Icon renderer.

## Visual design

- Provide one neutral surface, sized to its content and constrained to the available viewport or
  safe area. Placement and alignment are configurable and adapt to collisions.
- Use theme surface, text, strong border, radius, spacing and shadow tokens in light and dark
  themes. Expose web panel styling hooks and native style overrides.
- Trigger appearance belongs to the consumer. Focus indicators belong to the interactive elements;
  no decorative animation is included.

  ## Approved revision

  - Examples and demos use the stable IconButton with an individual information icon; other
    consumer triggers remain supported. Native composition must not nest interactive buttons.
  - `closable=false` adds an optional neutral ghost IconButton with a Lucide X. `closeLabel`
    defaults to `Close` and is localizable. `close-button` proposals are cancelable and follow
    existing ownership and focus-restoration rules.
  - `triggerMode=press` remains the default. `hover` adds pointer and focus opening on web,
    React, Angular and React Native Web, retaining press activation. Android/iOS use press.
    Hover/focus opening does not move focus into the panel, even with `initialFocus`.
    The panel remains reachable across the gap; a 150ms close delay accommodates movement.
    Hover and focus both keep it open; explicit dismissal suppresses reopening until both leave.
  - `gap=8` is a finite non-negative distance in CSS pixels/native logical units. Zero is
    supported. With an arrow, measure to the tip, otherwise to the panel edge. Collision
    handling takes priority over maintaining the requested distance.
  - `arrow=false` adds an optional decorative triangle, 16 units wide and 8 deep. Follow
    actual placement and the trigger center, with the panel background and border. Hide it
    if it cannot point correctly without crossing corners or viewport/safe-area bounds.
    Native panel style overrides and web panel part styles must also color the arrow.
  - Keep generic content composition; examples demonstrate headings, actions and long content.
    No new title/action layout API, sizes, tones or dependencies are added.

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

Modal behavior, menu and tooltip semantics, animation, named sizes and
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
