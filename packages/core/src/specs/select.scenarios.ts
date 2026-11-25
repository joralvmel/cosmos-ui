import type { Platform } from '../contract.js';
import type { SelectItems, SelectValue } from './select.js';

export type SelectAction =
  | { type: 'select'; value: string }
  | { type: 'set-value'; value: SelectValue };

export interface SelectScenario {
  name: string;
  props: {
    label?: string;
    items?: SelectItems;
    value?: SelectValue;
    defaultValue?: SelectValue;
    placeholder?: string;
    variant?: 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    helpText?: string;
    errorText?: string;
    name?: string;
  };
  actions: readonly SelectAction[];
  expected: {
    value: SelectValue;
    changes: readonly SelectValue[];
  };
  platforms?: readonly Platform[];
}

export const selectScenarioItems: SelectItems = [
  { value: 'apple', label: 'Apple' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'lime', label: 'Lime', disabled: true },
];

const baseProps = {
  label: 'Fruit',
  items: selectScenarioItems,
  placeholder: 'Choose a fruit',
};

export const selectScenarios: readonly SelectScenario[] = [
  {
    name: 'starts without a selection',
    props: baseProps,
    actions: [],
    expected: { value: null, changes: [] },
  },
  {
    name: 'supports the filled variant',
    props: { ...baseProps, variant: 'filled' },
    actions: [],
    expected: { value: null, changes: [] },
  },
  {
    name: 'initializes autonomous selection from defaultValue',
    props: { ...baseProps, defaultValue: 'apple' },
    actions: [],
    expected: { value: 'apple', changes: [] },
  },
  {
    name: 'commits autonomous selection and emits its proposal',
    props: baseProps,
    actions: [{ type: 'select', value: 'cherry' }],
    expected: { value: 'cherry', changes: ['cherry'] },
  },
  {
    name: 'controlled selection waits for the owner',
    props: { ...baseProps, value: 'apple' },
    actions: [{ type: 'select', value: 'cherry' }],
    expected: { value: 'apple', changes: ['cherry'] },
  },
  {
    name: 'controlled null remains unselected until the owner accepts',
    props: { ...baseProps, value: null },
    actions: [{ type: 'select', value: 'apple' }],
    expected: { value: null, changes: ['apple'] },
  },
  {
    name: 'controlled selection commits after the owner updates',
    props: { ...baseProps, value: 'apple' },
    actions: [
      { type: 'select', value: 'cherry' },
      { type: 'set-value', value: 'cherry' },
    ],
    expected: { value: 'cherry', changes: ['cherry'] },
  },
  {
    name: 'does not emit when the selected option is activated',
    props: { ...baseProps, defaultValue: 'apple' },
    actions: [{ type: 'select', value: 'apple' }],
    expected: { value: 'apple', changes: [] },
  },
  {
    name: 'does not select a disabled option',
    props: baseProps,
    actions: [{ type: 'select', value: 'lime' }],
    expected: { value: null, changes: [] },
  },
  {
    name: 'does not select an option when the control is disabled',
    props: { ...baseProps, disabled: true },
    actions: [{ type: 'select', value: 'apple' }],
    expected: { value: null, changes: [] },
  },
];

export const selectScenariosFor = (platform: Platform) =>
  selectScenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));
