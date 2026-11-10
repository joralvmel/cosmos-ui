import {
  type ButtonPressDetail,
  buttonContract,
  type ContractProps,
  getPressableState,
  type PressSource,
} from '@joralvmel/cosmos-core';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';

type Props = Required<ContractProps<typeof buttonContract, 'web'>>;
export type ButtonVariant = Props['variant'];
export type ButtonTone = Props['tone'];
export type ButtonSize = Props['size'];
export type ButtonType = Props['type'];

/**
 * Triggers an action or submits a form. Renders a native `<button>` (WAI-ARIA APG button
 * pattern) and is form-associated, so `type="submit"` and `type="reset"` work inside forms.
 *
 * @tag cosm-button
 * @slot - Button label.
 * @slot start - Content before the label, usually an icon.
 * @slot end - Content after the label, usually an icon.
 * @csspart base - The native button element.
 * @csspart label - Wrapper of the label slot.
 * @csspart spinner - Loading indicator.
 * @fires {CustomEvent<ButtonPressDetail>} cosm-press - The button was activated.
 * @cssprop --cosm-button-radius - Corner radius.
 * @cssprop --cosm-button-gap - Space between icon and label.
 * @cssprop --cosm-button-font-weight - Label font weight.
 */
export class CosmButton extends CosmElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    variant: { reflect: true },
    tone: { reflect: true },
    size: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, reflect: true, attribute: 'full-width' },
    type: {},
    label: {},
  };

  declare variant: ButtonVariant;
  declare tone: ButtonTone;
  declare size: ButtonSize;
  declare disabled: boolean;
  declare loading: boolean;
  declare fullWidth: boolean;
  declare type: ButtonType;
  declare label: string | undefined;

  readonly #internals: ElementInternals | undefined;
  #nextSource: PressSource | undefined;

  constructor() {
    super();
    const props = buttonContract.props;
    this.variant = props.variant.default;
    this.tone = props.tone.default;
    this.size = props.size.default;
    this.disabled = props.disabled.default;
    this.loading = props.loading.default;
    this.fullWidth = props.fullWidth.default;
    this.type = props.type.default;
    this.label = undefined;
    this.#internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : undefined;
  }

  /** Form the button belongs to (form-associated, with a DOM fallback). */
  get form(): HTMLFormElement | null {
    return this.#internals?.form ?? this.closest('form');
  }

  /** Activates the button programmatically, reporting `source: 'programmatic'`. */
  override click(): void {
    const button = this.renderRoot.querySelector('button');
    if (!button) return;
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
    if (!getPressableState(this).interactive) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const form = this.form;
    if (form && this.type === 'submit') form.requestSubmit();
    if (form && this.type === 'reset') form.reset();
    this.emit<ButtonPressDetail>('cosm-press', { source });
  };

  protected override render() {
    const state = getPressableState(this);
    return html`<button
      part="base"
      class="base"
      type="button"
      ?disabled=${state.disabled}
      aria-disabled=${state.busy ? 'true' : nothing}
      aria-busy=${state.busy ? 'true' : nothing}
      aria-label=${this.label || nothing}
      @pointerdown=${this.#onPointerDown}
      @keydown=${this.#onKeyDown}
      @click=${this.#onClick}
    >
      ${this.loading ? html`<span part="spinner" class="spinner" aria-hidden="true"></span>` : nothing}
      <slot name="start"></slot>
      <span part="label" class="label"><slot></slot></span>
      <slot name="end"></slot>
    </button>`;
  }

  static override styles = [
    boxSizing,
    focusRing,
    css`
      :host {
        --_solid: var(--cosm-primary, oklch(0.55 0.2 268));
        --_on-solid: var(--cosm-primary-fg, oklch(1 0 0));
        --_subtle: var(--cosm-primary-subtle, oklch(0.945 0.048 268));
        --_text: var(--cosm-primary-text, oklch(0.44 0.18 268));
        --_height: var(--cosm-control-md, 2.5rem);
        --_padding: var(--cosm-space-lg, 1rem);
        --_font-size: var(--cosm-text-sm, 0.875rem);
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
      :host([size='sm']) {
        --_height: var(--cosm-control-sm, 2rem);
        --_padding: var(--cosm-space-md, 0.75rem);
        --_font-size: var(--cosm-text-sm, 0.875rem);
      }
      :host([size='lg']) {
        --_height: var(--cosm-control-lg, 3rem);
        --_padding: var(--cosm-space-xl, 1.5rem);
        --_font-size: var(--cosm-text-md, 1rem);
      }
      :host([full-width]) {
        display: flex;
        width: 100%;
      }
      :host([disabled]) {
        pointer-events: none;
      }

      .base {
        --_bg: var(--_solid);
        --_fg: var(--_on-solid);
        --_border: transparent;
        display: inline-flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        gap: var(--cosm-button-gap, var(--cosm-space-sm, 0.5rem));
        min-height: var(--_height);
        padding: 0 var(--_padding);
        border: 1px solid var(--_border);
        border-radius: var(--cosm-button-radius, var(--cosm-radius-md, 0.5rem));
        background: var(--_bg);
        color: var(--_fg);
        font: inherit;
        font-family: var(--cosm-font-sans, system-ui, sans-serif);
        font-size: var(--_font-size);
        font-weight: var(--cosm-button-font-weight, var(--cosm-weight-semibold, 600));
        line-height: var(--cosm-leading-tight, 1.25);
        cursor: pointer;
        user-select: none;
        transition:
          background-color var(--cosm-duration-fast, 120ms) var(--cosm-easing-standard, ease),
          border-color var(--cosm-duration-fast, 120ms) var(--cosm-easing-standard, ease);
      }
      .base:hover {
        --_bg: color-mix(in oklab, var(--_solid), var(--_on-solid) 14%);
      }
      .base:active {
        --_bg: color-mix(in oklab, var(--_solid), var(--_on-solid) 24%);
      }
      :host([variant='soft']) .base {
        --_bg: var(--_subtle);
        --_fg: var(--_text);
      }
      :host([variant='soft']) .base:hover {
        --_bg: color-mix(in oklab, var(--_subtle), var(--_text) 10%);
      }
      :host([variant='outline']) .base {
        --_bg: transparent;
        --_fg: var(--_text);
        --_border: var(--cosm-border-strong, oklch(0.64 0.01 268));
      }
      :host([variant='ghost']) .base {
        --_bg: transparent;
        --_fg: var(--_text);
      }
      :host([variant='outline']) .base:hover,
      :host([variant='ghost']) .base:hover {
        --_bg: var(--_subtle);
      }
      .base:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
      .base[aria-busy='true'] {
        cursor: progress;
      }
      .label {
        display: inline-flex;
        align-items: center;
      }
      ::slotted(svg),
      ::slotted([slot='start']),
      ::slotted([slot='end']) {
        flex-shrink: 0;
      }
      .spinner {
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-inline-end-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(1turn);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .base {
          transition: none;
        }
        .spinner {
          animation-duration: 2.4s;
        }
      }
    `,
  ];
}

define('cosm-button', CosmButton);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-button': CosmButton;
  }
  interface HTMLElementEventMap {
    'cosm-press': CustomEvent<ButtonPressDetail>;
  }
}
