import {
  type ContractProps,
  getRadioGroupInitialActive,
  type RadioGroupChangeDetail,
  type RadioGroupOption,
  type RadioGroupReferences,
  radioGroupContract,
  validateRadioGroupOptions,
  validateRadioGroupValue,
} from '@joralvmel/cosmos-core';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';

type Props = ContractProps<typeof radioGroupContract, 'web', RadioGroupReferences>;
type Value = Props['value'];

let instance = 0;

const styles = css`
  :host {
    display: block;
    min-width: 0;
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
  }
  .base {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  .label {
    display: block;
    margin-block-end: var(--cosm-space-xs, 0.25rem);
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-size: var(--cosm-text-sm, 0.875rem);
    font-weight: var(--cosm-weight-medium, 500);
  }
  .options {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--cosm-radio-group-gap, var(--cosm-space-xs, 0.25rem));
  }
  .options[data-orientation='horizontal'] {
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--cosm-radio-group-gap, var(--cosm-space-md, 0.75rem));
  }
  .option {
    display: inline-flex;
    min-width: 0;
    min-height: var(--cosm-control-md, 2.5rem);
    align-items: center;
    gap: var(--cosm-radio-group-option-gap, var(--cosm-space-sm, 0.5rem));
    color: var(--cosm-fg, oklch(0.24 0.01 268));
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
  .control {
    display: grid;
    width: var(--cosm-radio-group-control-size, var(--cosm-icon-size-md, 1.25rem));
    height: var(--cosm-radio-group-control-size, var(--cosm-icon-size-md, 1.25rem));
    flex: none;
    place-items: center;
    box-sizing: border-box;
    border: 1px solid
      var(--cosm-radio-group-border, var(--cosm-border-strong, oklch(0.64 0.01 268)));
    border-radius: 50%;
    background: var(--cosm-bg, oklch(0.985 0.007 268));
  }
  .indicator {
    width: 48%;
    height: 48%;
    border-radius: 50%;
    background: var(--cosm-radio-group-indicator, var(--cosm-primary, oklch(0.55 0.2 268)));
    opacity: 0;
  }
  .input:checked + .control {
    border-color: var(
      --cosm-radio-group-selected-border,
      var(--cosm-primary, oklch(0.55 0.2 268))
    );
  }
  .input:checked + .control .indicator {
    opacity: 1;
  }
  .input:focus-visible + .control {
    outline: 2px solid
      var(--cosm-radio-group-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    outline-offset: 2px;
  }
  .content {
    display: grid;
    min-width: 0;
    gap: var(--cosm-space-3xs, 0.125rem);
  }
  .option-label,
  .description,
  .message {
    overflow-wrap: anywhere;
  }
  .option-label {
    font-size: var(--cosm-text-sm, 0.875rem);
  }
  .description,
  .message {
    color: var(--cosm-fg-muted, oklch(0.48 0.01 268));
    font-size: var(--cosm-text-xs, 0.75rem);
  }
  .option[data-disabled='true'] {
    color: var(--cosm-fg-muted, oklch(0.48 0.01 268));
    cursor: not-allowed;
  }
  .base[data-disabled='true'] .option {
    cursor: not-allowed;
  }
  .base[data-invalid='true'] .control,
  .base[data-invalid='true'] .input:checked + .control {
    border-color: var(--cosm-danger, oklch(0.55 0.16 19));
  }
  .base[data-invalid='true'] .indicator {
    background: var(--cosm-danger, oklch(0.55 0.16 19));
  }
  .message {
    display: block;
    margin-block-start: var(--cosm-space-2xs, 0.125rem);
  }
  .error {
    color: var(--cosm-danger-text, var(--cosm-danger, oklch(0.48 0.14 19)));
  }
  @media (hover: hover) {
    .option:where([data-disabled='false'][data-invalid='false']):hover .control {
      border-color: var(--cosm-radio-group-border, var(--cosm-primary, oklch(0.55 0.2 268)));
    }
    .option:where([data-disabled='false'][data-invalid='false']):hover
      .input:checked
      + .control {
      border-color: var(
        --cosm-radio-group-selected-border,
        var(--cosm-primary-hover, oklch(0.49 0.2 268))
      );
    }
  }
  @media (forced-colors: active) {
    .control {
      forced-color-adjust: none;
      border-color: ButtonText;
      background: Canvas;
    }
    .option .input:checked + .control {
      border-color: Highlight;
    }
    .input:checked + .control .indicator {
      background: Highlight;
    }
    .base[data-invalid='true'] .control,
    .base[data-invalid='true'] .input:checked + .control {
      border-color: CanvasText;
    }
    .base[data-invalid='true'] .indicator {
      background: CanvasText;
    }
    .input:focus-visible + .control {
      outline-color: Highlight;
    }
  }
`;

