import { defineContract } from '../contract.js';

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export type RadioGroupOptions = readonly RadioGroupOption[];
export type RadioGroupValue = string | null;
export type RadioGroupReferences = {
  RadioGroupOptions: RadioGroupOptions;
  RadioGroupValue: RadioGroupValue;
};

/** A proposed selection; null is used only when restoring a controlled form reset. */
export interface RadioGroupChangeDetail {
  value: RadioGroupValue;
}

/**
 * A single-selection form control with optional selection and native Web form behavior.
 *
 * | State | Autonomous | Controlled | Event |
 * | --- | --- | --- | --- |
 * | value | Starts at defaultValue (null by default) and commits selection | A supplied value, including null, proposes changes without committing | change |
 */
export const radioGroupContract = defineContract({
  name: 'radio-group',
  tag: 'cosm-radio-group',
  description:
    'Selects one option from a labeled collection, with optional selection and native Web form behavior.',
  role: 'radiogroup',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/',
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Required visible accessible name for the group.',
    },
    options: {
      type: 'reference',
      reference: 'RadioGroupOptions',
      required: true,
      options: ['contact-methods'],
      example: 'contact-methods',
      description:
        'Readonly flat options with unique nonempty values and labels, optional descriptions and disabled states.',
    },
    value: {
      type: 'reference',
      reference: 'RadioGroupValue',
      options: ['none', 'email', 'phone'],
      description:
        'Controlled selected value; null means no selection, and a supplied null remains controlled.',
    },
    defaultValue: {
      type: 'reference',
      reference: 'RadioGroupValue',
      options: ['none', 'email', 'phone'],
      description: 'Initial autonomous selection; null by default.',
    },
    orientation: {
      type: 'enum',
      values: ['vertical', 'horizontal'],
      default: 'vertical',
      reflect: true,
      description: 'Vertical list or wrapping horizontal options.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Prevents interaction and excludes the value from Web form submission.',
    },
    required: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Requires a selection in Web form validation; Native exposes descriptive semantics.',
    },
    invalid: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Externally supplied invalid presentation state.',
    },
    helpText: {
      type: 'string',
      description: 'Optional supporting text associated with the group.',
    },
    errorText: {
      type: 'string',
      description:
        'Optional consumer-localized error text; a nonempty value also exposes invalid state.',
    },
    name: {
      type: 'string',
      reflect: true,
      platforms: ['web', 'react', 'angular'],
      description: 'Web form field name; React Native has no HTML form association.',
    },
  },
  events: {
    change: {
      description:
        'Proposes a selection after enabled user activation; autonomous state commits and controlled state waits for the owner.',
      detail: 'RadioGroupChangeDetail',
      names: {
        dom: 'cosm-change',
        react: 'onChange',
        angular: 'valueChange',
        native: 'onValueChange',
      },
    },
  },
  states: [{ prop: 'value', event: 'change', defaultProp: 'defaultValue' }],
  slots: {},
  parts: {
    base: 'Group wrapper and accessible fieldset.',
    label: 'Visible group label.',
    options: 'Option collection.',
    option: 'Selectable option row.',
    input: 'Native radio input and Web focus target.',
    control: 'Visible circular radio boundary.',
    indicator: 'Selected radio dot.',
    'option-label': 'Primary option text.',
    description: 'Optional option description.',
    'help-text': 'Supporting text associated with the group.',
    'error-text': 'Error description associated with the group.',
  },
  cssProperties: {
    '--cosm-radio-group-gap': 'Space between option rows.',
    '--cosm-radio-group-option-gap': 'Space between the radio control and option content.',
    '--cosm-radio-group-control-size': 'Diameter of the visible radio control.',
    '--cosm-radio-group-border': 'Unchecked radio boundary color.',
    '--cosm-radio-group-selected-border': 'Selected radio boundary color.',
    '--cosm-radio-group-indicator': 'Selected radio dot color.',
    '--cosm-radio-group-focus': 'Visible keyboard focus indicator color.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Enters or leaves the group as one tab stop.' },
    { keys: ['Space'], action: 'Selects the focused enabled option.' },
    {
      keys: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'],
      action: 'Moves focus and selection through enabled options with wrapping.',
    },
  ],
});
