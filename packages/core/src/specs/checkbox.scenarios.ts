import type { Platform } from '../contract.js';

export type CheckboxAction = { type: 'activate' } | { type: 'sync'; checked: boolean };

export interface CheckboxScenario {
  name: string;
  props: {
    label: string;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
  };
  actions: readonly CheckboxAction[];
  expected: {
    checked: boolean;
    changes: readonly boolean[];
    indeterminate?: boolean;
  };
  platforms?: readonly Platform[];
}

const fixture = { label: 'Accept terms' };

/** Normative checked-state cases shared by platform drivers. */
export const checkboxScenarios: readonly CheckboxScenario[] = [
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
    name: 'controlled state follows the value accepted by the owner',
    props: { ...fixture, checked: false },
    actions: [{ type: 'activate' }, { type: 'sync', checked: true }, { type: 'activate' }],
    expected: { checked: true, changes: [true, false] },
  },
  {
    name: 'autonomous activation clears mixed presentation',
    props: { ...fixture, indeterminate: true },
    actions: [{ type: 'activate' }],
    expected: { checked: true, changes: [true], indeterminate: false },
  },
  {
    name: 'controlled activation leaves mixed presentation to the owner',
    props: { ...fixture, checked: false, indeterminate: true },
    actions: [{ type: 'activate' }],
    expected: { checked: false, changes: [true], indeterminate: true },
  },
];

export const checkboxScenariosFor = (platform: Platform) =>
  checkboxScenarios.filter(
    scenario => !scenario.platforms || scenario.platforms.includes(platform)
  );
