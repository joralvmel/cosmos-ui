import { defineContract } from '../contract.js';

/** A proposed checked value after user activation. */
export interface CheckboxCheckedChangeDetail {
  checked: boolean;
}

/**
 * An independent boolean form choice with controlled or autonomous checked state.
 *
 * | State | Autonomous | Controlled | Event |
 * | --- | --- | --- | --- |
 * | checked | Starts at defaultChecked and commits activation | A supplied checked, including false, waits for the owner | checkedChange |
 * | indeterminate | Presentation only; autonomous activation clears it | Remains as supplied until the owner changes it | None |
 */
export const checkboxContract = defineContract({
  name: 'checkbox',
  tag: 'cosm-checkbox',
  description:
    'Selects an independent boolean value with accessible labeling and native form behavior on the web.',
  role: 'checkbox',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/',
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Required accessible name, visible unless hideLabel is true.',
    },
    hideLabel: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Visually hides the label while keeping it available to assistive technology.',
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
    indeterminate: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Presentation-only mixed state. Autonomous activation clears it; controlled use leaves it to the owner.',
    },
    size: {
      type: 'union',
      variants: [{ type: 'enum', values: ['sm', 'md', 'lg'] }, { type: 'number' }],
      default: 'md',
      reflect: true,
      description:
        'Semantic visual-box size or positive finite number in CSS pixels on web and logical units on native.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Prevents user interaction and excludes the value from web form submission.',
    },
    required: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Exposes required semantics and participates in native web form validation. Native has no automatic validation.',
    },
    invalid: {
      type: 'boolean',
      default: false,
      reflect: true,
      description:
        'Externally supplied invalid presentation state; web form validity remains based on required.',
    },
    helpText: {
      type: 'string',
      description: 'Optional consumer-localized supporting text associated with the checkbox.',
    },
    errorText: {
      type: 'string',
      description:
        'Optional consumer-localized error description; a nonempty value also exposes invalid state.',
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
      detail: 'CheckboxCheckedChangeDetail',
      names: {
        dom: 'cosm-checked-change',
        react: 'onCheckedChange',
        angular: 'checkedChange',
        native: 'onCheckedChange',
      },
    },
  },
  states: [{ prop: 'checked', event: 'checkedChange', defaultProp: 'defaultChecked' }],
  slots: {
    '': 'Optional noninteractive inline label content; links and buttons are not allowed.',
  },
  parts: {
    base: 'The label and visual checkbox control.',
    input: 'The native checkbox input and web focus target.',
    box: 'The visible checkbox box and indicator.',
    label: 'Visible or visually hidden label text.',
    'help-text': 'Supporting text associated with the checkbox.',
    'error-text': 'Error description associated with the checkbox.',
  },
  cssProperties: {
    '--cosm-checkbox-size': 'Visual box width and height.',
    '--cosm-checkbox-background': 'Unchecked box background.',
    '--cosm-checkbox-checked-background': 'Checked and mixed box background.',
    '--cosm-checkbox-color': 'Checked indicator foreground.',
    '--cosm-checkbox-border': 'Box boundary color.',
    '--cosm-checkbox-radius': 'Box corner radius.',
    '--cosm-checkbox-focus': 'Visible keyboard focus indicator color.',
    '--cosm-checkbox-gap': 'Space between the box and label.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Moves focus to or from the enabled checkbox.' },
    { keys: ['Space'], action: 'Toggles checked state and emits a checkedChange proposal.' },
  ],
});
