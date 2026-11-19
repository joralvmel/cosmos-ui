import { defineContract } from '../contract.js';

/** Value proposed when the user edits the textarea. */
export interface TextareaChangeDetail {
  value: string;
}

/**
 * Labeled, multiline plain-text input with native form semantics on the web.
 * The editable value follows the controlled/autonomous ownership rules in ADR 0003.
 */
export const textareaContract = defineContract({
  name: 'textarea',
  tag: 'cosm-textarea',
  description:
    'Accepts multiline plain text with an accessible label, optional help and error text, and native form behavior on the web.',
  role: 'textbox',
  pattern: 'https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element',
  props: {
    label: {
      type: 'string',
      required: true,
      description:
        'Accessible name for the editable control. It is rendered above the control unless visually hidden.',
    },
    labelHidden: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Visually hides the label while keeping it available to assistive technology.',
    },
    value: {
      type: 'string',
      description:
        'Current text. When bound, edits are proposals and the component waits for the owner to supply the accepted value.',
    },
    defaultValue: {
      type: 'string',
      default: '',
      description:
        'Initial value for autonomous use. Web form reset restores this value; it does not control subsequent edits.',
    },
    rows: {
      type: 'number',
      default: 4,
      reflect: true,
      description:
        'Visible line count of the multiline editor. It is independent of the visual size.',
    },
    variant: {
      type: 'enum',
      values: ['outlined', 'filled'],
      default: 'outlined',
      reflect: true,
      description: 'Visual treatment of the editable control.',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      reflect: true,
      description: 'Visual size of the editable control, independent of rows.',
    },
    placeholder: {
      type: 'string',
      description: 'Short input hint; it never replaces the accessible label.',
    },
    helpText: {
      type: 'string',
      description: 'Optional supporting text associated with the editable control.',
    },
    error: {
      type: 'string',
      description: 'Optional externally supplied error text associated with the editable control.',
    },
    invalid: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'External invalid state, independent of browser constraints or consumer business validation.',
    },
    required: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Exposes required semantics. On web, participates in native HTML constraint validation.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Disables editing and interaction. On web, follows disabled fieldsets and excludes the value from form submission.',
    },
    readOnly: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Prevents editing while remaining focusable and form-submittable on web; distinct from disabled.',
    },
    maxLength: {
      type: 'number',
      description:
        'Maximum number of characters. Web uses native HTML length constraints and native applies supported input limits.',
    },
    name: {
      type: 'string',
      reflect: true,
      platforms: ['web', 'react', 'angular'],
      description:
        'Form field name on web. React Native has no HTML form association or name-based submission.',
    },
  },
  events: {
    change: {
      description:
        'Proposes the current text after each user edit; this is not a blur/commit event.',
      detail: 'TextareaChangeDetail',
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
    label: 'Accessible label above the control.',
    control: 'Visual control containing the editable textarea.',
    textarea: 'The native multiline editable textarea.',
    help: 'Supporting text associated with the editable textarea.',
    error: 'External or native-constraint error text associated with the editable textarea.',
  },
  cssProperties: {
    '--cosm-textarea-background': 'Editable control background.',
    '--cosm-textarea-color': 'Editable text color.',
    '--cosm-textarea-placeholder': 'Placeholder text color.',
    '--cosm-textarea-border': 'Editable control boundary color.',
    '--cosm-textarea-focus': 'Visible focus indicator color.',
    '--cosm-textarea-radius': 'Editable control corner radius.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Moves focus to or from the enabled editable control.' },
    { keys: ['Enter'], action: 'Inserts a newline in the editable text.' },
  ],
});
