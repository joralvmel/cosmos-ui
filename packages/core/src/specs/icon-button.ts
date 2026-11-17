import { defineContract } from '../contract.js';
import type { ButtonPressDetail } from './button.js';

/** Activation source, shared with Button. */
export type IconButtonPressDetail = ButtonPressDetail;

/** The proposed toggle state. */
export interface IconButtonPressedChangeDetail {
  pressed: boolean;
}

/**
 * An icon-only action or toggle with a required accessible name.
 *
 * | State | Autonomous | Controlled | Event |
 * | --- | --- | --- | --- |
 * | pressed | Starts at defaultPressed and commits each toggle | A supplied pressed, including false, stays unchanged until the owner updates it | pressedChange proposes the opposite value |
 *
 * Controlled ownership is determined by whether pressed is supplied, not its default value.
 * Toggle mode exposes the pressed state (aria-pressed on web); action mode does not expose or change it.
 *
 * | Event | DOM | React | Angular | Native |
 * | --- | --- | --- | --- | --- |
 * | press | cosm-press | onPress | press | onPress |
 * | pressedChange | cosm-pressed-change | onPressedChange | pressedChange | onPressedChange |
 * See ADR 0003 and the WAI-ARIA APG button pattern.
 */
export const iconButtonContract = defineContract({
  name: 'icon-button',
  tag: 'cosm-icon-button',
  description: 'Activates an action or toggles a boolean state using a labeled icon.',
  role: 'button',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  props: {
    label: {
      type: 'string',
      required: true,
      description:
        'Required localized accessible name. Missing, empty or whitespace-only labels are rejected.',
    },
    mode: {
      type: 'enum',
      values: ['action', 'toggle'],
      default: 'action',
      reflect: true,
      description:
        'Action activates without toggle state; toggle exposes and changes pressed state.',
    },
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
      description: 'Size of the square visual control.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Prevents activation and removes the web button from the tab order.',
    },
    type: {
      type: 'enum',
      values: ['button', 'submit', 'reset'],
      default: 'button',
      platforms: ['web', 'react', 'angular'],
      description: 'Native web button form behavior.',
    },
    pressed: {
      type: 'boolean',
      default: false,
      description:
        'Toggle state. If supplied, including false, activation proposes changes without committing them until the owner updates this prop.',
    },
    defaultPressed: {
      type: 'boolean',
      default: false,
      description:
        'Initial toggle state when pressed is not supplied; it does not control later changes.',
    },
  },
  events: {
    press: {
      description: 'Reports each enabled activation by pointer, keyboard or programmatically.',
      detail: 'IconButtonPressDetail',
      names: { dom: 'cosm-press', react: 'onPress', angular: 'press', native: 'onPress' },
    },
    pressedChange: {
      description:
        'Reports the proposed next pressed state on toggle activation; controlled state waits for the owner.',
      detail: 'IconButtonPressedChangeDetail',
      names: {
        dom: 'cosm-pressed-change',
        react: 'onPressedChange',
        angular: 'pressedChange',
        native: 'onPressedChange',
      },
    },
  },
  states: [{ prop: 'pressed', event: 'pressedChange', defaultProp: 'defaultPressed' }],
  slots: {
    '': 'Decorative icon content; the label supplies the accessible name.',
  },
  parts: { base: 'The native button element.' },
  cssProperties: {
    '--cosm-icon-button-background': 'Control background.',
    '--cosm-icon-button-color': 'Icon foreground color.',
    '--cosm-icon-button-border': 'Control border color.',
    '--cosm-icon-button-radius': 'Control corner radius.',
    '--cosm-icon-button-focus': 'Visible focus indicator color.',
  },
  keyboard: [
    { keys: ['Tab', 'Shift+Tab'], action: 'Moves focus to or from the enabled button.' },
    {
      keys: ['Enter', 'Space'],
      action: 'Activates the button; toggle mode also proposes a change.',
    },
  ],
});
