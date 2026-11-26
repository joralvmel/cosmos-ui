import type { ContractProps, Platform } from '../contract.js';
import type { DialogCloseReason, DialogReferences, dialogContract } from './dialog.js';

export type DialogAction =
  | { type: 'open' | 'action' | 'close-button' | 'escape' | 'back' | 'backdrop'; cancel?: boolean }
  | { type: 'sync'; open: boolean }
  | { type: 'set-default'; defaultOpen: boolean };

export interface DialogScenario {
  name: string;
  props: ContractProps<typeof dialogContract, 'native', DialogReferences<unknown>> &
    ContractProps<typeof dialogContract, 'web', DialogReferences<unknown>>;
  actions: readonly DialogAction[];
  expected: {
    openAfterEachAction: readonly boolean[];
    changes: readonly { open: boolean; reason: DialogCloseReason; canceled: boolean }[];
  };
  platforms?: readonly Platform[];
}

const close = (reason: DialogCloseReason, canceled = false) => ({ open: false, reason, canceled });
const opening = { open: true, reason: 'action', canceled: false } as const;

/** Platform-independent proposals and state ownership. Focus and modal semantics require platform tests. */
export const dialogScenarios: readonly DialogScenario[] = [
  {
    name: 'closed by default',
    props: {},
    actions: [],
    expected: { openAfterEachAction: [], changes: [] },
  },
  {
    name: 'autonomous open and action close',
    props: {},
    actions: [{ type: 'open' }, { type: 'action' }],
    expected: { openAfterEachAction: [true, false], changes: [opening, close('action')] },
  },
  {
    name: 'default open only initializes once',
    props: { defaultOpen: true },
    actions: [{ type: 'set-default', defaultOpen: false }],
    expected: { openAfterEachAction: [true], changes: [] },
  },
  {
    name: 'controlled false is not overridden by defaultOpen',
    props: { open: false, defaultOpen: true },
    actions: [{ type: 'open' }],
    expected: { openAfterEachAction: [false], changes: [opening] },
  },
  {
    name: 'controlled acceptance requires owner sync',
    props: { open: false },
    actions: [
      { type: 'open' },
      { type: 'sync', open: true },
      { type: 'action' },
      { type: 'sync', open: false },
    ],
    expected: {
      openAfterEachAction: [false, true, true, false],
      changes: [opening, close('action')],
    },
  },
  ...(['close-button', 'action'] as const).flatMap(reason =>
    [false, true].map(
      cancel =>
        ({
          name: `${reason} ${cancel ? 'canceled' : 'committed'}`,
          props: { defaultOpen: true },
          actions: [{ type: reason, cancel }],
          expected: { openAfterEachAction: [cancel], changes: [close(reason, cancel)] },
        }) satisfies DialogScenario
    )
  ),
  {
    name: 'backdrop does not dismiss by default',
    props: { defaultOpen: true },
    actions: [{ type: 'backdrop' }],
    expected: { openAfterEachAction: [true], changes: [] },
  },
  {
    name: 'enabled backdrop requests close',
    props: { defaultOpen: true, closeOnBackdropPress: true },
    actions: [{ type: 'backdrop' }],
    expected: { openAfterEachAction: [false], changes: [close('backdrop')] },
  },
  {
    name: 'Escape requests close',
    props: { defaultOpen: true },
    actions: [{ type: 'escape' }],
    expected: { openAfterEachAction: [false], changes: [close('escape')] },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'disabled Escape does not close',
    props: { defaultOpen: true, closeOnEscape: false },
    actions: [{ type: 'escape' }],
    expected: { openAfterEachAction: [true], changes: [] },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'Android Back requests close',
    props: { defaultOpen: true },
    actions: [{ type: 'back' }],
    expected: { openAfterEachAction: [false], changes: [close('back')] },
    platforms: ['native'],
  },
  {
    name: 'disabled Android Back does not close',
    props: { defaultOpen: true, closeOnAndroidBack: false },
    actions: [{ type: 'back' }],
    expected: { openAfterEachAction: [true], changes: [] },
    platforms: ['native'],
  },
];

export const dialogScenariosFor = (platform: Platform) =>
  dialogScenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));

/** Layout expectations are independent of platform rendering and focus mechanics. */
export interface DialogLayoutScenario {
  name: string;
  props: Pick<
    DialogScenario['props'],
    'size' | 'maxWidth' | 'presentation' | 'fullWidth' | 'responsiveFullscreen' | 'movable'
  >;
  viewportWidth: number;
  expected: { fullscreen: boolean; maxWidth: number | null; fullWidth: boolean; movable: boolean };
}

