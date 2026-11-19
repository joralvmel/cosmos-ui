import type { Platform } from '../contract.js';

export type TextareaAction =
  | { type: 'edit'; value: string }
  | { type: 'sync'; value: string }
  | { type: 'reset' };

export interface TextareaScenario {
  name: string;
  props: {
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    readOnly?: boolean;
  };
  actions: readonly TextareaAction[];
  expected: {
    value: string;
    changes: readonly string[];
    disabled: boolean;
  };
  platforms?: readonly Platform[];
}

/** Shared state and interaction expectations for all textarea platform drivers. */
export const textareaScenarios: readonly TextareaScenario[] = [
  {
    name: 'autonomous edits update the owned value and propose each edit',
    props: { defaultValue: 'draft' },
    actions: [{ type: 'edit', value: 'drafted' }],
    expected: { value: 'drafted', changes: ['drafted'], disabled: false },
  },
  {
    name: 'controlled edits wait for the owner to accept the proposal',
    props: { value: 'before' },
    actions: [
      { type: 'edit', value: 'after' },
      { type: 'sync', value: 'after' },
    ],
    expected: { value: 'after', changes: ['after'], disabled: false },
  },
  {
    name: 'an ignored controlled edit restores the owner value',
    props: { value: 'stable' },
    actions: [{ type: 'edit', value: 'unaccepted' }],
    expected: { value: 'stable', changes: ['unaccepted'], disabled: false },
  },
  {
    name: 'an empty controlled value remains controlled',
    props: { value: '' },
    actions: [{ type: 'edit', value: 'draft' }],
    expected: { value: '', changes: ['draft'], disabled: false },
  },
  {
    name: 'disabled textareas ignore edits',
    props: { value: 'draft', disabled: true },
    actions: [{ type: 'edit', value: 'changed' }],
    expected: { value: 'draft', changes: [], disabled: true },
  },
  {
    name: 'read-only textareas ignore edits',
    props: { value: 'draft', readOnly: true },
    actions: [{ type: 'edit', value: 'changed' }],
    expected: { value: 'draft', changes: [], disabled: false },
  },
  {
    name: 'Enter edits preserve embedded newlines',
    props: { defaultValue: 'first' },
    actions: [{ type: 'edit', value: 'first\nsecond' }],
    expected: { value: 'first\nsecond', changes: ['first\nsecond'], disabled: false },
  },
  {
    name: 'autonomous web form reset restores the default value',
    props: { defaultValue: 'initial' },
    actions: [{ type: 'edit', value: 'changed' }, { type: 'reset' }],
    expected: { value: 'initial', changes: ['changed'], disabled: false },
    platforms: ['web', 'react', 'angular'],
  },
  {
    name: 'controlled web form reset proposes the default value',
    props: { value: 'current', defaultValue: 'initial' },
    actions: [{ type: 'reset' }],
    expected: { value: 'current', changes: ['initial'], disabled: false },
    platforms: ['web', 'react', 'angular'],
  },
];

export const textareaScenariosFor = (platform: Platform) =>
  textareaScenarios.filter(
    scenario => !scenario.platforms || scenario.platforms.includes(platform)
  );
