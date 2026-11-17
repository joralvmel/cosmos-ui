import type { ContractProps, Platform } from '../contract.js';
import type { PopoverCloseReason, popoverContract } from './popover.js';

/**
 * Drivers install cancellation before the action, using the original event on web/wrappers
 * or detail.preventDefault() on native. They record proposals even when canceled.
 * A sync simulates the owner setting open; it never emits a proposal.
 */
export type PopoverAction =
  | { type: 'trigger'; source: 'pointer' | 'touch' | 'keyboard'; cancel?: boolean }
  | { type: 'escape'; handled?: boolean; cancel?: boolean }
  | { type: 'outside'; focusable: boolean; cancel?: boolean }
  | { type: 'action' | 'back'; cancel?: boolean }
  | { type: 'sync'; open: boolean }
  | { type: 'set-default'; defaultOpen: boolean }
  | { type: 'focus'; target: 'trigger' | 'panel' | 'outside' };

/** Serializable projection of a proposal; cancellation functions are not snapshot data. */
export type PopoverChangeExpectation =
  | { open: true; reason: 'trigger'; canceled: false }
  | { open: false; reason: PopoverCloseReason; canceled: boolean };

export interface PopoverScenario {
  name: string;
  props: ContractProps<typeof popoverContract, 'web'>;
  /** Focus starts on the trigger. By default the panel contains a focusable child. */
  fixture?: { panelHasFocusableContent?: boolean; triggerFocusable?: boolean };
  actions: readonly PopoverAction[];
  expected: {
    open: boolean;
    /** Committed visibility after every action, including syncs and ignored actions. */
    openAfterEachAction: readonly boolean[];
    changes: readonly PopoverChangeExpectation[];
    /**
     * Unmanaged means hiding focused content leaves fallback to the platform: assert
     * no component restoration, not that focus remains in hidden/unmounted content.
     */
    focus: 'trigger' | 'panel-first' | 'panel' | 'outside' | 'unmanaged';
    /** Outside targets receive every press, even when closed, controlled or canceled. */
    outsidePresses: number;
  };
  platforms?: readonly Platform[];
}

const opening = { open: true, reason: 'trigger', canceled: false } as const;
const closing = (reason: PopoverCloseReason, canceled = false): PopoverChangeExpectation => ({
  open: false,
  reason,
  canceled,
});

/**
 * Shared normative cases, not a platform implementation. Drivers use a first focusable
 * panel child unless the fixture opts out. "panel" includes the panel or a descendant;
 * "panel-first" specifically asserts the initial-focus target. For outside presses on
 * a nonfocusable target, the fixture preserves focus so lack of restoration is observable.
 * Native Escape cases exercise React Native Web; hardware Escape is not supported on Android
 * or iOS. Back cases are native Android cases; native drivers must run them in Android mode.
 */
