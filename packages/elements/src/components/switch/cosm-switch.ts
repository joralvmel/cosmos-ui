import {
  type ContractProps,
  type SwitchCheckedChangeDetail,
  switchContract,
  validateSize,
} from '@joralvmel/cosmos-core';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';

type Props = ContractProps<typeof switchContract, 'web'>;
export type SwitchSize = NonNullable<Props['size']>;

const sizeConverter = {
  fromAttribute(value: string | null): SwitchSize {
    if (value === null) return 'md';
    const number = Number(value);
    return value.trim() !== '' && Number.isFinite(number) ? number : (value as SwitchSize);
  },
  toAttribute(value: SwitchSize): string {
    return String(value);
  },
};

let instance = 0;

const styles = css`
  :host {
    --_switch-height: var(--_custom-height, var(--cosm-icon-size-md, 20px));
    display: inline-flex;
    flex-direction: column;
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
  }
  :host([size='sm']) {
    --_switch-height: var(--_custom-height, var(--cosm-icon-size-sm, 16px));
  }
  :host([size='md']) {
    --_switch-height: var(--_custom-height, var(--cosm-icon-size-md, 20px));
  }
  :host([size='lg']) {
    --_switch-height: var(--_custom-height, var(--cosm-icon-size-lg, 24px));
  }
  .base {
    display: inline-flex;
    align-items: center;
    gap: var(--cosm-switch-gap, var(--cosm-space-sm, 0.5rem));
    min-width: 44px;
    min-height: max(44px, var(--_switch-height));
    cursor: pointer;
  }
  .input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .track {
    position: relative;
    display: block;
    width: var(--cosm-switch-width, calc(var(--_switch-height) * 1.8));
    height: var(--cosm-switch-height, var(--_switch-height));
    flex: none;
    border: 1px solid
      var(--cosm-switch-border, var(--cosm-border-strong, oklch(0.64 0.01 268)));
    border-radius: var(--cosm-switch-radius, 999px);
    background: var(
      --cosm-switch-track-background,
      var(--cosm-border-strong, oklch(0.64 0.01 268))
    );
    transition:
      background-color var(--cosm-motion-fast, 120ms) ease,
      border-color var(--cosm-motion-fast, 120ms) ease;
  }
  .thumb {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 2px;
    width: var(--cosm-switch-thumb-size, calc(var(--_switch-height) * 0.72));
    height: var(--cosm-switch-thumb-size, calc(var(--_switch-height) * 0.72));
    border-radius: 50%;
    background: var(--cosm-switch-thumb-background, var(--cosm-bg, oklch(0.985 0.007 268)));
    box-shadow: var(--cosm-shadow-sm, 0 1px 2px oklch(0 0 0 / 0.2));
    transform: translateY(-50%);
    transition:
      inset-inline-start var(--cosm-motion-fast, 120ms) ease,
      background-color var(--cosm-motion-fast, 120ms) ease;
  }
  .input:checked + .track {
    border-color: var(
      --cosm-switch-checked-track-background,
      var(--cosm-primary, oklch(0.55 0.2 268))
    );
    background: var(
      --cosm-switch-checked-track-background,
      var(--cosm-primary, oklch(0.55 0.2 268))
    );
  }
  .input:checked + .track .thumb {
    inset-inline-start: calc(100% - var(--cosm-switch-thumb-size, calc(var(--_switch-height) * 0.72)) - 2px);
    background: var(
      --cosm-switch-thumb-background,
      var(--cosm-primary-fg, var(--cosm-bg, oklch(0.985 0.007 268)))
    );
  }
  .input:focus-visible + .track {
    outline: 2px solid var(--cosm-switch-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    outline-offset: 3px;
  }
  .label {
    overflow-wrap: anywhere;
  }
  .label-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .help {
    display: block;
    margin-inline-start: calc(var(--cosm-switch-width, calc(var(--_switch-height) * 1.8)) + var(--cosm-switch-gap, var(--cosm-space-sm, 0.5rem)));
    margin-block-start: var(--cosm-space-2xs, 0.125rem);
    overflow-wrap: anywhere;
    color: var(--cosm-fg-muted, oklch(0.48 0.01 268));
    font-size: var(--cosm-text-xs, 0.75rem);
  }
  .base[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.56;
  }
  :host([invalid]) .track {
    border-color: var(--cosm-danger, oklch(0.55 0.16 19));
    background: var(--cosm-danger, oklch(0.55 0.16 19));
  }
  @media (forced-colors: active) {
    .track {
      forced-color-adjust: none;
      border-color: ButtonText;
      background: Canvas;
    }
    .input:checked + .track {
      border-color: Highlight;
      background: Highlight;
    }
    .thumb {
      forced-color-adjust: none;
      background: ButtonText;
    }
    .input:checked + .track .thumb {
      background: HighlightText;
    }
    .input:focus-visible + .track {
      outline-color: Highlight;
    }
    :host([invalid]) .track {
      border-color: Highlight;
      background: Canvas;
    }
    :host([invalid]) .track .thumb {
      background: CanvasText;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .track,
    .thumb {
      transition: none;
    }
  }
`;