/**
 * Selects one option from an accessible, form-associated radio group.
 *
 * @tag cosm-radio-group
 * @slot - No content slot; options are supplied through the `options` property.
 * @csspart base - Group wrapper and accessible fieldset.
 * @csspart label - Visible group label.
 * @csspart options - Option collection.
 * @csspart option - Selectable option row.
 * @csspart input - Native radio input and Web focus target.
 * @csspart control - Visible circular radio boundary.
 * @csspart indicator - Selected radio dot.
 * @csspart option-label - Primary option text.
 * @csspart description - Optional option description.
 * @csspart help-text - Supporting text associated with the group.
 * @csspart error-text - Error description associated with the group.
 * @fires {CustomEvent<RadioGroupChangeDetail>} cosm-change - Proposed selection value.
 * @cssprop --cosm-radio-group-gap - Space between option rows.
 * @cssprop --cosm-radio-group-option-gap - Space between control and option content.
 * @cssprop --cosm-radio-group-control-size - Diameter of the visible radio control.
 * @cssprop --cosm-radio-group-border - Unchecked radio boundary color.
 * @cssprop --cosm-radio-group-selected-border - Selected radio boundary color.
 * @cssprop --cosm-radio-group-indicator - Selected radio dot color.
 * @cssprop --cosm-radio-group-focus - Visible keyboard focus indicator color.
 */
