import type { ContractProps, Platform } from '../contract.js';
import type { PressSource } from './button.js';
import type { ButtonAction } from './button.scenarios.js';
import type { iconButtonContract } from './icon-button.js';

/** A sync action simulates the owner supplying a new controlled pressed prop. */
export type IconButtonAction = ButtonAction | { type: 'sync'; pressed: boolean };

export interface IconButtonScenario {
  name: string;
  props: ContractProps<typeof iconButtonContract, 'web'>;
  actions: readonly IconButtonAction[];
  expected: {
    disabled: boolean;
    presses: number;
    sources: readonly PressSource[];
    /** Ordered pressed-change detail values. */
    changes: readonly boolean[];
    /** Exposed toggle state; null means action mode has no pressed semantics. */
    pressed: boolean | null;
  };
  platforms?: readonly Platform[];
}

/** Shared state and interaction expectations for platform drivers. */
export const iconButtonScenarios: readonly IconButtonScenario[] = [
  {
    name: 'action activation reports a press without toggle state',
    props: { label: 'Favorite', pressed: true },
    actions: [{ type: 'press', source: 'pointer' }],
    expected: { disabled: false, presses: 1, sources: ['pointer'], changes: [], pressed: null },
  },
  {
    name: 'disabled toggle ignores activation',
    props: { label: 'Favorite', mode: 'toggle', disabled: true, defaultPressed: true },
    actions: [{ type: 'press', source: 'pointer' }],
    expected: { disabled: true, presses: 0, sources: [], changes: [], pressed: true },
  },
  {
    name: 'autonomous toggle commits each activation',
    props: { label: 'Favorite', mode: 'toggle' },
    actions: [
      { type: 'press', source: 'pointer' },
      { type: 'press', source: 'pointer' },
    ],
    expected: {
      disabled: false,
      presses: 2,
      sources: ['pointer', 'pointer'],
      changes: [true, false],
      pressed: false,
    },
  },
  {
    name: 'controlled false stays false when the owner refuses repeated proposals',
    props: { label: 'Favorite', mode: 'toggle', pressed: false, defaultPressed: true },
    actions: [
      { type: 'press', source: 'pointer' },
      { type: 'press', source: 'pointer' },
    ],
    expected: {
      disabled: false,
      presses: 2,
      sources: ['pointer', 'pointer'],
      changes: [true, true],
      pressed: false,
    },
  },
  {
    name: 'controlled toggle uses the value accepted by the owner',
    props: { label: 'Favorite', mode: 'toggle', pressed: false },
    actions: [
      { type: 'press', source: 'pointer' },
      { type: 'sync', pressed: true },
      { type: 'press', source: 'pointer' },
    ],
    expected: {
      disabled: false,
      presses: 2,
      sources: ['pointer', 'pointer'],
      changes: [true, false],
      pressed: true,
    },
  },
  {
    name: 'defaultPressed initializes an autonomous toggle',
    props: { label: 'Favorite', mode: 'toggle', defaultPressed: true },
    actions: [{ type: 'press', source: 'pointer' }],
    expected: {
      disabled: false,
      presses: 1,
      sources: ['pointer'],
      changes: [false],
      pressed: false,
    },
  },
  {
    name: 'Enter activates an action button',
    props: { label: 'Favorite' },
    actions: [{ type: 'key', key: 'Enter' }],
    expected: { disabled: false, presses: 1, sources: ['keyboard'], changes: [], pressed: null },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'Space activates a toggle button',
    props: { label: 'Favorite', mode: 'toggle' },
    actions: [{ type: 'key', key: ' ' }],
    expected: {
      disabled: false,
      presses: 1,
      sources: ['keyboard'],
      changes: [true],
      pressed: true,
    },
    platforms: ['web', 'react', 'angular'],
  },
];

export const iconButtonScenariosFor = (platform: Platform) =>
  iconButtonScenarios.filter(
    scenario => !scenario.platforms || scenario.platforms.includes(platform)
  );