/**
 * An immediate binary setting with controlled or autonomous checked state.
 *
 * @tag cosm-switch
 * @slot - Consumer content is not accepted; use the `label` and `helpText` properties.
 * @csspart base - Switch and label layout.
 * @csspart input - Native checkbox input and focus target.
 * @csspart track - Visible switch track.
 * @csspart thumb - Visible switch thumb.
 * @csspart label - Visible or visually hidden accessible label.
 * @csspart help-text - Supporting text.
 * @fires {CustomEvent<SwitchCheckedChangeDetail>} cosm-checked-change - Proposed checked value.
 * @cssprop --cosm-switch-width - Track width.
 * @cssprop --cosm-switch-height - Track height.
 * @cssprop --cosm-switch-thumb-size - Thumb diameter.
 * @cssprop --cosm-switch-track-background - Unchecked track background.
 * @cssprop --cosm-switch-checked-track-background - Checked track background.
 * @cssprop --cosm-switch-thumb-background - Thumb background.
 * @cssprop --cosm-switch-border - Unchecked track boundary color.
 * @cssprop --cosm-switch-radius - Track corner radius.
 * @cssprop --cosm-switch-gap - Space between the control and label.
 * @cssprop --cosm-switch-focus - Visible keyboard focus indicator color.
 */
