import type { Platform } from '../contract.js';

export type SwitchAction = { type: 'activate' } | { type: 'sync'; checked: boolean };

export interface SwitchScenario {
  name: string;
  props: {
    label: string;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    invalid?: boolean;
  };
  actions: readonly SwitchAction[];
  expected: {
    checked: boolean;
    changes: readonly boolean[];
  };
  platforms?: readonly Platform[];
}

const fixture = { label: 'Enable notifications' };

/** Normative checked-state cases shared by platform drivers. */
export const switchScenarios: readonly SwitchScenario[] = [
  {
    name: 'starts unchecked without a proposal',
    props: fixture,
    actions: [],
    expected: { checked: false, changes: [] },
  },
  {
    name: 'defaultChecked initializes autonomous state',
    props: { ...fixture, defaultChecked: true },
    actions: [],
    expected: { checked: true, changes: [] },
  },
  {
    name: 'autonomous activation toggles and proposes each next value',
    props: fixture,
    actions: [{ type: 'activate' }, { type: 'activate' }],
    expected: { checked: false, changes: [true, false] },
  },
  {
    name: 'disabled prevents activation and proposals',
    props: { ...fixture, disabled: true, defaultChecked: true },
    actions: [{ type: 'activate' }],
    expected: { checked: true, changes: [] },
  },
  {
    name: 'a controlled false value refuses proposals without self-committing',
    props: { ...fixture, checked: false },
    actions: [{ type: 'activate' }, { type: 'activate' }],
    expected: { checked: false, changes: [true, true] },
  },
  {
    name: 'invalid presentation does not block autonomous activation',
    props: { ...fixture, invalid: true },
    actions: [{ type: 'activate' }],
    expected: { checked: true, changes: [true] },
  },
  {
    name: 'invalid presentation preserves controlled proposal ownership',
    props: { ...fixture, invalid: true, checked: false },
    actions: [{ type: 'activate' }],
    expected: { checked: false, changes: [true] },
  },
  {
    name: 'controlled state follows the value accepted by the owner',
    props: { ...fixture, checked: false },
    actions: [{ type: 'activate' }, { type: 'sync', checked: true }, { type: 'activate' }],
    expected: { checked: true, changes: [true, false] },
  },
];

export const switchScenariosFor = (platform: Platform) =>
  switchScenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));
