import { defineContract } from '../contract.js';
import type { ListboxItem } from './listbox.js';

export type SelectValue = string | null;
export type SelectItems = readonly ListboxItem[];
export type SelectReferences = {
  ListboxItems: SelectItems;
  SelectValue: SelectValue;
};

export interface SelectChangeDetail {
  value: SelectValue;
}

/**
 * Selects one value from a labeled, grouped collection using a select-only combobox and a
 * form-associated custom popup on the Web.
 */
export const selectContract = defineContract({
  name: 'select',
  tag: 'cosm-select',
  description:
    'Selects one option from an accessible collection, with grouped items and native Web form behavior.',
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
      reference: 'ListboxItems',
      required: true,
      options: ['flat', 'grouped'],
      example: 'grouped',
      description:
        'Readonly options or named groups. Each option has a unique nonempty value and label, and may include a description, decorative IconDefinition, or disabled state.',
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
    clearable: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Shows a separate clear action when a value is selected.',
    },
    clearLabel: {
      type: 'string',
      description:
        'Consumer-localized accessible name for the clear action; required when clearable.',
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
        'Proposes a selected or cleared value after user activation; autonomous state commits and controlled state waits for the owner.',
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
    'clear-button': 'Optional accessible action that clears the selection.',
    popup: 'Anchored popup surface.',
    listbox: 'Single-selection option collection.',
    group: 'Named option group.',
    'group-label': 'Noninteractive group heading.',
    option: 'Selectable row with selected, active, and disabled states.',
    icon: 'Decorative leading option icon.',
    content: 'Option text wrapper.',
    'option-label': 'Primary option text.',
    description: 'Optional supporting option text.',
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
    '--cosm-select-option-selected-background': 'Selected option background.',
    '--cosm-select-option-selected-color': 'Selected option text color.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Moves focus to or from the enabled combobox trigger.' },
    {
      keys: ['Enter', 'Space', 'ArrowDown', 'ArrowUp'],
      action: 'Opens the popup; arrows move the active option without changing the selection.',
    },
    {
      keys: ['ArrowDown', 'ArrowUp', 'Home', 'End'],
      action: 'Moves active focus among enabled options without changing the selected value.',
    },
    {
      keys: ['Printable characters'],
      action:
        'Moves active focus to a matching option using locale-aware typeahead without filtering.',
    },
    { keys: ['Enter', 'Space'], action: 'Selects the active enabled option.' },
    { keys: ['Escape'], action: 'Closes the popup without changing the selected value.' },
  ],
});
