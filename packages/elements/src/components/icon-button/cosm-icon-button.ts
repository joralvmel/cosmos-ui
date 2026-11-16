import {
  type ContractProps,
  type IconButtonPressDetail,
  type IconButtonPressedChangeDetail,
  iconButtonContract,
  type PressSource,
} from '@joralvmel/cosmos-core';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing } from '../../internal/styles.js';

type Props = Required<ContractProps<typeof iconButtonContract, 'web'>>;

const styles = css`
  :host {
    --_solid: var(--cosm-primary, oklch(0.55 0.2 268));
    --_on-solid: var(--cosm-primary-fg, oklch(1 0 0));
    --_subtle: var(--cosm-primary-subtle, oklch(0.945 0.048 268));
    --_text: var(--cosm-primary-text, oklch(0.44 0.18 268));
    --_size: var(--cosm-control-md, 2.5rem);
    display: inline-flex;
    vertical-align: middle;
  }
  :host([tone='neutral']) {
    --_solid: var(--cosm-fg, oklch(0.24 0.01 268));
    --_on-solid: var(--cosm-bg, oklch(0.985 0.007 268));
    --_subtle: var(--cosm-neutral-3, oklch(0.945 0.01 268));
    --_text: var(--cosm-fg, oklch(0.24 0.01 268));
  }
  :host([tone='danger']) {
    --_solid: var(--cosm-danger, oklch(0.55 0.16 19));
    --_on-solid: var(--cosm-danger-fg, oklch(1 0 0));
    --_subtle: var(--cosm-danger-subtle, oklch(0.945 0.038 19));
    --_text: var(--cosm-danger-text, oklch(0.44 0.144 19));
  }
  :host([size='sm']) { --_size: var(--cosm-control-sm, 2rem); }
  :host([size='lg']) { --_size: var(--cosm-control-lg, 3rem); }
  .base {
    --_bg: var(--_solid);
    --_fg: var(--_on-solid);
    --_border: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--_size);
    height: var(--_size);
    padding: 0;
    border: 1px solid var(--cosm-icon-button-border, var(--_border));
    border-radius: var(--cosm-icon-button-radius, var(--cosm-radius-md, 0.5rem));
    background: var(--cosm-icon-button-background, var(--_bg));
    color: var(--cosm-icon-button-color, var(--_fg));
    font: inherit;
    cursor: pointer;
    transition: background-color var(--cosm-duration-fast, 120ms) var(--cosm-easing-standard, ease);
  }
  :host([variant='soft']) .base { --_bg: var(--_subtle); --_fg: var(--_text); }
  :host([variant='outline']) .base {
    --_bg: transparent;
    --_fg: var(--_text);
    --_border: var(--cosm-border-strong, oklch(0.64 0.01 268));
  }
  :host([variant='ghost']) .base { --_bg: transparent; --_fg: var(--_text); }
  .base:hover { --_bg: color-mix(in oklab, var(--_solid), var(--_on-solid) 14%); }
  :host([variant='soft']) .base:hover,
  :host([variant='outline']) .base:hover,
  :host([variant='ghost']) .base:hover { --_bg: var(--_subtle); }
  .base:active { filter: brightness(0.9); }
  .base[aria-pressed='true'] {
    box-shadow: inset 0 0 0 2px currentColor;
  }
  .base:focus-visible {
    outline: 2px solid var(--cosm-icon-button-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    outline-offset: 2px;
  }
  .base:disabled { cursor: not-allowed; opacity: 0.5; }
  @media (prefers-reduced-motion: reduce) { .base { transition: none; } }
`;

/**
 * Labeled icon-only action or toggle.
 * @tag cosm-icon-button
 * @slot - Decorative icon.
 * @csspart base - Native button.
 * @fires {CustomEvent<IconButtonPressDetail>} cosm-press - Activation.
 * @fires {CustomEvent<IconButtonPressedChangeDetail>} cosm-pressed-change - Proposed toggle state.
 * @cssprop --cosm-icon-button-background - Background.
 * @cssprop --cosm-icon-button-color - Icon color.
 * @cssprop --cosm-icon-button-border - Border color.
 * @cssprop --cosm-icon-button-radius - Corner radius.
 * @cssprop --cosm-icon-button-focus - Focus indicator color.
 */
