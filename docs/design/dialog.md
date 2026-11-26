# Dialog design

## Scope and anatomy

Dialog presents modal content above an inert background. It supports a centered `standard`
presentation and `fullscreen`, with a consumer-supplied title, body and actions, and a built-in
close IconButton. Its localized accessible label names the close action. The button uses an
individual Lucide X definition through the existing Icon renderer, following ADR 0005.

The dialog surface has an accessible title, an optional description for short explanatory text,
a scrollable body and an actions area. The title and actions remain visible while the body scrolls
when the available space permits. Consumer content may contain forms and confirmation actions.

## Visual design

- The standard surface sizes itself to content up to a configurable maximum and available space.
  Semantic maximum widths are `sm` 400, `md` 640 (default), and `lg` 960 CSS pixels or native
  logical points. An explicitly supplied numeric maximum takes precedence. Optional full width
  fills the available width up to that maximum.
- Fullscreen occupies the available viewport or native safe area. An optional responsive mode
  switches to fullscreen below 640 CSS pixels or native logical points; explicit fullscreen
  takes precedence.
- A movable standard dialog can be dragged using its header on web and native, or repositioned
  without dragging using accessible directional controls and a center action. Fixed positioning
  is the default. Constrain movement to the available viewport or safe area. Fullscreen is fixed.
- Use theme surface, text, border, radius, spacing, typography and shadow tokens in light and dark.
  Compose a clean elevated surface with a prominent title, spacious body and grouped end-aligned
  actions. Expose web parts and CSS custom properties, and native style overrides.
- Obscure the background with a backdrop. Keep focus indicators visible, preserve native touch
  targets of at least 44 logical points and respect reduced motion.

### Approved visual refinement

The approved direction is a quiet elevated Cosmos surface with a small theme-colored signature,
not desktop-window chrome.

- Use `surface`, `fg`, a decorative `border`, `radius-lg` and `shadow-lg` consistently on web
  and native. The backdrop uses `overlay`, including its theme-defined alpha, without additional
  opacity. Existing web `--cosm-dialog-*` hooks and parts and native surface `style` remain available.
- The header has a decorative top rule in `primary`, `space-xs` thick (4 px/points), rounded
  with the standard surface. It communicates no status or interaction and follows every theme;
  there are no fixed brand colors, gradients or new public tokens.
- Use `space-xl` (24 px/points) for section horizontal padding and header top/body bottom padding.
  The header ends with `space-sm` (8); the optional description follows immediately and ends with
  `space-sm`. The body starts with `space-lg` (16). Avoid independently padded title and description
  blocks that produce excessive gaps. Web section padding keeps the existing dialog padding hook.
- The default title is `text-xl`, semibold, with tight leading; description text is `text-sm`,
  `fg-muted`, with normal leading. Custom title/description content remains consumer-owned.
- Actions are end-aligned, vertically centered and wrap in reading order, with `space-sm` gaps,
  `space-lg` vertical padding and a decorative top separator in `border`. Consumers supply their
  own action components and responsive grouping; this pass does not prescribe or insert buttons.
  Automatic empty-footer detection on web is deferred rather than adding slot-observation logic.
- Fullscreen removes the external border, radius and elevation while retaining the top accent,
  section rhythm, close control and existing viewport/safe-area handling. Named widths and the
  responsive fullscreen breakpoint are unchanged.
- Hover, active, focus-visible and disabled states remain owned by the embedded IconButton or
  consumer controls. Dialog itself gains no loading or invalid state and no new animation.
  Existing reduced-motion behavior and native touch targets are preserved.

Light and dark modes use their own semantic surface, border, primary and overlay values; dark
surfaces retain a visible structural edge rather than relying on shadow alone. Validate all built-in
themes without lowering thresholds: normal text at least 4.5:1 and interactive boundaries/focus at
least 3:1. The accent and section separators are decorative, not required UI indicators.

The movement trigger reveals directional and center controls, keeping the header compact while
providing equivalent click, tap and keyboard operation without dragging. Controls start collapsed
and close when the dialog closes or movement becomes unavailable.

## Ownership and accessibility

Open state supports autonomous and controlled ownership. User actions propose visibility changes;
close requests may be synchronously canceled. A rejected request leaves the dialog open and does
not restore focus. Close requests from the built-in close control, web Escape and Android Back are
enabled; backdrop presses do not dismiss by default.

The modal has a programmatic accessible name and prevents interaction with background content.
On web, focus enters the dialog, Tab and Shift+Tab remain within it, and closure restores focus
to the invoking control or a logical available fallback. Consumers can specify initial and return
focus targets. Native callers must provide a usable return focus target to guarantee accessibility
focus restoration; React Native does not expose the current invoker for automatic discovery.
Native behavior uses platform accessibility and focus mechanisms rather than assuming DOM
keyboard semantics.

## Deferred and excluded

Non-modal and alert dialogs, guaranteed nested-dialog coordination, iOS swipe dismissal, Escape
on native hardware keyboards, exterior-container scrolling, configurable animation variants and
new dependencies are excluded. Forms and confirmations are composed as content, not special dialog
variants.

## Acceptance scenarios

- Standard, fullscreen and responsive presentations fit narrow and wide layouts, safe areas and
  long content. Named sizes, numeric maximum and full width follow their stated precedence.
- A movable standard dialog stays in bounds, supports pointer and touch dragging, and can be moved
  and centered without dragging. Fixed and fullscreen dialogs do not move.
- The consumer supplies a title, body and actions, customizes the surface, and localizes the close
  label. The close icon remains decorative.
- Autonomous changes commit; controlled changes are proposals until accepted. Canceled requests
  leave the modal and focus intact. Escape, Android Back and close-button requests are distinguishable.
- Opening and closing manage focus correctly; background interaction is blocked while modal.
- Playground and native demo controls exercise presentations, sizes, width, movement, long content,
  ownership and close behavior; examples show a basic dialog, form and confirmation.
- Validate shared scenarios, platform drift, browser and wrapper integration, React Native Web and
  Android runtime separately. Report unavailable checks and do not treat exports or mocks as device
  interaction. iOS and manual screen-reader checks are optional unless explicitly requested.
