import { defineContract } from '../contract.js';

export type SelectValue = string | null;
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export type SelectItems = readonly SelectOption[];
export type SelectReferences = {
  SelectItems: SelectItems;
  SelectValue: SelectValue;
};

export interface SelectChangeDetail {
  value: SelectValue;
}

/**
 * Selects one value from a labeled collection using a select-only combobox and a
 * form-associated custom popup on the Web.
 */
export const selectContract = defineContract({
  name: 'select',
  tag: 'cosm-select',
  description: 'Selects one option from an accessible collection, with native Web form behavior.',
  role: 'combobox',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/',
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Required visible accessible name for the control.',
    },
    items: {
      type: 'reference',
      reference: 'SelectItems',
      required: true,
      options: ['flat'],
      example: 'flat',
      description:
        'Readonly flat options with unique nonempty values, nonempty labels, and optional disabled state.',
    },
    value: {
      type: 'reference',
      reference: 'SelectValue',
      options: ['none', 'apple', 'cherry'],
      description:
        'Controlled selected value; null means no selection, and a supplied null remains controlled.',
    },
    defaultValue: {
      type: 'reference',
      reference: 'SelectValue',
      options: ['none', 'apple', 'cherry'],
      example: 'none',
      description: 'Initial autonomous selection; null by default.',
    },
    placeholder: {
      type: 'string',
      required: true,
      description: 'Consumer-localized text shown when no value is selected.',
    },
    variant: {
      type: 'enum',
      values: ['outlined', 'filled'],
      default: 'outlined',
      reflect: true,
      description: 'Outlined or filled trigger appearance.',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      reflect: true,
      description: 'Small, medium, or large control size.',
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
      description: 'Optional supporting text associated with the control.',
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
        'Proposes a selected value after user activation; autonomous state commits and controlled state waits for the owner.',
      detail: 'SelectChangeDetail',
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
    base: 'Field wrapper.',
    label: 'Visible accessible label.',
    trigger: 'Select-only combobox trigger.',
    value: 'Selected option text.',
    placeholder: 'Text displayed when no option is selected.',
    popup: 'Anchored popup surface.',
    listbox: 'Single-selection option collection.',
    option: 'Selectable row with selected, active, and disabled states.',
    content: 'Option text wrapper.',
    'option-label': 'Primary option text.',
    help: 'Supporting text associated with the control.',
    error: 'Error description associated with the control.',
  },
  cssProperties: {
    '--cosm-select-background': 'Control background.',
    '--cosm-select-color': 'Control and value text color.',
    '--cosm-select-placeholder': 'Placeholder text color.',
    '--cosm-select-border': 'Control boundary color.',
    '--cosm-select-focus': 'Visible keyboard focus indicator color.',
    '--cosm-select-radius': 'Control corner radius.',
    '--cosm-select-trigger-min-height': 'Custom minimum trigger height.',
    '--cosm-select-option-selected-background': 'Selected option background.',
    '--cosm-select-option-selected-color': 'Selected option text color.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Moves focus to or from the enabled combobox trigger.' },
    {
      keys: ['Enter', 'Space', 'ArrowDown', 'ArrowUp'],
      action: 'On Web, opens the popup; arrows move the active option without changing selection.',
    },
    {
      keys: ['ArrowDown', 'ArrowUp', 'Home', 'End'],
      action: 'On Web, moves the active option without changing the selected value.',
    },
    {
      keys: ['Printable characters'],
      action:
        'On Web and React Native Web, moves to a matching option using locale-aware typeahead. Native iOS/Android use touch and platform accessibility navigation; React Native core does not expose hardware key events on this control.',
    },
    { keys: ['Enter', 'Space'], action: 'On Web, selects the active enabled option.' },
    { keys: ['Escape'], action: 'On Web, closes the popup without changing the selected value.' },
  ],
});