export class CosmIconButton extends CosmElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  static override properties = {
    label: {},
    mode: { reflect: true },
    variant: { reflect: true },
    tone: { reflect: true },
    size: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    type: {},
    pressed: { type: Boolean, noAccessor: true },
    defaultPressed: { type: Boolean, attribute: 'default-pressed' },
  };
  static override styles = [boxSizing, styles];

  declare label: string;
  declare mode: Props['mode'];
  declare variant: Props['variant'];
  declare tone: Props['tone'];
  declare size: Props['size'];
  declare disabled: boolean;
  declare type: Props['type'];
  declare defaultPressed: boolean;

  /** Adapters set ownership when a pressed binding is present. */
  pressedControlled = false;
  #pressed = false;
  #edited = false;
  #formDisabled = false;
  #nextSource: PressSource | undefined;
  readonly #internals: ElementInternals | undefined;

  constructor() {
    super();
    const props = iconButtonContract.props;
    this.label = '';
    this.mode = props.mode.default;
    this.variant = props.variant.default;
    this.tone = props.tone.default;
    this.size = props.size.default;
    this.disabled = props.disabled.default;
    this.type = props.type.default;
    this.defaultPressed = props.defaultPressed.default;
    this.#internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : undefined;
  }

  get pressed(): boolean {
    return this.#pressed;
  }
  set pressed(value: boolean | undefined) {
    this.pressedControlled = value !== undefined;
    if (value !== undefined) this.#setPressed(value);
  }
  #setPressed(value: boolean): void {
    const old = this.#pressed;
    this.#pressed = value;
    this.requestUpdate('pressed', old);
  }
  get form(): HTMLFormElement | null {
    return this.#internals?.form ?? this.closest('form');
  }
  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === 'pressed' && value === null) this.pressedControlled = false;
  }
  formDisabledCallback(disabled: boolean): void {
    this.#formDisabled = disabled;
    this.requestUpdate();
  }
  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has('defaultPressed') && !this.pressedControlled && !this.#edited) {
      this.#setPressed(this.defaultPressed);
    }
  }
  override click(): void {
    const button = this.renderRoot.querySelector('button');
    if (!button || button.disabled) return;
    this.#nextSource = 'programmatic';
    button.click();
  }
  #onPointerDown = () => {
    this.#nextSource = 'pointer';
  };
  #onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') this.#nextSource = 'keyboard';
  };
  #onClick = (event: MouseEvent) => {
    const source = this.#nextSource ?? (event.detail === 0 ? 'keyboard' : 'pointer');
    this.#nextSource = undefined;
    if (this.disabled || this.#formDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (this.mode === 'toggle') {
      const pressed = !this.#pressed;
      this.#edited = true;
      if (!this.pressedControlled) this.#setPressed(pressed);
      this.emit<IconButtonPressedChangeDetail>('cosm-pressed-change', { pressed });
    }
    const form = this.form;
    if (form && this.type === 'submit') form.requestSubmit();
    if (form && this.type === 'reset') form.reset();
    this.emit<IconButtonPressDetail>('cosm-press', { source });
  };
  protected override render() {
    if (!this.label?.trim()) throw new Error('cosm-icon-button requires a non-empty label.');
    return html`<button
      part="base" class="base" type="button"
      ?disabled=${this.disabled || this.#formDisabled}
      aria-label=${this.label}
      aria-pressed=${this.mode === 'toggle' ? String(this.#pressed) : nothing}
      @pointerdown=${this.#onPointerDown} @keydown=${this.#onKeyDown} @click=${this.#onClick}
    ><span aria-hidden="true"><slot></slot></span></button>`;
  }
}

define('cosm-icon-button', CosmIconButton);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-icon-button': CosmIconButton;
  }
  interface HTMLElementEventMap {
    'cosm-pressed-change': CustomEvent<IconButtonPressedChangeDetail>;
  }
}
