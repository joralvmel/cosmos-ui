import { defineContract } from '../contract.js';

/** Source of a request to close the modal. */
export type DialogCloseReason = 'close-button' | 'escape' | 'back' | 'backdrop' | 'action';

/** Opening is not cancelable. Closing can be vetoed synchronously. */
export type DialogOpenChangeDetail =
  | { open: true; reason: 'action' }
  | {
      open: false;
      reason: DialogCloseReason;
      readonly defaultPrevented: boolean;
      preventDefault(): void;
    };

/** Platform adapters supply their own focus-target type, never a DOM type in core. */
export type DialogReferences<T> = { DialogFocusTarget: T };

/** Named standard maximum widths, in CSS pixels or native logical points. */
export type DialogSize = 'sm' | 'md' | 'lg';

/** Imperative proposals; neither method forces controlled state. */
export interface DialogHandle {
  requestOpen(): void;
  requestClose(): void;
}

/**
 * Modal dialog. A bound open prop (including false) controls visibility; otherwise defaultOpen
 * initializes autonomous state once. Open-change events are proposals, not notifications of
 * committed changes. Closing is synchronously cancelable using the event or detail on web and
 * detail on native; a canceled request leaves the modal and focus intact.
 *
 * A committed opening moves focus inside; a committed close restores it to returnFocusTarget,
 * the invoking control, or an available logical fallback. initialFocusTarget, if supplied and
 * usable, takes precedence over the first focusable content. Targets are platform-specific.
 * The title provides the accessible name; an optional short description describes the modal.
 * Escape is web-only, Android Back is native-only, and backdrop dismissal defaults to off.
 * Guaranteed nested-modal coordination and iOS swipe dismissal are excluded.
 *
 * Standard sizes cap width at sm=400, md=640, lg=960. An explicitly supplied positive finite
 * maxWidth overrides size; absence uses the named size. fullWidth fills available width up to
 * that maximum. Responsive fullscreen activates below 640 viewport CSS pixels/native logical
 * points; explicit fullscreen always wins. Effective fullscreen never moves.
 *
 * When movable, non-interactive header space supports pointer/touch dragging; a localized
 * movement button reveals directional and center controls as an equivalent non-drag alternative.
 * The controls start collapsed and close when movement becomes unavailable or the dialog closes.
 * On each axis the
 * reachable offsets are multiples of 16 CSS pixels/native logical points from center plus the
 * exact minimum and maximum bounded offsets. Drag previews may move freely but release snaps
 * each axis to the nearest reachable offset; equidistant ties choose the lower offset. Direction
 * buttons move to the next reachable offset in the physical direction, including boundaries.
 * Center selects zero clamped to bounds. Recompute bounds and re-snap when the viewport, safe
 * area or surface changes. Clamp the whole surface to the available viewport or native safe area.
 * Canceling an active drag restores its start position;
 * pressing Escape during a web drag aborts it without closing. Reopening, entering fullscreen or
 * disabling movement resets position to center. Moving never changes modal ownership or focus.
 */
