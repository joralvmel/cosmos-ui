import {
  type ContractProps,
  getTextFieldState,
  type TextFieldChangeDetail,
  type TextFieldSubmitDetail,
  textFieldContract,
} from '@joralvmel/cosmos-core';
import { type IconDefinition, isIconDefinition } from '@joralvmel/cosmos-icons';
import { eye } from '@joralvmel/cosmos-icons/eye';
import { eyeOff } from '@joralvmel/cosmos-icons/eye-off';
import { x } from '@joralvmel/cosmos-icons/x';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';
import '../icon/cosm-icon.js';

type Props = ContractProps<typeof textFieldContract, 'web', { IconDefinition: IconDefinition }>;
export type TextFieldType = NonNullable<Props['type']>;
export type TextFieldSize = NonNullable<Props['size']>;
export type TextFieldVariant = NonNullable<Props['variant']>;

let instance = 0;

const sizeConverter = {
  fromAttribute(value: string | null): TextFieldSize {
    if (value === null) return 'md';
    const number = Number(value);
    return value.trim() !== '' && Number.isFinite(number) ? number : (value as TextFieldSize);
  },
  toAttribute(value: TextFieldSize): string {
    return String(value);
  },
};

const styles = css`
  :host {
    --_height: var(--cosm-control-md, 2.5rem);
    --_font-size: var(--cosm-text-sm, 0.875rem);
    display: block;
    color: var(--cosm-text-field-color, var(--cosm-fg, oklch(0.24 0.01 268)));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
  }
  :host([size='sm']) {
    --_height: var(--cosm-control-sm, 2rem);
    --_font-size: var(--cosm-text-xs, 0.75rem);
  }
  :host([size='lg']) {
    --_height: var(--cosm-control-lg, 3rem);
    --_font-size: var(--cosm-text-md, 1rem);
  }
  .label {
    display: block;
    margin-block-end: var(--cosm-space-xs, 0.25rem);
    font-size: var(--cosm-text-sm, 0.875rem);
    font-weight: var(--cosm-weight-medium, 500);
  }
  .label-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    clip-path: inset(50%);
  }
  .control {
    display: flex;
    align-items: center;
    gap: var(--cosm-space-sm, 0.5rem);
    min-height: max(var(--_height), var(--_minimum-height, 0px));
    padding-inline: var(--cosm-space-md, 0.75rem);
    border: 1px solid
      var(--cosm-text-field-border, var(--cosm-border-strong, oklch(0.64 0.01 268)));
    border-radius: var(--cosm-text-field-radius, var(--cosm-radius-md, 0.5rem));
    background: var(--cosm-text-field-background, var(--cosm-bg, oklch(0.985 0.007 268)));
    transition: border-color var(--cosm-duration-fast, 120ms) var(--cosm-easing-standard, ease);
  }
  :host([variant='filled']) .control {
    border-color: var(--cosm-text-field-border, var(--cosm-border-strong, oklch(0.64 0.01 268)));
    background: var(--cosm-text-field-background, var(--cosm-neutral-2, oklch(0.96 0.008 268)));
  }
  :host([invalid]) .control,
  .control[data-invalid='true'] {
    border-color: var(--cosm-danger, oklch(0.55 0.16 19));
  }
  :host .control:focus-within {
    border-color: var(--cosm-text-field-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    box-shadow: inset 0 0 0 1px
      var(--cosm-text-field-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
  }
  .decoration {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: var(--cosm-space-xs, 0.25rem);
    color: var(--cosm-text-field-color, var(--cosm-fg-muted, oklch(0.48 0.01 268)));
    font-size: var(--_font-size);
    white-space: nowrap;
  }
  .decoration cosm-icon {
    width: 1.25em;
    height: 1.25em;
  }
  input {
    flex: 1;
    min-width: 0;
    min-height: max(var(--_height), var(--_minimum-height, 0px));
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--cosm-text-field-color, var(--cosm-fg, oklch(0.24 0.01 268)));
    font: inherit;
    font-size: var(--_font-size);
  }
  input::placeholder {
    color: var(--cosm-text-field-placeholder, var(--cosm-fg-muted, oklch(0.48 0.01 268)));
    opacity: 1;
  }
  input:focus-visible {
    outline: none;
  }
  .action {
    display: inline-grid;
    flex: none;
    width: max(2rem, var(--_height));
    min-height: max(2rem, var(--_height));
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: var(--cosm-radius-sm, 0.25rem);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .action:hover {
    color: var(--cosm-primary-text, oklch(0.45 0.17 268));
  }
  .action:disabled {
    cursor: not-allowed;
  }
  .message {
    display: block;
    margin-block-start: var(--cosm-space-xs, 0.25rem);
    color: var(--cosm-fg-muted, oklch(0.48 0.01 268));
    font-size: var(--cosm-text-xs, 0.75rem);
  }
  .error {
    color: var(--cosm-danger-text, var(--cosm-danger, oklch(0.48 0.14 19)));
  }
  :host([disabled]) {
    opacity: 0.58;
  }
  @media (prefers-reduced-motion: reduce) {
    .control {
      transition: none;
    }
  }
`;

