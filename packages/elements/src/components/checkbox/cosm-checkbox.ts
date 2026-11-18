import {
  type CheckboxCheckedChangeDetail,
  type ContractProps,
  checkboxContract,
  validateSize,
} from '@joralvmel/cosmos-core';
import { check } from '@joralvmel/cosmos-icons/check';
import { minus } from '@joralvmel/cosmos-icons/minus';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';
import '../icon/cosm-icon.js';

type Props = ContractProps<typeof checkboxContract, 'web'>;
export type CheckboxSize = NonNullable<Props['size']>;

const sizeConverter = {
  fromAttribute(value: string | null): CheckboxSize {
    if (value === null) return 'md';
    const number = Number(value);
    return value.trim() !== '' && Number.isFinite(number) ? number : (value as CheckboxSize);
  },
  toAttribute(value: CheckboxSize): string {
    return String(value);
  },
};

let instance = 0;

const styles = css`
  :host {
    --_checkbox-size: var(--cosm-icon-size-md, 20px);
    display: inline-flex;
    flex-direction: column;
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
  }
  :host([size='sm']) {
    --_checkbox-size: var(--cosm-icon-size-sm, 16px);
  }
  :host([size='lg']) {
    --_checkbox-size: var(--cosm-icon-size-lg, 24px);
  }
  .base {
    display: inline-flex;
    align-items: center;
    gap: var(--cosm-checkbox-gap, var(--cosm-space-sm, 0.5rem));
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
  .box {
    display: grid;
    width: var(--cosm-checkbox-size, var(--_custom-size, var(--_checkbox-size)));
    height: var(--cosm-checkbox-size, var(--_custom-size, var(--_checkbox-size)));
    flex: none;
    place-items: center;
    box-sizing: border-box;
    border: 1px solid
      var(--cosm-checkbox-border, var(--cosm-border-strong, oklch(0.64 0.01 268)));
    border-radius: var(--cosm-checkbox-radius, var(--cosm-radius-sm, 0.25rem));
    background: var(--cosm-checkbox-background, var(--cosm-bg, oklch(0.985 0.007 268)));
    color: var(--cosm-checkbox-color, var(--cosm-primary-fg, oklch(1 0 0)));
  }
  .box cosm-icon {
    width: 75%;
    height: 75%;
  }
  .input:checked + .box,
  .box[data-indeterminate='true'] {
    border-color: var(
      --cosm-checkbox-checked-background,
      var(--cosm-primary, oklch(0.55 0.2 268))
    );
    background: var(
      --cosm-checkbox-checked-background,
      var(--cosm-primary, oklch(0.55 0.2 268))
    );
  }
  .input:focus-visible + .box {
    outline: 2px solid var(--cosm-checkbox-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    outline-offset: 2px;
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
  .message {
    display: block;
    overflow-wrap: anywhere;
    margin-inline-start: calc(var(--cosm-checkbox-size, var(--_custom-size, var(--_checkbox-size))) + var(--cosm-checkbox-gap, var(--cosm-space-sm, 0.5rem)));
    margin-block-start: var(--cosm-space-2xs, 0.125rem);
    color: var(--cosm-fg-muted, oklch(0.48 0.01 268));
    font-size: var(--cosm-text-xs, 0.75rem);
  }
  .error {
    color: var(--cosm-danger-text, var(--cosm-danger, oklch(0.48 0.14 19)));
  }
  .base[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.56;
  }
  .base[data-invalid='true'] .box {
    border-color: var(--cosm-danger, oklch(0.55 0.16 19));
  }
  .base[data-invalid='true'] .input:checked + .box,
  .base[data-invalid='true'] .box[data-indeterminate='true'] {
    border-color: var(--cosm-danger, oklch(0.55 0.16 19));
    background: transparent;
    color: var(--cosm-danger, oklch(0.55 0.16 19));
  }
  @media (forced-colors: active) {
    .input:focus-visible + .box {
      outline-color: Highlight;
    }
    .input:checked + .box,
    .box[data-indeterminate='true'] {
      border-color: Highlight;
      background: Highlight;
      color: HighlightText;
    }
    .base[data-invalid='true'] .input:checked + .box,
    .base[data-invalid='true'] .box[data-indeterminate='true'] {
      border-color: Highlight;
      background: Canvas;
      color: Highlight;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .box {
      transition: none;
    }
  }
`;