export const popoverScenarios: readonly PopoverScenario[] = [
  {
    name: 'closed by default without a proposal',
    props: {},
    actions: [],
    expected: {
      open: false,
      openAfterEachAction: [],
      changes: [],
      focus: 'trigger',
      outsidePresses: 0,
    },
  },
  ...(['pointer', 'touch', 'keyboard'] as const).map(
    (source): PopoverScenario => ({
      name: `${source} trigger toggles autonomous state once per activation`,
      props: {},
      actions: [
        { type: 'trigger', source },
        { type: 'trigger', source },
      ],
      expected: {
        open: false,
        openAfterEachAction: [true, false],
        changes: [opening, closing('trigger')],
        focus: 'trigger',
        outsidePresses: 0,
      },
      ...(source === 'keyboard' ? { platforms: ['web', 'react', 'angular'] as const } : {}),
    })
  ),
  {
    name: 'defaultOpen initializes autonomous state but later defaults do not reset it',
    props: { defaultOpen: true },
    actions: [{ type: 'set-default', defaultOpen: false }],
    expected: {
      open: true,
      openAfterEachAction: [true],
      changes: [],
      focus: 'trigger',
      outsidePresses: 0,
    },
  },
  {
    name: 'controlled false overrides defaultOpen and refuses repeated open proposals',
    props: { open: false, defaultOpen: true, initialFocus: true },
    actions: [
      { type: 'trigger', source: 'pointer' },
      { type: 'trigger', source: 'pointer' },
    ],
    expected: {
      open: false,
      openAfterEachAction: [false, false],
      changes: [opening, opening],
      focus: 'trigger',
      outsidePresses: 0,
    },
  },
  {
    name: 'controlled acceptance waits for sync and prop updates emit no proposals',
    props: { open: false, initialFocus: true },
    actions: [
      { type: 'trigger', source: 'pointer' },
      { type: 'sync', open: true },
      { type: 'action' },
      { type: 'sync', open: false },
    ],
    expected: {
      open: false,
      openAfterEachAction: [false, true, true, false],
      changes: [opening, closing('action')],
      focus: 'trigger',
      outsidePresses: 0,
    },
  },
  {
    name: 'unsolicited controlled opening applies without a proposal',
    props: { open: false, initialFocus: true },
    actions: [{ type: 'sync', open: true }],
    expected: {
      open: true,
      openAfterEachAction: [true],
      changes: [],
      focus: 'panel-first',
      outsidePresses: 0,
    },
  },
  {
    name: 'controlled close proposals leave the panel and its focus unchanged',
    props: { open: true, initialFocus: true },
    actions: [{ type: 'action' }, { type: 'escape' }],
    expected: {
      open: true,
      openAfterEachAction: [true, true],
      changes: [closing('action'), closing('escape')],
      focus: 'panel-first',
      outsidePresses: 0,
    },
  },
  ...(['trigger', 'escape', 'outside', 'action', 'back'] as const).flatMap(
    (reason): PopoverScenario[] =>
      [false, true].map(canceled => ({
        name: `${reason} close ${canceled ? 'can be canceled' : 'commits autonomously'}`,
        props: { defaultOpen: true, initialFocus: true },
        actions:
          reason === 'trigger'
            ? [
                { type: 'focus', target: 'trigger' },
                { type: 'trigger', source: 'pointer', cancel: canceled },
              ]
            : [
                reason === 'outside'
                  ? { type: 'outside', focusable: true, cancel: canceled }
                  : { type: reason, cancel: canceled },
              ],
        expected: {
          open: canceled,
          openAfterEachAction: reason === 'trigger' ? [true, canceled] : [canceled],
          changes: [closing(reason, canceled)],
          focus:
            reason === 'outside'
              ? 'outside'
              : reason !== 'trigger' && canceled
                ? 'panel-first'
                : 'trigger',
          outsidePresses: reason === 'outside' ? 1 : 0,
        },
        ...(reason === 'back' ? { platforms: ['native'] as const } : {}),
      }))
  ),
  {
    name: 'controlled action cancellation is visible to the owner without committing',
    props: { open: true, initialFocus: true },
    actions: [{ type: 'action', cancel: true }],
    expected: {
      open: true,
      openAfterEachAction: [true],
      changes: [closing('action', true)],
      focus: 'panel-first',
      outsidePresses: 0,
    },
  },
  {
    name: 'disabled dismissal policies do not suppress explicit panel actions',
    props: { defaultOpen: true, closeOnEscape: false, closeOnOutsidePress: false },
    actions: [{ type: 'escape' }, { type: 'outside', focusable: true }, { type: 'action' }],
    expected: {
      open: false,
      openAfterEachAction: [true, true, false],
      changes: [closing('action')],
      focus: 'outside',
      outsidePresses: 1,
    },
  },
  {
    name: 'disabling Escape still permits outside dismissal',
    props: { defaultOpen: true, closeOnEscape: false },
    actions: [{ type: 'escape' }, { type: 'outside', focusable: true }],
    expected: {
      open: false,
      openAfterEachAction: [true, false],
      changes: [closing('outside')],
      focus: 'outside',
      outsidePresses: 1,
    },
  },
  {
    name: 'disabling outside dismissal still permits Escape',
    props: { defaultOpen: true, closeOnOutsidePress: false },
    actions: [{ type: 'outside', focusable: true }, { type: 'escape' }],
    expected: {
      open: false,
      openAfterEachAction: [true, false],
      changes: [closing('escape')],
      focus: 'outside',
      outsidePresses: 1,
    },
  },
  {
    name: 'Android Back is independent of Escape and outside dismissal policies',
    props: { defaultOpen: true, closeOnEscape: false, closeOnOutsidePress: false },
    actions: [{ type: 'back' }],
    expected: {
      open: false,
      openAfterEachAction: [false],
      changes: [closing('back')],
      focus: 'trigger',
      outsidePresses: 0,
    },
    platforms: ['native'],
  },
  {
    name: 'a child-handled Escape is ignored',
    props: { defaultOpen: true },
    actions: [{ type: 'escape', handled: true }],
    expected: {
      open: true,
      openAfterEachAction: [true],
      changes: [],
      focus: 'trigger',
      outsidePresses: 0,
    },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'dismissals and action requests while closed emit nothing',
    props: {},
    actions: [{ type: 'escape' }, { type: 'action' }, { type: 'outside', focusable: true }],
    expected: {
      open: false,
      openAfterEachAction: [false, false, false],
      changes: [],
      focus: 'outside',
      outsidePresses: 1,
    },
  },
  {
    name: 'initial focus falls back to the panel without focusable descendants',
    props: { initialFocus: true },
    fixture: { panelHasFocusableContent: false },
    actions: [{ type: 'trigger', source: 'pointer' }],
    expected: {
      open: true,
      openAfterEachAction: [true],
      changes: [opening],
      focus: 'panel',
      outsidePresses: 0,
    },
  },
  {
    name: 'outside closure never restores even if its target cannot take focus',
    props: { defaultOpen: true, initialFocus: true },
    actions: [{ type: 'outside', focusable: false }],
    expected: {
      open: false,
      openAfterEachAction: [false],
      changes: [closing('outside')],
      focus: 'unmanaged',
      outsidePresses: 1,
    },
  },
  {
    name: 'an outside controlled proposal still delivers the outside interaction',
    props: { open: true, initialFocus: true },
    actions: [{ type: 'outside', focusable: true }],
    expected: {
      open: true,
      openAfterEachAction: [true],
      changes: [closing('outside')],
      focus: 'outside',
      outsidePresses: 1,
    },
  },
  {
    name: 'restoration can be disabled',
    props: { defaultOpen: true, initialFocus: true, restoreFocus: false },
    actions: [{ type: 'action' }],
    expected: {
      open: false,
      openAfterEachAction: [false],
      changes: [closing('action')],
      focus: 'unmanaged',
      outsidePresses: 0,
    },
  },
  {
    name: 'restoration does not steal focus moved outside before owner acceptance',
    props: { open: true, initialFocus: true },
    actions: [
      { type: 'escape' },
      { type: 'focus', target: 'outside' },
      { type: 'sync', open: false },
    ],
    expected: {
      open: false,
      openAfterEachAction: [true, true, false],
      changes: [closing('escape')],
      focus: 'outside',
      outsidePresses: 0,
    },
  },
  {
    name: 'an unsolicited controlled close does not restore focus',
    props: { open: true, initialFocus: true },
    actions: [{ type: 'sync', open: false }],
    expected: {
      open: false,
      openAfterEachAction: [false],
      changes: [],
      focus: 'unmanaged',
      outsidePresses: 0,
    },
  },
  {
    name: 'the latest close reason supersedes an earlier controlled proposal',
    props: { open: true, initialFocus: true },
    actions: [
      { type: 'escape' },
      { type: 'outside', focusable: false },
      { type: 'sync', open: false },
    ],
    expected: {
      open: false,
      openAfterEachAction: [true, true, false],
      changes: [closing('escape'), closing('outside')],
      focus: 'unmanaged',
      outsidePresses: 1,
    },
  },
  {
    name: 'a canceled proposal clears any earlier restoration intent',
    props: { open: true, initialFocus: true },
    actions: [{ type: 'escape' }, { type: 'action', cancel: true }, { type: 'sync', open: false }],
    expected: {
      open: false,
      openAfterEachAction: [true, true, false],
      changes: [closing('escape'), closing('action', true)],
      focus: 'unmanaged',
      outsidePresses: 0,
    },
  },
  {
    name: 'restoration requires a usable trigger',
    props: { defaultOpen: true, initialFocus: true },
    fixture: { triggerFocusable: false },
    actions: [{ type: 'action' }],
    expected: {
      open: false,
      openAfterEachAction: [false],
      changes: [closing('action')],
      focus: 'unmanaged',
      outsidePresses: 0,
    },
  },
  {
    name: 'focus leaving the panel alone does not dismiss',
    props: { defaultOpen: true },
    actions: [{ type: 'focus', target: 'outside' }],
    expected: {
      open: true,
      openAfterEachAction: [true],
      changes: [],
      focus: 'outside',
      outsidePresses: 0,
    },
  },
];

export const popoverScenariosFor = (platform: Platform) =>
  popoverScenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));