export class CosmSwitch extends CosmElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    label: {},
    hideLabel: { type: Boolean, reflect: true, attribute: 'hide-label' },
    checked: { type: Boolean, noAccessor: true },
    defaultChecked: { type: Boolean, attribute: 'default-checked' },
    size: { reflect: true, converter: sizeConverter },
    disabled: { type: Boolean, reflect: true },
    invalid: { type: Boolean, reflect: true },
    helpText: { attribute: 'help-text' },
    name: { reflect: true },
    value: {},
  };

  static override styles = [boxSizing, focusRing, styles];

  declare label: NonNullable<Props['label']>;
  declare hideLabel: NonNullable<Props['hideLabel']>;
  declare defaultChecked: NonNullable<Props['defaultChecked']>;
  declare size: SwitchSize;
  declare disabled: NonNullable<Props['disabled']>;
  declare invalid: NonNullable<Props['invalid']>;
  declare helpText: NonNullable<Props['helpText']>;
  declare name: Props['name'];
  declare value: NonNullable<Props['value']>;

  /** Framework adapters set ownership when a checked binding is present. */
  checkedControlled = false;

  readonly #internals: ElementInternals | undefined;
  readonly #id = `cosm-switch-${++instance}`;
  #checked = false;
  #formDisabled = false;
  #initialized = false;

  constructor() {
    super();
    const props = switchContract.props;
    this.label = '';
    this.hideLabel = props.hideLabel.default;
    this.#checked = props.defaultChecked.default;
    this.defaultChecked = props.defaultChecked.default;
    this.size = props.size.default as SwitchSize;
    this.disabled = props.disabled.default;
    this.invalid = props.invalid.default;
    this.helpText = '';
    this.name = undefined;
    this.value = props.value.default;
    this.#internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : undefined;
  }

  /** Current checked value; assigning it marks the state as controlled. */
  get checked(): boolean {
    return this.#checked;
  }

  set checked(value: boolean | undefined) {
    this.checkedControlled = value !== undefined;
    if (value !== undefined) this.#setChecked(value);
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === 'checked' && value === null) this.checkedControlled = false;
  }

  /** The associated form, if any. */
  get form(): HTMLFormElement | null {
    return this.#internals?.form ?? this.closest('form');
  }

  /** Focuses the native checkbox input. */
  override focus(options?: FocusOptions): void {
    this.#input()?.focus(options);
  }

  formDisabledCallback(disabled: boolean): void {
    this.#formDisabled = disabled;
    this.requestUpdate();
  }

  formResetCallback(): void {
    if (this.checkedControlled) {
      this.emit<SwitchCheckedChangeDetail>('cosm-checked-change', {
        checked: this.defaultChecked,
      });
      return;
    }
    this.#setChecked(this.defaultChecked);
  }

  formStateRestoreCallback(state: string | File | FormData): void {
    if (typeof state !== 'string') return;
    const checked = state === 'true';
    if (this.checkedControlled) {
      this.emit<SwitchCheckedChangeDetail>('cosm-checked-change', { checked });
      return;
    }
    this.#setChecked(checked);
  }

  protected override willUpdate(): void {
    validateSize(this.size, 'Switch');
    if (typeof this.label !== 'string' || !this.label.trim()) {
      throw new TypeError('Switch requires a non-empty label.');
    }
    for (const [name, value] of [
      ['hideLabel', this.hideLabel],
      ['disabled', this.disabled],
      ['invalid', this.invalid],
      ['defaultChecked', this.defaultChecked],
    ] as const) {
      if (typeof value !== 'boolean') throw new TypeError(`Switch ${name} must be a boolean.`);
    }
    if (
      typeof this.value !== 'string' ||
      (typeof this.name !== 'string' && this.name !== undefined)
    ) {
      throw new TypeError('Switch name and value must be strings.');
    }
    if (typeof this.size === 'number') {
      this.style.setProperty('--_custom-height', `${this.size}px`);
    } else {
      this.style.removeProperty('--_custom-height');
    }
    if (!this.#initialized) {
      if (!this.checkedControlled) this.#setChecked(this.defaultChecked);
      this.#initialized = true;
    }
  }

  protected override updated(): void {
    this.#syncFormState();
  }

  #input = (): HTMLInputElement | null => this.renderRoot.querySelector<HTMLInputElement>('input');

  #setChecked(value: boolean): void {
    if (typeof value !== 'boolean') throw new TypeError('Switch checked must be a boolean.');
    const previous = this.#checked;
    this.#checked = value;
    this.requestUpdate('checked', previous);
  }

  #syncFormState(): void {
    if (!this.#internals) return;
    const disabled = this.disabled || this.#formDisabled;
    this.#internals.setFormValue(
      this.#checked && !disabled && this.name ? this.value : null,
      String(this.#checked)
    );
    this.#internals.setValidity({});
  }

  #onChange = (event: Event): void => {
    const input = event.currentTarget as HTMLInputElement;
    if (this.disabled || this.#formDisabled) {
      input.checked = this.#checked;
      return;
    }
    const checked = input.checked;
    if (!this.checkedControlled) this.#setChecked(checked);
    this.emit<SwitchCheckedChangeDetail>('cosm-checked-change', { checked });
    if (this.checkedControlled) input.checked = this.#checked;
    this.#syncFormState();
  };

  protected override render() {
    const describedBy = this.helpText ? `${this.#id}-help` : nothing;
    return html`
      <label part="base" class="base" data-disabled=${this.disabled || this.#formDisabled}>
        <input
          part="input"
          class="input"
          type="checkbox"
          role="switch"
          .checked=${this.#checked}
          ?disabled=${this.disabled || this.#formDisabled}
          aria-invalid=${this.invalid ? 'true' : nothing}
          aria-describedby=${describedBy}
          @change=${this.#onChange}
        />
        <span part="track" class="track" aria-hidden="true">
          <span part="thumb" class="thumb"></span>
        </span>
        <span part="label" class=${this.hideLabel ? 'label label-hidden' : 'label'}>
          ${this.label}
        </span>
      </label>
      ${
        this.helpText
          ? html`<span part="help-text" class="help" id=${`${this.#id}-help`}
              >${this.helpText}</span
            >`
          : nothing
      }
    `;
  }
}

define('cosm-switch', CosmSwitch);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-switch': CosmSwitch;
  }
  interface HTMLElementEventMap {
    'cosm-checked-change': CustomEvent<SwitchCheckedChangeDetail>;
  }
}