/**
 * An independent boolean choice with native checkbox and form semantics.
 *
 * @tag cosm-checkbox
 * @slot - Optional noninteractive inline label content; do not place links or buttons here.
 * @csspart base - Label and visual checkbox control.
 * @csspart input - Native checkbox input and focus target.
 * @csspart box - Visible checkbox box and indicator.
 * @csspart label - Visible or visually hidden label text.
 * @csspart help-text - Supporting text.
 * @csspart error-text - Error description.
 * @fires {CustomEvent<CheckboxCheckedChangeDetail>} cosm-checked-change - Proposed checked value.
 * @cssprop --cosm-checkbox-size - Visual box width and height.
 * @cssprop --cosm-checkbox-background - Unchecked box background.
 * @cssprop --cosm-checkbox-checked-background - Checked and mixed box background.
 * @cssprop --cosm-checkbox-color - Checked indicator foreground.
 * @cssprop --cosm-checkbox-border - Box boundary color.
 * @cssprop --cosm-checkbox-radius - Box corner radius.
 * @cssprop --cosm-checkbox-focus - Visible keyboard focus indicator color.
 * @cssprop --cosm-checkbox-gap - Space between the box and label.
 */
export class CosmCheckbox extends CosmElement {
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
    indeterminate: { type: Boolean, reflect: true },
    size: { reflect: true, converter: sizeConverter },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    invalid: { type: Boolean, reflect: true },
    helpText: { attribute: 'help-text' },
    errorText: { attribute: 'error-text' },
    name: { reflect: true },
    value: {},
  };

  static override styles = [boxSizing, focusRing, styles];

  declare label: NonNullable<Props['label']>;
  declare hideLabel: NonNullable<Props['hideLabel']>;
  declare defaultChecked: NonNullable<Props['defaultChecked']>;
  declare indeterminate: NonNullable<Props['indeterminate']>;
  declare size: CheckboxSize;
  declare disabled: NonNullable<Props['disabled']>;
  declare required: NonNullable<Props['required']>;
  declare invalid: NonNullable<Props['invalid']>;
  declare helpText: NonNullable<Props['helpText']>;
  declare errorText: NonNullable<Props['errorText']>;
  declare name: Props['name'];
  declare value: NonNullable<Props['value']>;

  /** Framework adapters set ownership when a checked binding is present. */
  checkedControlled = false;

  readonly #internals: ElementInternals | undefined;
  readonly #id = `cosm-checkbox-${++instance}`;
  #checked = false;
  #formDisabled = false;
  #initialized = false;
  #edited = false;
  #showNativeError = false;

  constructor() {
    super();
    const props = checkboxContract.props;
    this.label = '';
    this.hideLabel = props.hideLabel.default;
    this.#checked = props.defaultChecked.default;
    this.defaultChecked = props.defaultChecked.default;
    this.indeterminate = props.indeterminate.default;
    this.size = props.size.default as CheckboxSize;
    this.disabled = props.disabled.default;
    this.required = props.required.default;
    this.invalid = props.invalid.default;
    this.helpText = '';
    this.errorText = '';
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('invalid', this.#onInvalid);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('invalid', this.#onInvalid);
    super.disconnectedCallback();
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

  /** Checks the checkbox's web form validity. */
  checkValidity(): boolean {
    return this.#internals?.checkValidity() ?? this.#input()?.checkValidity() ?? true;
  }

  /** Checks validity and asks the browser to present its localized required message. */
  reportValidity(): boolean {
    this.#showNativeError = true;
    this.requestUpdate();
    this.#syncFormState();
    return this.#internals?.reportValidity() ?? this.#input()?.reportValidity() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.#formDisabled = disabled;
    this.requestUpdate();
  }

  formResetCallback(): void {
    this.#showNativeError = false;
    this.#edited = false;
    if (this.checkedControlled) {
      this.emit<CheckboxCheckedChangeDetail>('cosm-checked-change', {
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
      this.emit<CheckboxCheckedChangeDetail>('cosm-checked-change', { checked });
      return;
    }
    this.#setChecked(checked);
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    validateSize(this.size, 'Checkbox');
    if (typeof this.label !== 'string' || !this.label.trim()) {
      throw new TypeError('Checkbox requires a non-empty label.');
    }
    for (const [name, value] of [
      ['hideLabel', this.hideLabel],
      ['indeterminate', this.indeterminate],
      ['disabled', this.disabled],
      ['required', this.required],
      ['invalid', this.invalid],
      ['defaultChecked', this.defaultChecked],
    ] as const) {
      if (typeof value !== 'boolean') throw new TypeError(`Checkbox ${name} must be a boolean.`);
    }
    if (
      typeof this.value !== 'string' ||
      (typeof this.name !== 'string' && this.name !== undefined)
    ) {
      throw new TypeError('Checkbox name and value must be strings.');
    }
    if (typeof this.size === 'number') this.style.setProperty('--_custom-size', `${this.size}px`);
    else this.style.removeProperty('--_custom-size');
    if (!this.#initialized) {
      if (!this.checkedControlled) this.#setChecked(this.defaultChecked);
      this.#initialized = true;
    } else if (changed.has('defaultChecked') && !this.checkedControlled && !this.#edited) {
      this.#setChecked(this.defaultChecked);
    }
  }

  protected override updated(): void {
    const input = this.#input();
    if (!input) return;
    input.indeterminate = this.indeterminate;
    this.#syncFormState();
  }

  #input = (): HTMLInputElement | null => this.renderRoot.querySelector<HTMLInputElement>('input');

  #setChecked(value: boolean): void {
    if (typeof value !== 'boolean') throw new TypeError('Checkbox checked must be a boolean.');
    const previous = this.#checked;
    this.#checked = value;
    this.requestUpdate('checked', previous);
  }

  #syncFormState(): void {
    const input = this.#input();
    if (!input || !this.#internals) return;
    const disabled = this.disabled || this.#formDisabled;
    const value = this.#checked && !disabled ? this.value : null;
    this.#internals.setFormValue(value, String(this.#checked));
    if (disabled || !this.required || this.#checked) {
      this.#internals.setValidity({});
      return;
    }
    this.#internals.setValidity({ valueMissing: true }, input.validationMessage, input);
  }

  #onInvalid = (): void => {
    this.#showNativeError = true;
    this.requestUpdate();
  };

  #onChange = (event: Event): void => {
    const input = event.currentTarget as HTMLInputElement;
    if (this.disabled || this.#formDisabled) {
      input.checked = this.#checked;
      input.indeterminate = this.indeterminate;
      return;
    }
    const checked = input.checked;
    this.#edited = true;
    this.#showNativeError = false;
    if (!this.checkedControlled) {
      this.#setChecked(checked);
      this.indeterminate = false;
    }
    this.emit<CheckboxCheckedChangeDetail>('cosm-checked-change', { checked });
    if (this.checkedControlled) {
      input.checked = this.#checked;
      input.indeterminate = this.indeterminate;
    }
    this.#syncFormState();
  };

  protected override render() {
    const invalid = this.invalid || Boolean(this.errorText);
    const input = this.#input();
    const nativeInvalid = this.#showNativeError && !(input?.validity.valid ?? true);
    const shownError = this.errorText || (nativeInvalid ? input?.validationMessage : '') || '';
    const describedBy = [
      this.helpText ? `${this.#id}-help` : '',
      shownError ? `${this.#id}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');
    const currentInvalid = invalid || nativeInvalid;
    return html`
      <label part="base" class="base"
        data-disabled=${this.disabled || this.#formDisabled ? 'true' : 'false'}
        data-invalid=${currentInvalid ? 'true' : 'false'}
      >
        <input
          part="input"
          class="input"
          type="checkbox"
          .checked=${this.#checked}
          .indeterminate=${this.indeterminate}
          ?required=${this.required}
          ?disabled=${this.disabled || this.#formDisabled}
          aria-invalid=${currentInvalid ? 'true' : nothing}
          aria-describedby=${describedBy || nothing}
          @change=${this.#onChange}
          @invalid=${this.#onInvalid}
        />
        <span
          part="box"
          class="box"
          data-indeterminate=${this.indeterminate ? 'true' : 'false'}
          aria-hidden="true"
        >
          ${
            this.indeterminate
              ? html`<cosm-icon .icon=${minus} decorative size="sm"></cosm-icon>`
              : this.#checked
                ? html`<cosm-icon .icon=${check} decorative size="sm"></cosm-icon>`
                : nothing
          }
        </span>
        <span part="label" class=${this.hideLabel ? 'label label-hidden' : 'label'}>
          ${this.label}<slot></slot>
        </span>
      </label>
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
    `;
  }
}

define('cosm-checkbox', CosmCheckbox);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-checkbox': CosmCheckbox;
  }
  interface HTMLElementEventMap {
    'cosm-checked-change': CustomEvent<CheckboxCheckedChangeDetail>;
  }
}
