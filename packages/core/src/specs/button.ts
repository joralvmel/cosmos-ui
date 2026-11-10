import { defineContract } from '../contract.js';

/** How a press was triggered. */
export type PressSource = 'pointer' | 'keyboard' | 'programmatic';

export interface ButtonPressDetail {
  source: PressSource;
}

/**
 * Button: triggers an action. Follows the WAI-ARIA APG button pattern; on the web it renders a
 * native `<button>` so form submission and keyboard activation come from the platform.
 */
export const buttonContract = defineContract({
  name: 'button',
  tag: 'cosm-button',
  description: 'Triggers an action or submits a form.',
  role: 'button',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  props: {
    variant: {
      type: 'enum',
      values: ['solid', 'soft', 'outline', 'ghost'],
      default: 'solid',
      reflect: true,
      description: 'Visual emphasis, from highest (solid) to lowest (ghost).',
    },
    tone: {
      type: 'enum',
      values: ['primary', 'neutral', 'danger'],
      default: 'primary',
      reflect: true,
      description: 'Color role. Use danger for destructive actions.',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      reflect: true,
      description: 'Control height and padding.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Prevents interaction and removes the button from the tab order.',
    },
    loading: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Shows a spinner, sets aria-busy and ignores presses while keeping focus.',
    },
    fullWidth: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Stretches the button to the width of its container.',
    },
    type: {
      type: 'enum',
      values: ['button', 'submit', 'reset'],
      default: 'button',
      platforms: ['web', 'react', 'angular'],
      description: 'Form behavior of the button.',
    },
    label: {
      type: 'string',
      description:
        'Accessible name when the visible content is not descriptive (icon-only buttons).',
    },
  },
  events: {
    press: {
      description: 'The button was activated by pointer, keyboard or programmatically.',
      detail: 'ButtonPressDetail',
      names: { dom: 'cosm-press', react: 'onPress', angular: 'press', native: 'onPress' },
    },
  },
  states: [],
  slots: {
    '': 'Button label.',
    start: 'Content before the label, usually an icon.',
    end: 'Content after the label, usually an icon.',
  },
  parts: {
    base: 'The native button element.',
    label: 'Wrapper of the label slot.',
    spinner: 'Loading indicator.',
  },
  cssProperties: {
    '--cosm-button-radius': 'Corner radius.',
    '--cosm-button-gap': 'Space between icon and label.',
    '--cosm-button-font-weight': 'Label font weight.',
  },
  keyboard: [{ keys: ['Enter', 'Space'], action: 'Activates the button.' }],
});