export class CosmRadioGroup extends CosmElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    label: {},
    options: { attribute: false },
    value: { attribute: false, noAccessor: true },
    defaultValue: { attribute: false },
    orientation: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    invalid: { type: Boolean, reflect: true },
    helpText: { attribute: 'help-text' },
    errorText: { attribute: 'error-text' },
    name: { reflect: true },
  };

  static override styles = [boxSizing, focusRing, styles];

  declare label: NonNullable<Props['label']>;
  declare options: NonNullable<Props['options']>;
  declare defaultValue: Props['defaultValue'];
  declare orientation: NonNullable<Props['orientation']>;
  declare disabled: NonNullable<Props['disabled']>;
  declare required: NonNullable<Props['required']>;
  declare invalid: NonNullable<Props['invalid']>;
  declare helpText: Props['helpText'];
  declare errorText: Props['errorText'];
  declare name: Props['name'];

  /** Framework adapters set ownership when a value binding is present. */
  valueControlled = false;

  readonly #internals: ElementInternals | undefined;
  readonly #id = `cosm-radio-group-${++instance}`;
  readonly #radioName = `cosm-radio-group-options-${instance}`;
  #value: Value = null;
  #formDisabled = false;
  #initialized = false;
  #showNativeError = false;

  constructor() {
    super();
    const props = radioGroupContract.props;
    this.label = '';
    this.options = [];
    this.defaultValue = undefined;
    this.orientation = props.orientation.default;
    this.disabled = props.disabled.default;
    this.required = props.required.default;
    this.invalid = props.invalid.default;
    this.helpText = '';
    this.errorText = '';
    this.name = undefined;
    this.#internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : undefined;
  }

  get value(): Value {
    return this.#value;
  }

  set value(value: Value) {
    this.valueControlled = value !== undefined;
    this.#setValue(value ?? null);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('invalid', this.#onInvalid);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('invalid', this.#onInvalid);
    super.disconnectedCallback();
  }

  get form(): HTMLFormElement | null {
    return this.#internals?.form ?? this.closest('form');
  }

  override focus(options?: FocusOptions): void {
    const value = getRadioGroupInitialActive(this.options, this.value);
    const input = this.#inputFor(value) ?? this.#inputs()[0];
    input?.focus(options);
  }

  checkValidity(): boolean {
    return this.#internals?.checkValidity() ?? this.#inputFor(null)?.checkValidity() ?? true;
  }

  reportValidity(): boolean {
    this.#showNativeError = true;
    this.requestUpdate();
    this.#syncFormState();
    const input = this.#inputFor(null);
    return this.#internals?.reportValidity() ?? input?.reportValidity() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.#formDisabled = disabled;
    this.requestUpdate();
  }

  formResetCallback(): void {
    this.#showNativeError = false;
    const resetValue = this.defaultValue ?? null;
    if (this.valueControlled) {
      this.emit<RadioGroupChangeDetail>('cosm-change', { value: resetValue });
      return;
    }
    this.#setValue(resetValue);
  }

  formStateRestoreCallback(state: string | File | FormData): void {
    if (typeof state !== 'string') return;
    const restoredValue = state || null;
    validateRadioGroupValue(restoredValue, this.options, 'value');
    this.#showNativeError = false;
    if (this.valueControlled) {
      this.emit<RadioGroupChangeDetail>('cosm-change', { value: restoredValue });
      return;
    }
    this.#setValue(restoredValue);
  }

  protected override willUpdate(): void {
    if (typeof this.label !== 'string' || !this.label.trim()) {
      throw new TypeError('RadioGroup requires a non-empty label.');
    }
    if (this.orientation !== 'vertical' && this.orientation !== 'horizontal') {
      throw new TypeError('RadioGroup orientation must be vertical or horizontal.');
    }
    for (const [name, value] of [
      ['disabled', this.disabled],
      ['required', this.required],
      ['invalid', this.invalid],
    ] as const) {
      if (typeof value !== 'boolean') throw new TypeError(`RadioGroup ${name} must be a boolean.`);
    }
    if (
      typeof this.helpText !== 'string' ||
      typeof this.errorText !== 'string' ||
      (typeof this.name !== 'string' && this.name !== undefined)
    ) {
      throw new TypeError('RadioGroup helpText, errorText and name must be strings.');
    }
    validateRadioGroupOptions(this.options);
    validateRadioGroupValue(this.value, this.options, 'value');
    validateRadioGroupValue(this.defaultValue, this.options, 'defaultValue');

    if (!this.#initialized) {
      if (!this.valueControlled) this.#setValue(this.defaultValue ?? null);
      this.#initialized = true;
    }
  }

  protected override updated(): void {
    this.#syncFormState();
  }

  #inputs = (): HTMLInputElement[] => [
    ...this.renderRoot.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
  ];

  #inputFor = (value: string | null): HTMLInputElement | undefined =>
    this.#inputs().find(input => value === null || input.value === value);

  #setValue(value: Value): void {
    const previous = this.#value;
    this.#value = value;
    this.requestUpdate('value', previous);
  }

  #syncFormState(): void {
    const disabled = this.disabled || this.#formDisabled;
    const inputs = this.#inputs();
    const input = inputs.find(radio => !radio.disabled) ?? inputs[0];
    if (!input) return;
    for (const radio of inputs) {
      radio.disabled = disabled || this.#optionDisabled(radio.value);
      radio.required = this.required;
      radio.checked = radio.value === this.value;
    }
    if (!this.#internals) return;
    const selectedOptionDisabled =
      typeof this.value === 'string' && this.#optionDisabled(this.value);
    this.#internals.setFormValue(
      disabled || selectedOptionDisabled ? null : (this.value ?? null),
      this.value ?? ''
    );
    if (disabled || !this.required || (this.value !== null && !selectedOptionDisabled)) {
      this.#internals.setValidity({});
      return;
    }
    this.#internals.setValidity({ valueMissing: true }, input.validationMessage, input);
  }

  #optionDisabled(value: string): boolean {
    return this.options.find(option => option.value === value)?.disabled === true;
  }

  #onInvalid = (): void => {
    this.#showNativeError = true;
    this.requestUpdate();
  };

  #onChange = (event: Event): void => {
    const input = event.currentTarget as HTMLInputElement;
    const nextValue = input.value;
    if (this.disabled || this.#formDisabled || this.#optionDisabled(nextValue)) {
      input.checked = input.value === this.value;
      return;
    }
    if (nextValue === this.value) return;
    this.#showNativeError = false;
    if (!this.valueControlled) {
      this.#setValue(nextValue);
    }
    this.emit<RadioGroupChangeDetail>('cosm-change', { value: nextValue });
    if (this.valueControlled) this.#syncFormState();
  };

  protected override render() {
    const effectiveDisabled = this.disabled || this.#formDisabled;
    const invalid = this.invalid || Boolean(this.errorText);
    const input = this.#inputFor(null);
    const nativeInvalid = this.#showNativeError && !(input?.validity.valid ?? true);
    const shownError = this.errorText || (nativeInvalid ? input?.validationMessage : '') || '';
    const currentInvalid = invalid || nativeInvalid;
    const describedBy = [
      this.helpText ? `${this.#id}-help` : '',
      shownError ? `${this.#id}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');
    return html`
      <fieldset
        part="base"
        class="base"
        role="radiogroup"
        data-disabled=${effectiveDisabled ? 'true' : 'false'}
        data-invalid=${currentInvalid ? 'true' : 'false'}
        aria-required=${this.required ? 'true' : 'false'}
        aria-disabled=${effectiveDisabled ? 'true' : 'false'}
        aria-invalid=${currentInvalid ? 'true' : nothing}
        aria-describedby=${describedBy || nothing}
        ?disabled=${effectiveDisabled}
      >
        <legend part="label" class="label">${this.label}</legend>
        <div part="options" class="options" data-orientation=${this.orientation}>
          ${this.options.map(
            (option: RadioGroupOption) => html`
              <label
                part="option"
                class="option"
                data-disabled=${effectiveDisabled || option.disabled ? 'true' : 'false'}
                data-invalid=${currentInvalid ? 'true' : 'false'}
              >
                <input
                  part="input"
                  class="input"
                  type="radio"
                  name=${this.#radioName}
                  .value=${option.value}
                  .checked=${this.value === option.value}
                  ?required=${this.required}
                  ?disabled=${effectiveDisabled || option.disabled === true}
                  aria-describedby=${
                    option.description
                      ? `${this.#id}-option-${this.options.indexOf(option)}`
                      : nothing
                  }
                  @change=${this.#onChange}
                />
                <span part="control" class="control" aria-hidden="true">
                  <span part="indicator" class="indicator"></span>
                </span>
                <span class="content">
                  <span part="option-label" class="option-label">${option.label}</span>
                  ${
                    option.description
                      ? html`<span
                        part="description"
                        class="description"
                        id=${`${this.#id}-option-${this.options.indexOf(option)}`}
                        >${option.description}</span
                      >`
                      : nothing
                  }
                </span>
              </label>
            `
          )}
        </div>
        ${
          this.helpText
            ? html`<span part="help-text" class="message" id=${`${this.#id}-help`}
              >${this.helpText}</span
            >`
            : nothing
        }
        ${
          shownError
            ? html`<span
              part="error-text"
              class="message error"
              id=${`${this.#id}-error`}
              role="alert"
              >${shownError}</span
            >`
            : nothing
        }
      </fieldset>
    `;
  }
}

define('cosm-radio-group', CosmRadioGroup);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-radio-group': CosmRadioGroup;
  }
}
