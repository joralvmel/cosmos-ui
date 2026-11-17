import type { Platform } from '../contract.js';
import type { ListboxItem } from './listbox.js';

export type ListboxAction =
  | { type: 'activate'; value: string; source: 'pointer' | 'keyboard' }
  | { type: 'sync'; selectedValues: readonly string[] }
  | { type: 'key'; key: string };

export interface ListboxScenario {
  name: string;
  props: {
    label: string;
    items: readonly ListboxItem<never>[];
    selectionMode?: 'single' | 'multiple';
    selectedValues?: readonly string[];
    defaultSelectedValues?: readonly string[];
    disabled?: boolean;
    readOnly?: boolean;
  };
  actions: readonly ListboxAction[];
  expected: {
    selectedValues: readonly string[];
    changes: readonly (readonly string[])[];
    activeValue?: string;
  };
  platforms?: readonly Platform[];
}

export const listboxScenarioItems: readonly ListboxItem<never>[] = [
  {
    label: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'apricot', label: 'Apricot' },
      { value: 'banana', label: 'Banana', disabled: true },
      { value: 'cherry', label: 'Cherry', description: 'Seasonal' },
    ],
  },
];

const fixture = { label: 'Choose fruit', items: listboxScenarioItems };

/** Normative selection cases shared by platform drivers; keyboard cases are browser-only. */
export const listboxScenarios: readonly ListboxScenario[] = [
  {
    name: 'starts empty without a proposal',
    props: fixture,
    actions: [],
    expected: { selectedValues: [], changes: [] },
  },
  {
    name: 'single activation selects without toggling the selected value off',
    props: fixture,
    actions: [
      { type: 'activate', value: 'apple', source: 'pointer' },
      { type: 'activate', value: 'apple', source: 'pointer' },
    ],
    expected: { selectedValues: ['apple'], changes: [['apple']] },
  },
  {
    name: 'multiple selection toggles individual values',
    props: { ...fixture, selectionMode: 'multiple', defaultSelectedValues: ['apple'] },
    actions: [
      { type: 'activate', value: 'cherry', source: 'pointer' },
      { type: 'activate', value: 'apple', source: 'pointer' },
    ],
    expected: { selectedValues: ['cherry'], changes: [['apple', 'cherry'], ['cherry']] },
  },
  ...(['disabled', 'readOnly'] as const).map(
    (state): ListboxScenario => ({
      name: `${state} does not propose selection`,
      props: { ...fixture, [state]: true, defaultSelectedValues: ['apple'] },
      actions: [{ type: 'activate', value: 'cherry', source: 'pointer' }],
      expected: { selectedValues: ['apple'], changes: [] },
    })
  ),
  {
    name: 'disabled options cannot be activated',
    props: fixture,
    actions: [{ type: 'activate', value: 'banana', source: 'pointer' }],
    expected: { selectedValues: [], changes: [] },
  },
  {
    name: 'a controlled empty array refuses proposals without self-committing',
    props: { ...fixture, selectedValues: [] },
    actions: [
      { type: 'activate', value: 'apple', source: 'pointer' },
      { type: 'activate', value: 'apple', source: 'pointer' },
    ],
    expected: { selectedValues: [], changes: [['apple'], ['apple']] },
  },
  {
    name: 'controlled selection uses the value accepted by the owner',
    props: { ...fixture, selectedValues: [] },
    actions: [
      { type: 'activate', value: 'apple', source: 'pointer' },
      { type: 'sync', selectedValues: ['apple'] },
      { type: 'activate', value: 'cherry', source: 'pointer' },
    ],
    expected: { selectedValues: ['apple'], changes: [['apple'], ['cherry']] },
  },
  {
    name: 'arrows skip disabled options without selecting',
    props: fixture,
    actions: [
      { type: 'key', key: 'Home' },
      { type: 'key', key: 'ArrowDown' },
      { type: 'key', key: 'ArrowDown' },
    ],
    expected: { selectedValues: [], changes: [], activeValue: 'cherry' },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'keyboard confirmation selects the focused option',
    props: fixture,
    actions: [
      { type: 'key', key: 'End' },
      { type: 'key', key: 'Enter' },
    ],
    expected: { selectedValues: ['cherry'], changes: [['cherry']], activeValue: 'cherry' },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'typeahead navigates without filtering or selecting',
    props: fixture,
    actions: [{ type: 'key', key: 'c' }],
    expected: { selectedValues: [], changes: [], activeValue: 'cherry' },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'read-only still permits keyboard exploration',
    props: { ...fixture, readOnly: true },
    actions: [
      { type: 'key', key: 'End' },
      { type: 'key', key: ' ' },
    ],
    expected: { selectedValues: [], changes: [], activeValue: 'cherry' },
    platforms: ['web', 'react', 'angular'],
  },
];

export const listboxScenariosFor = (platform: Platform) =>
  listboxScenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));
