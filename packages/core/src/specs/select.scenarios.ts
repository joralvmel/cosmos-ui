import type { Platform } from '../contract.js';
import type { ListboxItem } from './listbox.js';
import type { SelectValue } from './select.js';

export type SelectAction =
  | { type: 'select'; value: string }
  | { type: 'clear' }
  | { type: 'set-value'; value: SelectValue };

export interface SelectScenario {
  name: string;
  props: {
    label?: string;
    items?: readonly ListboxItem<never>[];
    value?: SelectValue;
    defaultValue?: SelectValue;
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    helpText?: string;
    errorText?: string;
    clearable?: boolean;
    clearLabel?: string;
    name?: string;
  };
  actions: readonly SelectAction[];
  expected: {
    value: SelectValue;
    changes: readonly SelectValue[];
  };
  platforms?: readonly Platform[];
}

export const selectScenarioItems: readonly ListboxItem<never>[] = [
  { value: 'apple', label: 'Apple', description: 'Fresh fruit.' },
  {
    label: 'Citrus',
    options: [
      { value: 'cherry', label: 'Cherry' },
      { value: 'lime', label: 'Lime', disabled: true },
    ],
  },
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
    name: 'clears an autonomous selection',
    props: { ...baseProps, defaultValue: 'apple', clearable: true, clearLabel: 'Clear fruit' },
    actions: [{ type: 'clear' }],
    expected: { value: null, changes: [null] },
  },
  {
    name: 'controlled clear waits for the owner',
    props: {
      ...baseProps,
      value: 'apple',
      clearable: true,
      clearLabel: 'Clear fruit',
    },
    actions: [{ type: 'clear' }],
    expected: { value: 'apple', changes: [null] },
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
