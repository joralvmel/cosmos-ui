import { defineContract } from '../contract.js';

/** Cause of a close request, not notification that the panel has closed. */
export type PopoverCloseReason =
  | 'trigger'
  | 'escape'
  | 'outside'
  | 'action'
  | 'back'
  | 'close-button'
  | 'hover'
  | 'focus';

/**
 * An opening proposal cannot be vetoed. Closing proposals can be vetoed synchronously.
 * On web, detail.preventDefault() and the original CustomEvent.preventDefault() share
 * cancellation state; React/Angular receive that original event. Native receives this detail.
 * Returning false or canceling after dispatch has completed has no effect.
 */
export type PopoverOpenChangeDetail =
  | { open: true; reason: 'trigger' | 'hover' | 'focus' }
  | {
      open: false;
      reason: PopoverCloseReason;
      readonly defaultPrevented: boolean;
      preventDefault(): void;
    };

/** Requested physical side of the trigger; alignment uses the current writing direction. */
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

/**
 * Imperative action-close surface: the web element, React ref, Angular component instance
 * and native ref expose requestClose(). It proposes reason "action" only while open.
 * It does not force controlled state, bypass cancellation or emit a committed-close event.
 */
export interface PopoverHandle {
  requestClose(): void;
}

/**
 * Generic non-modal anchored content. There is no generic APG Popover pattern; the HTML
 * Popover specification is a reference, not a requirement to use its native auto behavior.
 *
 * | State | Autonomous | Controlled | Event |
 * | --- | --- | --- | --- |
 * | open | Initialized once from defaultOpen; commits uncanceled proposals | Supplied open, including false, stays unchanged until the owner updates it | openChange proposes the next value |
 *
 * | Event | DOM | React | Angular | Native |
 * | --- | --- | --- | --- | --- |
 * | openChange | cosm-open-change | onOpenChange | openChange | onOpenChange |
 *
 * Web events bubble and are composed; only closing proposals are cancelable. Cancellation
 * precedes autonomous commit. Owners must also honor a canceled controlled proposal.
 * Owner prop updates never emit proposals and cannot be vetoed. A refused/canceled close
 * never hides the panel or moves focus. Focus effects wait for an actual state transition.
 * A controlled acceptance may restore focus only for its latest uncanceled close proposal;
 * a later proposal supersedes it. Unsolicited prop closure does not restore focus.
 *
 * Consumers supply one keyboard-operable trigger and the panel content (web named trigger
 * slot/default slot; native trigger content/children). Expose committed expanded state on
 * the trigger (aria-expanded/accessibilityState.expanded); preserve its accessible name.
 * Do not add a panel role, aria-modal, aria-haspopup, a focus trap or menu keyboard behavior.
 * Content semantics/naming belong to the consumer. Closed content is hidden from focus and
 * accessibility. Enter/Space use the trigger's ordinary activation, never duplicate it.
 *
 * Escape already handled by a child does not dismiss. Outside means a press outside both
 * trigger and panel, including their descendants; never consume that target's interaction,
 * even when closure is canceled. Focus leaving by Tab alone does not close the panel.
 * Escape is supported on web and React Native Web, not by native Android or iOS hardware
 * keyboards. Android Back requests reason "back" while open, consumes that Back even if vetoed, and
 * does not navigate behind the panel. A canceled predictive Back gesture does not request
 * closure. Back has no effect on other platforms. Guaranteed nested-overlay ordering is
 * excluded.
 *
 * requestClose() is an imperative method, not a prop/event; see PopoverHandle.
 * Hover mode adds pointer/focus opening on web (including React Native Web), never removes
 * press activation, never steals focus on hover/focus opening, and keeps content reachable
 * across the gap. Leaving both trigger and panel requests closure after 150ms unless focus
 * remains inside. Escape/close-button dismissal suppresses reopening until pointer and focus
 * leave. Android/iOS use press activation. No tooltip semantics are inferred.
 * The optional close control uses IconButton and an individual Lucide X (ADR 0005).
 * Arrow follows the actual side and trigger center, hiding when corners or collisions prevent
 * a correct pointer. Gap measures free space to its tip (or panel edge without an arrow).
 * No animation, named sizes or tones are added.
 */