/**
 * Labeled, single-line text entry with native browser constraints and form association.
 *
 * @tag cosm-text-field
 * @slot - No content slot; use `label`, `helpText` and `error` text properties.
 * @csspart label - The visible or visually hidden label.
 * @csspart control - The visual input control.
 * @csspart input - The editable native input.
 * @csspart start - Start icon or prefix decoration.
 * @csspart end - End icon, suffix or action region.
 * @csspart help - Supporting help text.
 * @csspart error - External or browser constraint error text.
 * @csspart clear-button - Optional accessible clear action.
 * @csspart reveal-button - Optional accessible password visibility action.
 * @fires {CustomEvent<TextFieldChangeDetail>} cosm-change - A value edit or clear proposal.
 * @fires {CustomEvent<TextFieldSubmitDetail>} cosm-submit - The user invoked the submit action.
 * @cssprop --cosm-text-field-background - Control background.
 * @cssprop --cosm-text-field-color - Editable and decoration text color.
 * @cssprop --cosm-text-field-placeholder - Placeholder text color.
 * @cssprop --cosm-text-field-border - Control boundary color.
 * @cssprop --cosm-text-field-focus - Focus indicator color.
 * @cssprop --cosm-text-field-radius - Control corner radius.
 */
export class CosmTextField extends CosmElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    label: {},
    labelHidden: { type: Boolean, reflect: true, attribute: 'label-hidden' },
    value: {},
    defaultValue: { attribute: 'default-value' },
    type: { reflect: true },
    variant: { reflect: true },
    size: { reflect: true, converter: sizeConverter },
    placeholder: {},
    helpText: { attribute: 'help-text' },
    error: {},
    invalid: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readOnly: { type: Boolean, reflect: true, attribute: 'read-only' },
    minLength: { type: Number, attribute: 'min-length' },
    maxLength: { type: Number, attribute: 'max-length' },
    pattern: {},
    name: { reflect: true },
    autoComplete: { attribute: 'auto-complete' },
    inputMode: { attribute: 'input-mode' },
    startIcon: { attribute: false },
    endIcon: { attribute: false },
    prefix: {},
    suffix: {},
    clearable: { type: Boolean, reflect: true },
    clearLabel: { attribute: 'clear-label' },
    passwordReveal: { type: Boolean, reflect: true, attribute: 'password-reveal' },
    revealPasswordLabel: { attribute: 'reveal-password-label' },
    hidePasswordLabel: { attribute: 'hide-password-label' },
  };

  static override styles = [boxSizing, focusRing, styles];

  declare label: Props['label'];
  declare labelHidden: boolean;
  declare value: Props['value'];
  declare defaultValue: Props['defaultValue'];
  declare type: Props['type'];
  declare variant: Props['variant'];
  declare size: Props['size'];
  declare placeholder: Props['placeholder'];
  declare helpText: Props['helpText'];
  declare error: Props['error'];
  declare invalid: Props['invalid'];
  declare required: Props['required'];
  declare disabled: Props['disabled'];
  declare readOnly: Props['readOnly'];
  declare minLength: Props['minLength'];
  declare maxLength: Props['maxLength'];
  declare pattern: Props['pattern'];
  declare name: Props['name'];
  declare autoComplete: Props['autoComplete'];
  declare inputMode: string;
  declare startIcon: Props['startIcon'];
  declare endIcon: Props['endIcon'];
  declare prefix: string | null;
  declare suffix: Props['suffix'];
  declare clearable: Props['clearable'];
  declare clearLabel: Props['clearLabel'];
  declare passwordReveal: Props['passwordReveal'];
  declare revealPasswordLabel: Props['revealPasswordLabel'];
  declare hidePasswordLabel: Props['hidePasswordLabel'];

  /** Framework adapters set this metadata when `value` is actually bound. */
  valueControlled = false;

  readonly #internals: ElementInternals | undefined;
  readonly #id = `cosm-text-field-${++instance}`;
  #formDisabled = false;
  #passwordVisible = false;
  #composing = false;
  #showNativeError = false;
  #edited = false;
  #hasRendered = false;
  #controlledReconcileCancel: (() => void) | null = null;
  #pendingControlledRestore: {
    value: string;
    selection: {
      start: number | null;
      end: number | null;
      direction: 'forward' | 'backward' | 'none' | null;
    };
    input: HTMLInputElement;
  } | null = null;

  constructor() {
    super();
    const props = textFieldContract.props;
    this.label = '';
    this.labelHidden = props.labelHidden.default;
    this.value = props.defaultValue.default;
    this.defaultValue = props.defaultValue.default;
    this.type = props.type.default as TextFieldType;
    this.variant = props.variant.default;
    this.size = props.size.default as TextFieldSize;
    this.placeholder = '';
    this.helpText = '';
    this.error = '';
    this.invalid = props.invalid.default;
    this.required = props.required.default;
    this.disabled = props.disabled.default;
    this.readOnly = props.readOnly.default;
    this.minLength = undefined;
    this.maxLength = undefined;
    this.pattern = undefined;
    this.name = undefined;
    this.autoComplete = undefined;
    this.inputMode = '';
    this.startIcon = undefined;
    this.endIcon = undefined;
    this.prefix = '';
    this.suffix = '';
    this.clearable = props.clearable.default;
    this.clearLabel = undefined;
    this.passwordReveal = props.passwordReveal.default;
    this.revealPasswordLabel = undefined;
    this.hidePasswordLabel = undefined;
    this.#internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('invalid', this.#invalid);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('invalid', this.#invalid);
    this.#cancelControlledReconcile();
    super.disconnectedCallback();
  }

  /** The associated form, if any. */
  get form(): HTMLFormElement | null {
    return this.#internals?.form ?? this.closest('form');
  }

  /** Focuses the native editable control. */
  override focus(options?: FocusOptions): void {
    this.renderRoot.querySelector<HTMLInputElement>('input')?.focus(options);
  }

  /** Returns the native validity state of the inner input. */
  get validity(): ValidityState | undefined {
    return this.renderRoot.querySelector<HTMLInputElement>('input')?.validity;
  }

  /** Returns the browser's constraint-validation message. */
  get validationMessage(): string {
    return this.renderRoot.querySelector<HTMLInputElement>('input')?.validationMessage ?? '';
  }

  /** Returns whether the input satisfies its native constraints. */
  checkValidity(): boolean {
    return this.renderRoot.querySelector<HTMLInputElement>('input')?.checkValidity() ?? true;
  }

  /** Checks validity and asks the browser to present its localized message. */
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
    if (this.valueControlled) {
      this.emit<TextFieldChangeDetail>('cosm-change', { value: this.defaultValue ?? '' });
      return;
    }
    this.value = this.defaultValue ?? '';
  }

  formStateRestoreCallback(state: string | File | FormData): void {
    if (typeof state !== 'string') return;
    this.#showNativeError = false;
    if (this.valueControlled) {
      this.emit<TextFieldChangeDetail>('cosm-change', { value: state });
      return;
    }
    this.value = state;
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (
      typeof this.size !== 'number' &&
      this.size !== 'sm' &&
      this.size !== 'md' &&
      this.size !== 'lg'
    ) {
      throw new TypeError('Text field size must be sm, md, lg or a positive finite number.');
    }
    if (typeof this.size === 'number' && (!Number.isFinite(this.size) || this.size <= 0)) {
      throw new TypeError('Text field size must be a positive finite number.');
    }
    if (!this.label.trim()) throw new TypeError('Text field requires a non-empty label.');
    if (this.clearable && !this.clearLabel?.trim()) {
      throw new TypeError('Text field requires clearLabel when clearable is enabled.');
    }
    if (
      this.passwordReveal &&
      (!this.revealPasswordLabel?.trim() || !this.hidePasswordLabel?.trim())
    ) {
      throw new TypeError(
        'Text field requires revealPasswordLabel and hidePasswordLabel when passwordReveal is enabled.'
      );
    }
    for (const [name, icon] of [
      ['startIcon', this.startIcon],
      ['endIcon', this.endIcon],
    ] as const) {
      if (icon !== undefined && !isIconDefinition(icon)) {
        throw new TypeError(`Text field ${name} requires a valid IconDefinition.`);
      }
    }
    if (typeof this.size === 'number')
      this.style.setProperty('--_minimum-height', `${this.size}px`);
    else this.style.removeProperty('--_minimum-height');

    if (changed.has('defaultValue') && !this.valueControlled && !this.#edited) {
      if (this.#hasRendered || (!this.hasAttribute('value') && this.defaultValue)) {
        this.value = this.defaultValue ?? '';
      }
    }
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    this.#hasRendered = true;
    if (changed.has('value')) {
      this.#cancelControlledReconcile();
      const input = this.renderRoot.querySelector<HTMLInputElement>('input');
      if (input && !this.#composing && input.value !== (this.value ?? '')) {
        const selection = {
          start: input.selectionStart,
          end: input.selectionEnd,
          direction: input.selectionDirection,
        };
        input.value = this.value ?? '';
        if (selection.start !== null && selection.end !== null) {
          input.setSelectionRange(
            Math.min(selection.start, input.value.length),
            Math.min(selection.end, input.value.length),
            selection.direction ?? undefined
          );
        }
      }
    }
    this.#syncFormState();
  }

  #input = (): HTMLInputElement | null => this.renderRoot.querySelector<HTMLInputElement>('input');

  #syncFormState(): void {
    const input = this.#input();
    if (!input || !this.#internals) return;
    const currentValue = this.value ?? '';
    this.#internals.setFormValue(
      this.disabled || this.#formDisabled ? null : currentValue,
      currentValue
    );
    const invalidFlags: ValidityStateFlags = {};
    for (const key of [
      'badInput',
      'patternMismatch',
      'rangeOverflow',
      'rangeUnderflow',
      'stepMismatch',
      'tooLong',
      'tooShort',
      'typeMismatch',
      'valueMissing',
    ] as const) {
      if (input.validity[key]) invalidFlags[key] = true;
    }
    if (input.validity.valid) this.#internals.setValidity({});
    else this.#internals.setValidity(invalidFlags, input.validationMessage, input);
  }

  #cancelControlledReconcile(): void {
    this.#controlledReconcileCancel?.();
    this.#controlledReconcileCancel = null;
    this.#pendingControlledRestore = null;
  }

  #scheduleControlledReconcile(input: HTMLInputElement, value: string): void {
    this.#pendingControlledRestore = {
      value,
      selection: {
        start: input.selectionStart,
        end: input.selectionEnd,
        direction: input.selectionDirection,
      },
      input,
    };
    if (this.#controlledReconcileCancel) return;

    const reconcile = () => {
      this.#controlledReconcileCancel = null;
      const pending = this.#pendingControlledRestore;
      this.#pendingControlledRestore = null;
      if (!pending || this.value !== pending.value || this.#composing || !pending.input.isConnected)
        return;
      pending.input.value = pending.value;
      if (pending.selection.start !== null && pending.selection.end !== null) {
        pending.input.setSelectionRange(
          Math.min(pending.selection.start, pending.value.length),
          Math.min(pending.selection.end, pending.value.length),
          pending.selection.direction ?? undefined
        );
      }
      this.#syncFormState();
    };

    if (typeof requestAnimationFrame === 'function') {
      const frame = requestAnimationFrame(reconcile);
      this.#controlledReconcileCancel = () => cancelAnimationFrame(frame);
    } else {
      const timeout = setTimeout(reconcile, 0);
      this.#controlledReconcileCancel = () => clearTimeout(timeout);
    }
  }

  #onInput = (event: Event): void => {
    const input = event.currentTarget as HTMLInputElement;
    if (this.disabled || this.#formDisabled || this.readOnly) {
      input.value = this.value ?? '';
      return;
    }
    this.#edited = true;
    this.#showNativeError = false;
    const proposedValue = input.value;
    if (!this.valueControlled) this.value = proposedValue;
    this.#syncFormState();
    this.emit<TextFieldChangeDetail>('cosm-change', { value: proposedValue });
    if (this.valueControlled && !this.#composing) {
      this.#scheduleControlledReconcile(input, this.value ?? '');
    }
  };

  #onCompositionStart = (): void => {
    this.#cancelControlledReconcile();
    this.#composing = true;
  };

  #onCompositionEnd = (event: CompositionEvent): void => {
    this.#composing = false;
    this.#cancelControlledReconcile();
    if (this.valueControlled) {
      const input = event.currentTarget as HTMLInputElement;
      const selection = {
        start: input.selectionStart,
        end: input.selectionEnd,
        direction: input.selectionDirection,
      };
      input.value = this.value ?? '';
      if (selection.start !== null && selection.end !== null) {
        input.setSelectionRange(
          Math.min(selection.start, input.value.length),
          Math.min(selection.end, input.value.length),
          selection.direction ?? undefined
        );
      }
    }
  };

  #onBlur = (): void => {
    this.#showNativeError = true;
    this.#syncFormState();
    this.requestUpdate();
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' || event.isComposing || this.disabled || this.#formDisabled) return;
    const value = this.valueControlled ? (this.value ?? '') : (this.#input()?.value ?? '');
    this.emit<TextFieldSubmitDetail>('cosm-submit', { value });
    this.#syncFormState();
    this.form?.requestSubmit();
  };

  #clear = (): void => {
    if (this.disabled || this.#formDisabled || this.readOnly) return;
    const input = this.#input();
    if (!input) return;
    if (!this.valueControlled) this.value = '';
    this.#syncFormState();
    this.#edited = true;
    this.emit<TextFieldChangeDetail>('cosm-change', { value: '' });
    this.focus();
    queueMicrotask(() => this.focus());
  };

  #togglePassword = (): void => {
    if (this.disabled || this.#formDisabled || this.readOnly) return;
    this.#passwordVisible = !this.#passwordVisible;
    this.requestUpdate();
  };

  #invalid = (): void => {
    this.#showNativeError = true;
    this.requestUpdate();
  };

  protected override render() {
    const value = this.value ?? '';
    const state = getTextFieldState({
      value,
      disabled: this.disabled || this.#formDisabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      error: this.error,
      clearable: this.clearable,
      passwordReveal: this.passwordReveal,
      type: this.type,
    });
    const nativeInvalid = this.#showNativeError && !(this.#input()?.validity.valid ?? true);
    const shownError = this.error || (nativeInvalid ? this.validationMessage : '');
    const invalid = state.invalid || nativeInvalid;
    const describedBy = [
      this.helpText ? `${this.#id}-help` : '',
      shownError ? `${this.#id}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');
    const inputType =
      this.type === 'password' && this.#passwordVisible ? 'text' : (this.type ?? 'text');
    return html`
      <label
        part="label"
        class=${this.labelHidden ? 'label label-hidden' : 'label'}
        for=${`${this.#id}-input`}
      >${this.label}</label>
      <div part="control" class="control" data-invalid=${invalid ? 'true' : 'false'}>
        ${
          this.startIcon || this.prefix
            ? html`<span part="start" class="decoration">
              ${
                this.startIcon
                  ? html`<cosm-icon .icon=${this.startIcon} decorative size="md"></cosm-icon>`
                  : nothing
              }
              ${this.prefix}
            </span>`
            : nothing
        }
        <input
          part="input"
          id=${`${this.#id}-input`}
          type=${inputType}
          .value=${value}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${this.disabled || this.#formDisabled}
          ?readonly=${this.readOnly}
          minlength=${this.minLength ?? nothing}
          maxlength=${this.maxLength ?? nothing}
          pattern=${this.pattern ?? nothing}
          name=${nothing}
          autocomplete=${this.autoComplete || nothing}
          inputmode=${this.inputMode || nothing}
          aria-invalid=${invalid ? 'true' : nothing}
          aria-describedby=${describedBy || nothing}
          @input=${this.#onInput}
          @compositionstart=${this.#onCompositionStart}
          @compositionend=${this.#onCompositionEnd}
          @blur=${this.#onBlur}
          @keydown=${this.#onKeyDown}
          @invalid=${this.#invalid}
        />
        ${
          this.suffix || this.endIcon
            ? html`<span part="end" class="decoration">
              ${this.suffix}
              ${
                this.endIcon
                  ? html`<cosm-icon .icon=${this.endIcon} decorative size="md"></cosm-icon>`
                  : nothing
              }
            </span>`
            : nothing
        }
        ${
          state.showClearAction
            ? html`<button
              part="clear-button"
              class="action"
              type="button"
              aria-label=${this.clearLabel}
              @click=${this.#clear}
            ><cosm-icon .icon=${x} decorative size="sm"></cosm-icon></button>`
            : nothing
        }
        ${
          state.showPasswordReveal
            ? html`<button
              part="reveal-button"
              class="action"
              type="button"
              aria-label=${
                this.#passwordVisible ? this.hidePasswordLabel : this.revealPasswordLabel
              }
              aria-pressed=${this.#passwordVisible ? 'true' : 'false'}
              @click=${this.#togglePassword}
            ><cosm-icon .icon=${this.#passwordVisible ? eyeOff : eye} decorative size="sm"></cosm-icon
            ></button>`
            : nothing
        }
      </div>
      ${
        this.helpText
          ? html`<span part="help" class="message" id=${`${this.#id}-help`}>${this.helpText}</span>`
          : nothing
      }
      ${
        shownError
          ? html`<span part="error" class="message error" id=${`${this.#id}-error`} role="alert"
            >${shownError}</span
          >`
          : nothing
      }
    `;
  }
}

define('cosm-text-field', CosmTextField);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-text-field': CosmTextField;
  }
  interface HTMLElementEventMap {
    'cosm-change': CustomEvent<TextFieldChangeDetail>;
    'cosm-submit': CustomEvent<TextFieldSubmitDetail>;
  }
}
