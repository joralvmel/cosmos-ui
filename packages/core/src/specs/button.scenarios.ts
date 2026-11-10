import type { Platform } from '../contract.js';
import type { PressSource } from './button.js';

/**
 * Shared behavior scenarios for the button. Every platform runs them through a driver, so web
 * and native implementations are verified against the same expectations.
 */
export type ButtonAction =
  | { type: 'press'; source: Exclude<PressSource, 'programmatic'> }
  | { type: 'key'; key: 'Enter' | ' ' };

export interface ButtonScenario {
  name: string;
  props: { disabled?: boolean; loading?: boolean };
  actions: readonly ButtonAction[];
  expected: { presses: number; sources?: readonly PressSource[]; busy: boolean; disabled: boolean };
  /** Platforms that support the actions (keyboard scenarios do not apply to touch-only native). */
  platforms?: readonly Platform[];
}

export const buttonScenarios: readonly ButtonScenario[] = [
  {
    name: 'reports a pointer press',
    props: {},
    actions: [{ type: 'press', source: 'pointer' }],
    expected: { presses: 1, sources: ['pointer'], busy: false, disabled: false },
  },
  {
    name: 'reports one press per activation',
    props: {},
    actions: [
      { type: 'press', source: 'pointer' },
      { type: 'press', source: 'pointer' },
    ],
    expected: { presses: 2, busy: false, disabled: false },
  },
  {
    name: 'ignores presses while disabled',
    props: { disabled: true },
    actions: [{ type: 'press', source: 'pointer' }],
    expected: { presses: 0, busy: false, disabled: true },
  },
  {
    name: 'ignores presses while loading and exposes busy state',
    props: { loading: true },
    actions: [{ type: 'press', source: 'pointer' }],
    expected: { presses: 0, busy: true, disabled: false },
  },
  {
    name: 'activates with Enter',
    props: {},
    actions: [{ type: 'key', key: 'Enter' }],
    expected: { presses: 1, sources: ['keyboard'], busy: false, disabled: false },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'activates with Space',
    props: {},
    actions: [{ type: 'key', key: ' ' }],
    expected: { presses: 1, sources: ['keyboard'], busy: false, disabled: false },
    platforms: ['web', 'react', 'angular'],
  },
];

export const scenariosFor = (platform: Platform) =>
  buttonScenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));
