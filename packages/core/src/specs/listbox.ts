import { defineContract } from '../contract.js';

export interface ListboxOption<Icon = unknown> {
  value: string;
  label: string;
  description?: string;
  icon?: Icon;
  disabled?: boolean;
}

export interface ListboxGroup<Icon = unknown> {
  label: string;
  options: readonly ListboxOption<Icon>[];
}

export type ListboxItem<Icon = unknown> = ListboxOption<Icon> | ListboxGroup<Icon>;
export type ListboxSelectionMode = 'single' | 'multiple';

export interface ListboxSelectionChangeDetail {
  selectedValues: readonly string[];
  value: string;
  source: 'pointer' | 'keyboard';
}

/** Vertical selection with independent active focus and controlled or autonomous selected values. */
export const listboxContract = defineContract({
  name: 'listbox',
  tag: 'cosm-listbox',
  description:
    'Selects one or more values from a named vertical collection, with groups, descriptions, icons and independent keyboard focus.',
  role: 'listbox',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/',
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Required nonempty accessible label, visible unless labelHidden is true.',
    },
    labelHidden: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Visually hides the label without removing its accessible name.',
    },
    items: {
      type: 'reference',
      reference: 'ListboxItems',
      required: true,
      options: ['flat', 'grouped'],
      example: 'grouped',
      description:
        'Readonly collection of options or named groups. Options have globally unique nonempty value and label strings, optional description, decorative IconDefinition and disabled. Groups have a nonempty label and options array.',
    },
    selectionMode: {
      type: 'enum',
      values: ['single', 'multiple'],
      default: 'single',
      reflect: true,
      description: 'Single permits at most one selected value; multiple toggles each activation.',
    },
    selectedValues: {
      type: 'reference',
      reference: 'ListboxValues',
      options: ['empty', 'apple', 'cherry', 'apple-cherry'],
      description:
        'Controlled selected values, including an empty array. Activation only proposes changes until the owner updates this prop. Missing collection values are retained, not automatically selected or removed.',
    },
    defaultSelectedValues: {
      type: 'reference',
      reference: 'ListboxValues',
      options: ['empty', 'apple', 'cherry', 'apple-cherry'],
      example: 'empty',
      description:
        'Initial autonomous selected values (empty by default). Later changes do not reset selection.',
    },
    variant: {
      type: 'enum',
      values: ['plain', 'outlined'],
      default: 'plain',
      reflect: true,
      description: 'Plain composes inside a panel; outlined adds a standalone container boundary.',
    },
    size: {
      type: 'union',
      variants: [{ type: 'enum', values: ['sm', 'md', 'lg'] }, { type: 'number' }],
      default: 'md',
      reflect: true,
      description:
        'Semantic size or a positive finite minimum option height in CSS pixels/native logical units. Content may grow; native touch targets remain at least 44.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Prevents interaction and removes the list from keyboard navigation.',
    },
    readOnly: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Allows exploring options without proposing or committing selection changes.',
    },
    locale: {
      type: 'string',
      description:
        'BCP 47 locale for typeahead. Web inherits the nearest language; native uses the runtime locale when omitted. Invalid locale identifiers are rejected.',
    },
  },
  events: {
    selectionChange: {
      description:
        'Proposes the next selectedValues for an enabled activation. Autonomous selection commits; controlled selection waits for the owner. Arrows and typeahead never select.',
      detail: 'ListboxSelectionChangeDetail',
      names: {
        dom: 'cosm-selection-change',
        react: 'onSelectionChange',
        angular: 'selectionChange',
        native: 'onSelectionChange',
      },
    },
  },
  states: [
    {
      prop: 'selectedValues',
      event: 'selectionChange',
      defaultProp: 'defaultSelectedValues',
    },
  ],
  slots: {},
  parts: {
    base: 'Outer container.',
    label: 'Visible or visually hidden accessible label.',
    list: 'Scrollable listbox.',
    group: 'Named option group.',
    'group-label': 'Noninteractive group heading.',
    option: 'Selectable row; selected, disabled and active states are exposed on the row.',
    icon: 'Decorative option icon.',
    content: 'Text content wrapper.',
    'option-label': 'Primary option text.',
    description: 'Optional supporting text.',
    indicator: 'Decorative selected-state indicator.',
  },
  cssProperties: {
    '--cosm-listbox-background': 'Container background.',
    '--cosm-listbox-color': 'Primary foreground.',
    '--cosm-listbox-border': 'Outlined container border color.',
    '--cosm-listbox-radius': 'Container and option corner radius.',
    '--cosm-listbox-option-height': 'Minimum option height.',
    '--cosm-listbox-option-padding': 'Option padding.',
    '--cosm-listbox-gap': 'Space between icon, content and selection indicator.',
    '--cosm-listbox-font-size': 'Primary option text size.',
    '--cosm-listbox-description-color': 'Supporting text color.',
    '--cosm-listbox-selected-background': 'Selected option background.',
    '--cosm-listbox-selected-color': 'Selected option foreground.',
    '--cosm-listbox-focus': 'Visible keyboard focus outline color.',
    '--cosm-listbox-max-height': 'Maximum scrollable list height.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Enters or leaves the list as one Tab stop.' },
    {
      keys: ['ArrowDown', 'ArrowUp', 'Home', 'End'],
      action: 'Moves focus among enabled options without changing selection; stops at the ends.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Selects the focused option; multiple mode toggles it. Read-only never changes selection.',
    },
    {
      keys: ['Printable characters'],
      action: 'Moves focus to a matching option using locale-aware typeahead without filtering.',
    },
  ],
});
