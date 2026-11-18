import { defineContract } from '../contract.js';

/** A proposed checked value after the switch is activated. */
export interface SwitchCheckedChangeDetail {
  checked: boolean;
}

/**
 * An immediate binary setting with autonomous or controlled checked state.
 *
 * | State | Autonomous | Controlled | Event |
 * | --- | --- | --- | --- |
 * | checked | Starts at defaultChecked and commits activation | A supplied checked, including false, waits for the owner | checkedChange |
 */
export const switchContract = defineContract({
  name: 'switch',
  tag: 'cosm-switch',
  description:
    'Toggles a binary setting immediately with a stable accessible name and form behavior on the web.',
  role: 'switch',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/',
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Required nonempty accessible name; remains stable in both states.',
    },
    hideLabel: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Visually hides the label while retaining its accessible name.',
    },
    checked: {
      type: 'boolean',
      default: false,
      description:
        'Controlled checked value when supplied, including false; activation proposes changes without self-committing.',
    },
    defaultChecked: {
      type: 'boolean',
      default: false,
      description: 'Initial autonomous checked value; later changes do not reset it.',
    },
    size: {
      type: 'union',
      variants: [{ type: 'enum', values: ['sm', 'md', 'lg'] }, { type: 'number' }],
      default: 'md',
      reflect: true,
      platforms: ['web', 'react', 'angular'],
      description:
        'Web visual size preset or positive finite CSS-pixel size. Native uses system Switch sizing; numeric sizes do not scale it.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Prevents user interaction and excludes the value from web form submission.',
    },
    invalid: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Externally supplied invalid presentation. Does not change checked state or form validity; native uses danger colors without an equivalent system invalid trait.',
    },
    helpText: {
      type: 'string',
      description: 'Optional consumer-localized supporting text associated with the switch.',
    },
    name: {
      type: 'string',
      reflect: true,
      platforms: ['web', 'react', 'angular'],
      description: 'Web form field name; React Native has no HTML form association.',
    },
    value: {
      type: 'string',
      default: 'on',
      platforms: ['web', 'react', 'angular'],
      description:
        'Web form value submitted when checked and enabled; defaults to on. Angular Forms uses checked as its boolean value.',
    },
  },
  events: {
    checkedChange: {
      description:
        'Proposes the next checked value after enabled user activation; controlled state waits for the owner.',
      detail: 'SwitchCheckedChangeDetail',
      names: {
        dom: 'cosm-checked-change',
        react: 'onCheckedChange',
        angular: 'checkedChange',
        native: 'onCheckedChange',
      },
    },
  },
  states: [{ prop: 'checked', event: 'checkedChange', defaultProp: 'defaultChecked' }],
  slots: {},
  parts: {
    base: 'Label, control and supporting text layout.',
    input: 'Native checkbox input and web focus target.',
    track: 'Visible switch track.',
    thumb: 'Visible switch thumb.',
    label: 'Visible or visually hidden label text.',
    'help-text': 'Supporting text associated with the switch.',
  },
  cssProperties: {
    '--cosm-switch-width': 'Track width.',
    '--cosm-switch-height': 'Track height.',
    '--cosm-switch-thumb-size': 'Thumb diameter.',
    '--cosm-switch-track-background': 'Unchecked track background.',
    '--cosm-switch-checked-track-background': 'Checked track background.',
    '--cosm-switch-thumb-background': 'Thumb background.',
    '--cosm-switch-border': 'Unchecked track boundary color.',
    '--cosm-switch-radius': 'Track corner radius.',
    '--cosm-switch-gap': 'Space between the switch and label.',
    '--cosm-switch-focus': 'Visible keyboard focus indicator color.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Moves focus to or from the enabled switch.' },
    { keys: ['Space'], action: 'Toggles checked state and emits a checkedChange proposal.' },
  ],
});
