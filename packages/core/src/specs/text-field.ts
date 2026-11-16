import { defineContract } from '../contract.js';

/** Value proposed when the user edits or clears a text field. */
export interface TextFieldChangeDetail {
  value: string;
}

/** Current value when the user invokes the field's submit action. */
export interface TextFieldSubmitDetail {
  value: string;
}

/**
 * Single-line text entry with an accessible label and native form semantics on the web.
 * The editable value follows the controlled/autonomous ownership rules in ADR 0003.
 */
export const textFieldContract = defineContract({
  name: 'text-field',
  tag: 'cosm-text-field',
  description:
    'Accepts a single line of text with an accessible label, optional help and error text, and native form validation on the web.',
  role: 'textbox',
  pattern: 'https://html.spec.whatwg.org/multipage/input.html',
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
    type: {
      type: 'enum',
      values: ['text', 'email', 'password', 'tel', 'url', 'search'],
      default: 'text',
      reflect: true,
      description:
        'Single-line input type. Native maps it to supported keyboard, autofill and secure-entry behavior.',
    },
    variant: {
      type: 'enum',
      values: ['outlined', 'filled'],
      default: 'outlined',
      reflect: true,
      description: 'Visual treatment of the editable control.',
    },
    size: {
      type: 'union',
      variants: [{ type: 'enum', values: ['sm', 'md', 'lg'] }, { type: 'number' }],
      default: 'md',
      reflect: true,
      description:
        'Semantic size or a positive finite minimum editable-control height in CSS pixels on web and logical units on native.',
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
    minLength: {
      type: 'number',
      description:
        'Minimum number of characters. Web uses native HTML validity; native business validation remains the consumer’s responsibility.',
    },
    maxLength: {
      type: 'number',
      description:
        'Maximum number of characters. Web uses native HTML validity and native applies supported input limits.',
    },
    pattern: {
      type: 'string',
      platforms: ['web', 'react', 'angular'],
      description:
        'Web-only HTML pattern constraint. Native does not emulate HTML regular-expression validation.',
    },
    name: {
      type: 'string',
      reflect: true,
      platforms: ['web', 'react', 'angular'],
      description:
        'Form field name on web. React Native has no HTML form association or name-based submission.',
    },
    autoComplete: {
      type: 'string',
      description:
        'Consumer-provided completion/autofill hint, mapped to attributes supported by each platform.',
    },
    inputMode: {
      type: 'union',
      variants: [
        {
          type: 'enum',
          values: ['none', 'text', 'decimal', 'numeric', 'tel', 'search', 'email', 'url'],
        },
      ],
      description:
        'Input or keyboard hint (none, text, decimal, numeric, tel, search, email or url); it does not add numeric or multiline field behavior.',
    },
    startIcon: {
      type: 'reference',
      reference: 'IconDefinition',
      options: ['search', 'house', 'heart', 'star'],
      example: 'search',
      description: 'Optional structured decorative icon before the editable text.',
    },
    endIcon: {
      type: 'reference',
      reference: 'IconDefinition',
      options: ['search', 'house', 'heart', 'star'],
      example: 'search',
      description: 'Optional structured decorative icon after the editable text.',
    },
    prefix: {
      type: 'string',
      description: 'Optional non-interactive text decoration before the editable text.',
    },
    suffix: {
      type: 'string',
      description: 'Optional non-interactive text decoration after the editable text.',
    },
    clearable: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Shows a clear action for non-empty editable fields. Supply clearLabel when enabled.',
    },
    clearLabel: {
      type: 'string',
      description: 'Consumer-supplied localized accessible name for the clear action.',
    },
    passwordReveal: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Opts into a reveal action for password fields. Supply both revealPasswordLabel and hidePasswordLabel when enabled.',
    },
    revealPasswordLabel: {
      type: 'string',
      description: 'Consumer-supplied localized accessible name while the password is concealed.',
    },
    hidePasswordLabel: {
      type: 'string',
      description: 'Consumer-supplied localized accessible name while the password is revealed.',
    },
  },
  events: {
    change: {
      description:
        'Proposes the current text after each user edit, including clear; this is not a blur/commit event.',
      detail: 'TextFieldChangeDetail',
      names: {
        dom: 'cosm-change',
        react: 'onChange',
        angular: 'valueChange',
        native: 'onValueChange',
      },
    },
    submit: {
      description:
        'Reports the current text when the user invokes the field submit action (Enter/return).',
      detail: 'TextFieldSubmitDetail',
      names: {
        dom: 'cosm-submit',
        react: 'onSubmit',
        angular: 'submit',
        native: 'onSubmitEditing',
      },
    },
  },
  states: [{ prop: 'value', event: 'change', defaultProp: 'defaultValue' }],
  slots: {},
  parts: {
    label: 'Accessible label above the control.',
    control: 'Visual control containing the editable input and decorations.',
    input: 'The single-line editable input.',
    start: 'Start icon or prefix decoration.',
    end: 'End icon, suffix decoration or clear/reveal action.',
    help: 'Supporting text associated with the editable input.',
    error: 'External or native-validity error text associated with the editable input.',
    'clear-button': 'Optional accessible clear action.',
    'reveal-button': 'Optional accessible password visibility action.',
  },
  cssProperties: {
    '--cosm-text-field-background': 'Editable control background.',
    '--cosm-text-field-color': 'Editable and decoration text color.',
    '--cosm-text-field-placeholder': 'Placeholder text color.',
    '--cosm-text-field-border': 'Editable control boundary color.',
    '--cosm-text-field-focus': 'Visible focus indicator color.',
    '--cosm-text-field-radius': 'Editable control corner radius.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Moves focus to or from the enabled editable control.' },
    { keys: ['Enter'], action: 'Invokes the submit action; web form behavior remains native.' },
  ],
});
