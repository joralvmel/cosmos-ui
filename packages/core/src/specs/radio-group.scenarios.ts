import type { Platform } from '../contract.js';
import type { RadioGroupOption, RadioGroupValue } from './radio-group.js';

export type RadioGroupAction =
  | { type: 'select'; value: string }
  | { type: 'set-value'; value: RadioGroupValue };

export interface RadioGroupScenario {
  name: string;
  props: {
    label?: string;
    options?: readonly RadioGroupOption[];
    value?: RadioGroupValue;
    defaultValue?: RadioGroupValue;
    orientation?: 'vertical' | 'horizontal';
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    helpText?: string;
    errorText?: string;
    name?: string;
  };
  actions: readonly RadioGroupAction[];
  expected: {
    value: RadioGroupValue;
    changes: readonly RadioGroupValue[];
  };
  platforms?: readonly Platform[];
}

export const radioGroupScenarioOptions: readonly RadioGroupOption[] = [
  { value: 'email', label: 'Email', description: 'Receive updates by email.' },
  { value: 'phone', label: 'Phone', description: 'Receive updates by text.' },
  { value: 'mail', label: 'Mail', disabled: true },
];

const baseProps = { label: 'Contact method', options: radioGroupScenarioOptions };

export const radioGroupScenarios: readonly RadioGroupScenario[] = [
  {
    name: 'starts without a selection',
    props: baseProps,
    actions: [],
    expected: { value: null, changes: [] },
  },
  {
    name: 'initializes autonomous selection from defaultValue',
    props: { ...baseProps, defaultValue: 'email' },
    actions: [],
    expected: { value: 'email', changes: [] },
  },
  {
    name: 'commits autonomous selection and emits its proposal',
    props: baseProps,
    actions: [{ type: 'select', value: 'phone' }],
    expected: { value: 'phone', changes: ['phone'] },
  },
  {
    name: 'controlled selection waits for the owner',
    props: { ...baseProps, value: 'email' },
    actions: [{ type: 'select', value: 'phone' }],
    expected: { value: 'email', changes: ['phone'] },
  },
  {
    name: 'controlled null remains unselected until the owner accepts',
    props: { ...baseProps, value: null },
    actions: [{ type: 'select', value: 'email' }],
    expected: { value: null, changes: ['email'] },
  },
  {
    name: 'controlled selection commits after the owner updates',
    props: { ...baseProps, value: 'email' },
    actions: [
      { type: 'select', value: 'phone' },
      { type: 'set-value', value: 'phone' },
    ],
    expected: { value: 'phone', changes: ['phone'] },
  },
  {
    name: 'does not emit when the selected option is activated',
    props: { ...baseProps, defaultValue: 'email' },
    actions: [{ type: 'select', value: 'email' }],
    expected: { value: 'email', changes: [] },
  },
  {
    name: 'does not select a disabled option',
    props: baseProps,
    actions: [{ type: 'select', value: 'mail' }],
    expected: { value: null, changes: [] },
  },
  {
    name: 'does not select an option when the group is disabled',
    props: { ...baseProps, disabled: true },
    actions: [{ type: 'select', value: 'email' }],
    expected: { value: null, changes: [] },
  },
];

export const radioGroupScenariosFor = (platform: Platform) =>
  radioGroupScenarios.filter(
    scenario => !scenario.platforms || scenario.platforms.includes(platform)
  );