export const dialogLayoutScenarios: readonly DialogLayoutScenario[] = [
  {
    name: 'default medium',
    props: {},
    viewportWidth: 1200,
    expected: { fullscreen: false, maxWidth: 640, fullWidth: false, movable: false },
  },
  {
    name: 'small maximum',
    props: { size: 'sm' },
    viewportWidth: 1200,
    expected: { fullscreen: false, maxWidth: 400, fullWidth: false, movable: false },
  },
  {
    name: 'large maximum and full width',
    props: { size: 'lg', fullWidth: true },
    viewportWidth: 1200,
    expected: { fullscreen: false, maxWidth: 960, fullWidth: true, movable: false },
  },
  {
    name: 'numeric maximum overrides named size',
    props: { size: 'sm', maxWidth: 720, fullWidth: true },
    viewportWidth: 1200,
    expected: { fullscreen: false, maxWidth: 720, fullWidth: true, movable: false },
  },
  {
    name: 'responsive fullscreen below boundary',
    props: { responsiveFullscreen: true, movable: true },
    viewportWidth: 639,
    expected: { fullscreen: true, maxWidth: null, fullWidth: true, movable: false },
  },
  {
    name: 'responsive boundary remains standard',
    props: { responsiveFullscreen: true, movable: true },
    viewportWidth: 640,
    expected: { fullscreen: false, maxWidth: 640, fullWidth: false, movable: true },
  },
  {
    name: 'explicit fullscreen wins',
    props: { presentation: 'fullscreen', size: 'sm', maxWidth: 300, movable: true },
    viewportWidth: 1200,
    expected: { fullscreen: true, maxWidth: null, fullWidth: true, movable: false },
  },
];

/** Movement offsets are relative to the centered surface and clamped to supplied bounds. */
export interface DialogMovementScenario {
  name: string;
  movable: boolean;
  fullscreen: boolean;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  actions: readonly (
    | { type: 'up' | 'down' | 'left' | 'right' | 'center' }
    | { type: 'drag'; x: number; y: number; cancel?: boolean }
  )[];
  expected: readonly { x: number; y: number }[];
}

export const dialogMovementScenarios: readonly DialogMovementScenario[] = [
  {
    name: 'direction buttons and center',
    movable: true,
    fullscreen: false,
    bounds: { minX: -40, maxX: 40, minY: -30, maxY: 30 },
    actions: [{ type: 'right' }, { type: 'down' }, { type: 'center' }],
    expected: [
      { x: 16, y: 0 },
      { x: 16, y: 16 },
      { x: 0, y: 0 },
    ],
  },
  {
    name: 'drag snap is reproducible with directional buttons',
    movable: true,
    fullscreen: false,
    bounds: { minX: -40, maxX: 40, minY: -30, maxY: 30 },
    actions: [
      { type: 'drag', x: 21, y: 13 },
      { type: 'center' },
      { type: 'right' },
      { type: 'down' },
    ],
    expected: [
      { x: 16, y: 16 },
      { x: 0, y: 0 },
      { x: 16, y: 0 },
      { x: 16, y: 16 },
    ],
  },
  {
    name: 'equidistant snap chooses the lower offset',
    movable: true,
    fullscreen: false,
    bounds: { minX: -40, maxX: 40, minY: -30, maxY: 30 },
    actions: [{ type: 'drag', x: 8, y: -8 }],
    expected: [{ x: 0, y: -16 }],
  },
  {
    name: 'fractional boundaries are reachable in either direction',
    movable: true,
    fullscreen: false,
    bounds: { minX: -40.5, maxX: 35.25, minY: -30.5, maxY: 27.75 },
    actions: [
      { type: 'drag', x: 100, y: -100 },
      { type: 'left' },
      { type: 'right' },
      { type: 'down' },
      { type: 'up' },
    ],
    expected: [
      { x: 35.25, y: -30.5 },
      { x: 32, y: -30.5 },
      { x: 35.25, y: -30.5 },
      { x: 35.25, y: -16 },
      { x: 35.25, y: -30.5 },
    ],
  },
  {
    name: 'small bounds and center remain mutually reachable',
    movable: true,
    fullscreen: false,
    bounds: { minX: -5, maxX: 7, minY: -4, maxY: 6 },
    actions: [{ type: 'right' }, { type: 'left' }, { type: 'left' }, { type: 'right' }],
    expected: [
      { x: 7, y: 0 },
      { x: 0, y: 0 },
      { x: -5, y: 0 },
      { x: 0, y: 0 },
    ],
  },
  {
    name: 'drag clamps to viewport',
    movable: true,
    fullscreen: false,
    bounds: { minX: -40, maxX: 40, minY: -30, maxY: 30 },
    actions: [{ type: 'drag', x: 100, y: -100 }],
    expected: [{ x: 40, y: -30 }],
  },
  {
    name: 'canceled drag restores previous position',
    movable: true,
    fullscreen: false,
    bounds: { minX: -40, maxX: 40, minY: -30, maxY: 30 },
    actions: [{ type: 'right' }, { type: 'drag', x: -20, y: 20, cancel: true }],
    expected: [
      { x: 16, y: 0 },
      { x: 16, y: 0 },
    ],
  },
  {
    name: 'fixed standard does not move',
    movable: false,
    fullscreen: false,
    bounds: { minX: -40, maxX: 40, minY: -30, maxY: 30 },
    actions: [{ type: 'right' }, { type: 'drag', x: 20, y: 20 }],
    expected: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
  },
  {
    name: 'fixed and fullscreen do not move',
    movable: true,
    fullscreen: true,
    bounds: { minX: -40, maxX: 40, minY: -30, maxY: 30 },
    actions: [{ type: 'right' }, { type: 'drag', x: 20, y: 20 }],
    expected: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
  },
];