export const dialogContract = defineContract({
  name: 'dialog',
  tag: 'cosm-dialog',
  description: 'Modal content with a title, actions and cancelable close requests.',
  role: 'dialog',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
  props: {
    open: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Committed visibility; supplying this prop, including false, controls state.',
    },
    defaultOpen: {
      type: 'boolean',
      default: false,
      description: 'Initial autonomous visibility; subsequent changes do not reset state.',
    },
    presentation: {
      type: 'enum',
      values: ['standard', 'fullscreen'],
      default: 'standard',
      reflect: true,
      description: 'Centered standard surface or fullscreen surface.',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      reflect: true,
      description: 'Maximum standard width: sm 400, md 640, lg 960 pixels or logical points.',
    },
    maxWidth: {
      type: 'number',
      description:
        'Optional positive finite numeric maximum, overriding size in CSS pixels or native logical points; ignored in fullscreen.',
    },
    fullWidth: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Fill available standard width up to the effective maximum.',
    },
    responsiveFullscreen: {
      type: 'boolean',
      default: false,
      description:
        'Use fullscreen when available viewport width is below 640 pixels or logical points.',
    },
    movable: {
      type: 'boolean',
      default: false,
      description:
        'Enable header dragging and an expandable movement control in standard presentation only.',
    },
    moveControlsLabel: {
      type: 'string',
      default: 'Move dialog',
      description: 'Localized accessible name of the movement button and control group.',
    },
    moveUpLabel: {
      type: 'string',
      default: 'Move up',
      description: 'Localized name for moving upward.',
    },
    moveDownLabel: {
      type: 'string',
      default: 'Move down',
      description: 'Localized name for moving downward.',
    },
    moveLeftLabel: {
      type: 'string',
      default: 'Move left',
      description: 'Localized name for moving left.',
    },
    moveRightLabel: {
      type: 'string',
      default: 'Move right',
      description: 'Localized name for moving right.',
    },
    moveCenterLabel: {
      type: 'string',
      default: 'Center dialog',
      description: 'Localized name for centering the dialog.',
    },
    closeLabel: {
      type: 'string',
      default: 'Close',
      description: 'Non-empty localized accessible name of the built-in close button.',
    },
    closeOnEscape: {
      type: 'boolean',
      default: true,
      platforms: ['web', 'react', 'angular'],
      description: 'Request closure on unhandled Escape on web.',
    },
    closeOnAndroidBack: {
      type: 'boolean',
      default: true,
      platforms: ['native'],
      description: 'Request closure on Android Back; consume Back even if the request is canceled.',
    },
    closeOnBackdropPress: {
      type: 'boolean',
      default: false,
      description: 'Request closure when the backdrop itself is pressed.',
    },
    initialFocusTarget: {
      type: 'reference',
      reference: 'DialogFocusTarget',
      description:
        'Optional platform focus target used on committed opening; it must be inside the dialog.',
    },
    returnFocusTarget: {
      type: 'reference',
      reference: 'DialogFocusTarget',
      description: 'Optional platform focus target used after committed closure.',
    },
  },
  events: {
    openChange: {
      description: 'Proposes opening or closing; only closing is synchronously cancelable.',
      detail: 'DialogOpenChangeDetail',
      cancelable: true,
      names: {
        dom: 'cosm-open-change',
        react: 'onOpenChange',
        angular: 'openChange',
        native: 'onOpenChange',
      },
    },
  },
  states: [{ prop: 'open', event: 'openChange', defaultProp: 'defaultOpen' }],
  slots: {
    title: 'Required accessible title content.',
    description: 'Optional short accessible description.',
    '': 'Scrollable body content.',
    actions: 'Consumer-supplied actions.',
  },
  parts: {
    backdrop: 'Modal backdrop.',
    base: 'Dialog surface.',
    header: 'Title and close control area.',
    title: 'Title container.',
    description: 'Description container.',
    body: 'Scrollable body.',
    actions: 'Actions container.',
    close: 'Close IconButton.',
    'move-trigger': 'Button that reveals or hides the movement controls.',
    'move-controls': 'Movement button group.',
    'move-up': 'Move up button.',
    'move-down': 'Move down button.',
    'move-left': 'Move left button.',
    'move-right': 'Move right button.',
    'move-center': 'Center button.',
  },
  cssProperties: {
    '--cosm-dialog-z-index': 'Modal stacking level.',
    '--cosm-dialog-max-width': 'Standard surface maximum width.',
    '--cosm-dialog-backdrop': 'Backdrop background.',
    '--cosm-dialog-surface': 'Surface background.',
    '--cosm-dialog-border': 'Surface border.',
    '--cosm-dialog-radius': 'Surface radius.',
    '--cosm-dialog-shadow': 'Surface shadow.',
    '--cosm-dialog-padding': 'Section spacing.',
  },
  keyboard: [
    { keys: ['Escape'], action: 'On web request close unless handled by a child or disabled.' },
    { keys: ['Tab', 'Shift+Tab'], action: 'Keep keyboard focus inside the modal.' },
    { keys: ['Enter', 'Space'], action: 'Activate a focused movement button.' },
    { keys: ['Android Back'], action: 'On Android request close unless disabled.' },
  ],
});