export const popoverContract = defineContract({
  name: 'popover',
  tag: 'cosm-popover',
  description:
    'Non-modal content anchored to a consumer trigger, with cancelable close requests and no imposed panel semantics.',
  role: '',
  pattern: 'https://html.spec.whatwg.org/multipage/popover.html',
  props: {
    open: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Committed visibility. Supplying this prop, including false, controls state; its metadata default does not establish a binding.',
    },
    defaultOpen: {
      type: 'boolean',
      default: false,
      description:
        'Initial autonomous visibility only; ignored when open is supplied. Later updates do not reset state.',
    },
    triggerMode: {
      type: 'enum',
      values: ['press', 'hover'],
      default: 'press',
      description:
        'Hover adds pointer and keyboard-focus opening on web and React Native Web, while keeping press activation. Android/iOS use press. Does not change panel semantics.',
    },
    closable: {
      type: 'boolean',
      default: false,
      description:
        'Shows a built-in IconButton with an X. Requests a cancelable close with reason close-button.',
    },
    closeLabel: {
      type: 'string',
      default: 'Close',
      description:
        'Localized accessible name of the close button. Must be non-empty when closable is true.',
    },
    gap: {
      type: 'number',
      default: 8,
      description:
        'Non-negative finite distance from trigger to panel, or to the arrow tip. CSS pixels on web, logical units on native. Viewport/safe-area collision handling takes priority.',
    },
    arrow: {
      type: 'boolean',
      default: false,
      description:
        'Shows a decorative triangular pointer (16 wide, 8 deep), following the actual side, panel background and border. Hidden if it cannot point to the trigger without crossing a corner or viewport edge.',
    },
    closeOnEscape: {
      type: 'boolean',
      default: true,
      description:
        'Requests closure on unhandled Escape on web and React Native Web. Native Android and iOS hardware Escape is not supported.',
    },
    closeOnOutsidePress: {
      type: 'boolean',
      default: true,
      description:
        'Requests closure on an outside press without preventing its interaction or restoring trigger focus.',
    },
    initialFocus: {
      type: 'boolean',
      default: false,
      description:
        'On committed opening (including initially open), focus the first focusable panel descendant, falling back to the panel without adding semantics. False leaves focus unchanged. Native moves accessible/input focus where supported.',
    },
    restoreFocus: {
      type: 'boolean',
      default: true,
      description:
        'After committed trigger, Escape, action or Back closure, restore focus only if still inside the panel and the trigger is connected and focusable. Never steal outside focus, restore after outside press, or restore for unsolicited prop closure.',
    },
    side: {
      type: 'enum',
      values: ['top', 'right', 'bottom', 'left'],
      default: 'bottom',
      reflect: true,
      description:
        'Requested physical side; actual placement may flip. Recompute for trigger/panel size, viewport/safe-area, scrolling and orientation changes.',
    },
    align: {
      type: 'enum',
      values: ['start', 'center', 'end'],
      default: 'center',
      reflect: true,
      description:
        'Cross-axis alignment. On top/bottom, start/end follow inline direction (RTL reverses them); on left/right they mean top/bottom.',
    },
    flip: {
      type: 'boolean',
      default: true,
      description:
        'Try the opposite side when the requested side overflows the available viewport/safe area; flip only if it reduces main-axis overflow. Ties keep the requested side. Runs before shift.',
    },
    shift: {
      type: 'boolean',
      default: true,
      description:
        'After flip, translate within available viewport/safe-area bounds to reduce overflow. Constrain oversized panels to that region regardless of collision flags; flags never change requested props.',
    },
  },
  events: {
    openChange: {
      description:
        'Proposes visibility changes by trigger, hover or focus, or closure by Escape, outside press, panel action, close button or Android Back. Closing only is cancelable, synchronously via the web event or detail.preventDefault(); native uses detail.preventDefault(). Not a committed-state notification.',
      detail: 'PopoverOpenChangeDetail',
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
    trigger:
      'Consumer-supplied accessible trigger; its appearance and label belong to the consumer. Native accepts content or a render function receiving onPress, ref and accessibilityState for composing an IconButton without nested buttons.',
    '': 'Consumer-supplied panel content and semantics. Native maps this content to children.',
  },
  parts: {
    trigger: 'Trigger container.',
    panel: 'Non-modal anchored surface.',
    body: 'Scrollable consumer content.',
    close: 'Optional close IconButton.',
    arrow: 'Decorative pointer; follows panel colors.',
  },
  cssProperties: {
    '--cosm-popover-z-index': 'Panel stacking level.',
    '--cosm-popover-padding': 'Panel padding.',
    '--cosm-popover-radius': 'Panel corner radius.',
    '--cosm-popover-shadow': 'Panel shadow.',
  },
  keyboard: [
    { keys: ['Enter', 'Space'], action: 'The focused trigger activates once and toggles open.' },
    {
      keys: ['Escape'],
      action:
        'On web and React Native Web, requests close when open and closeOnEscape is true, unless a child already handled the key.',
    },
    {
      keys: ['Tab', 'Shift+Tab'],
      action: 'Moves focus normally without a focus trap or automatic dismissal.',
    },
    { keys: ['Android Back'], action: 'Requests close while open on Android only.' },
  ],
});
