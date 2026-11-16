import type { Platform } from '../contract.js';

export type TextFieldAction =
  | { type: 'edit'; value: string; selectionStart?: number; composing?: boolean }
  | { type: 'sync'; value: string }
  | { type: 'clear' }
  | { type: 'reveal' }
  | { type: 'hide' }
  | { type: 'submit'; value?: string }
  | { type: 'reset' };

export interface TextFieldScenario {
  name: string;
  props: {
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    passwordReveal?: boolean;
    type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  };
  actions: readonly TextFieldAction[];
  expected: {
    value: string;
    changes: readonly string[];
    disabled: boolean;
    submits?: readonly string[];
    focused?: boolean;
    selectionStart?: number;
    compositionPreserved?: boolean;
    passwordVisible?: boolean;
  };
  platforms?: readonly Platform[];
}

/** Shared state and interaction expectations for all text-field platform drivers. */
export const textFieldScenarios: readonly TextFieldScenario[] = [
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
    name: 'a refused controlled edit restores the value and preserves selection and composition',
    props: { value: 'stable' },
    actions: [{ type: 'edit', value: 'stablex', selectionStart: 6, composing: true }],
    expected: {
      value: 'stable',
      changes: ['stablex'],
      disabled: false,
      selectionStart: 6,
      compositionPreserved: true,
    },
  },
  {
    name: 'an empty controlled value remains controlled',
    props: { value: '' },
    actions: [{ type: 'edit', value: 'draft' }],
    expected: { value: '', changes: ['draft'], disabled: false },
  },
  {
    name: 'clear proposes an empty value and retains focus',
    props: { defaultValue: 'draft', clearable: true },
    actions: [{ type: 'clear' }],
    expected: { value: '', changes: [''], disabled: false, focused: true },
  },
  {
    name: 'a refused controlled clear restores its value and retains focus',
    props: { value: 'draft', clearable: true },
    actions: [{ type: 'clear' }],
    expected: { value: 'draft', changes: [''], disabled: false, focused: true },
  },
  {
    name: 'disabled fields ignore edits and clear requests',
    props: { value: 'draft', disabled: true, clearable: true },
    actions: [{ type: 'edit', value: 'changed' }, { type: 'clear' }],
    expected: { value: 'draft', changes: [], disabled: true },
  },
  {
    name: 'read-only fields ignore edits and clear requests',
    props: { value: 'draft', readOnly: true, clearable: true },
    actions: [{ type: 'edit', value: 'changed' }, { type: 'clear' }],
    expected: { value: 'draft', changes: [], disabled: false },
  },
  {
    name: 'password reveal toggles presentation without changing the value',
    props: { value: 'secret', type: 'password', passwordReveal: true },
    actions: [{ type: 'reveal' }, { type: 'hide' }],
    expected: { value: 'secret', changes: [], disabled: false, passwordVisible: false },
  },
  {
    name: 'submit reports the current value without proposing an edit',
    props: { value: 'ready' },
    actions: [{ type: 'submit' }],
    expected: { value: 'ready', changes: [], disabled: false, submits: ['ready'] },
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

export const textFieldScenariosFor = (platform: Platform) =>
  textFieldScenarios.filter(
    scenario => !scenario.platforms || scenario.platforms.includes(platform)
  );
