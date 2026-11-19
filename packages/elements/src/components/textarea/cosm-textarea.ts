import {
  type ContractProps,
  type TextareaChangeDetail,
  textareaContract,
} from '@joralvmel/cosmos-core';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';

type Props = ContractProps<typeof textareaContract, 'web'>;
export type TextareaSize = NonNullable<Props['size']>;
export type TextareaVariant = NonNullable<Props['variant']>;

let instance = 0;

const styles = css`
  :host {
    display: block;
    inline-size: 100%;
    min-inline-size: 0;
    color: var(--cosm-textarea-color, var(--cosm-fg, oklch(0.24 0.01 268)));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
  }
  :host([size='sm']) {
    --_font-size: var(--cosm-text-sm, 0.875rem);
    --_padding: var(--cosm-space-sm, 0.5rem);
  }
  :host(:not([size])),
  :host([size='md']) {
    --_font-size: var(--cosm-text-md, 1rem);
    --_padding: var(--cosm-space-md, 0.75rem);
  }
  :host([size='lg']) {
    --_font-size: var(--cosm-text-lg, 1.125rem);
    --_padding: var(--cosm-space-lg, 1rem);
  }
  .label {
    display: block;
    overflow-wrap: anywhere;
    margin-block-end: var(--cosm-space-xs, 0.25rem);
    color: var(--cosm-fg, oklch(0.24 0.01 268));
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
    min-inline-size: 0;
    border: 1px solid
      var(--cosm-textarea-border, var(--cosm-border-strong, oklch(0.64 0.01 268)));
    border-radius: var(--cosm-textarea-radius, var(--cosm-radius-md, 0.5rem));
    background: var(--cosm-textarea-background, var(--cosm-bg, oklch(0.985 0.007 268)));
    transition: border-color var(--cosm-duration-fast, 120ms) var(--cosm-easing-standard, ease);
  }
  :host([variant='filled']) .control {
    background: var(--cosm-textarea-background, var(--cosm-neutral-2, oklch(0.96 0.008 268)));
  }
  @media (hover: hover) {
    .control:has(.textarea:not(:disabled)):hover:not([data-invalid='true']) {
      border-color: var(--cosm-textarea-border, var(--cosm-primary, oklch(0.55 0.2 268)));
    }
  }
  .control[data-invalid='true'] {
    border-color: var(--cosm-textarea-border, var(--cosm-danger, oklch(0.55 0.16 19)));
  }
  .control:focus-within {
    border-color: var(--cosm-textarea-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    background: var(--cosm-textarea-background, var(--cosm-primary-subtle, oklch(0.94 0.024 268)));
    box-shadow: inset 0 0 0 1px
      var(--cosm-textarea-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
  }
  .textarea {
    display: block;
    box-sizing: border-box;
    inline-size: 100%;
    min-inline-size: 0;
    padding: var(--_padding, var(--cosm-space-md, 0.75rem));
    border: 0;
    border-radius: inherit;
    outline: 0;
    background: transparent;
    color: var(--cosm-textarea-color, var(--cosm-fg, oklch(0.24 0.01 268)));
    font: inherit;
    font-size: var(--_font-size, var(--cosm-text-md, 1rem));
    line-height: var(--cosm-line-height-normal, 1.5);
    resize: vertical;
  }
  .textarea::placeholder {
    color: var(--cosm-textarea-placeholder, var(--cosm-fg-muted, oklch(0.48 0.01 268)));
    opacity: 1;
  }
  .textarea:focus-visible {
    outline: none;
  }
  .message {
    display: block;
    overflow-wrap: anywhere;
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
  @media (forced-colors: active) {
    .control:focus-within {
      border-color: Highlight;
      outline: 2px solid Highlight;
      outline-offset: -2px;
      box-shadow: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .control {
      transition: none;
    }
  }
`;

/**
 * Labeled, multiline plain-text input with native browser constraints and form association.
 *
 * @tag cosm-textarea
 * @slot - No content slot; use `label`, `helpText` and `error` text properties.
 * @csspart label - The visible or visually hidden label.
 * @csspart control - The visual textarea control.
 * @csspart textarea - The native multiline editable textarea.
 * @csspart help - Supporting help text.
 * @csspart error - External or browser constraint error text.
 * @fires {CustomEvent<TextareaChangeDetail>} cosm-change - A value edit proposal.
 * @cssprop --cosm-textarea-background - Control background.
 * @cssprop --cosm-textarea-color - Editable text color.
 * @cssprop --cosm-textarea-placeholder - Placeholder text color.
 * @cssprop --cosm-textarea-border - Control boundary color.
 * @cssprop --cosm-textarea-focus - Focus indicator color.
 * @cssprop --cosm-textarea-radius - Control corner radius.
 */
export class CosmTextarea extends CosmElement {
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
    rows: { type: Number, reflect: true },
    variant: { reflect: true },
    size: { reflect: true },
    placeholder: {},
    helpText: { attribute: 'help-text' },
    error: {},
    invalid: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readOnly: { type: Boolean, reflect: true, attribute: 'read-only' },
    maxLength: { type: Number, attribute: 'max-length' },
    name: { reflect: true },
  };

  static override styles = [boxSizing, focusRing, styles];

  declare label: Props['label'];
  declare labelHidden: Props['labelHidden'];
  declare value: Props['value'];
  declare defaultValue: Props['defaultValue'];
  declare rows: Props['rows'];
  declare variant: Props['variant'];
  declare size: Props['size'];
  declare placeholder: Props['placeholder'];
  declare helpText: Props['helpText'];
  declare error: Props['error'];
  declare invalid: Props['invalid'];
  declare required: Props['required'];
  declare disabled: Props['disabled'];
  declare readOnly: Props['readOnly'];
  declare maxLength: Props['maxLength'];
  declare name: Props['name'];

  /** Framework adapters set this metadata when `value` is actually bound. */
  valueControlled = false;

  readonly #internals: ElementInternals | undefined;
  readonly #id = `cosm-textarea-${++instance}`;
  #formDisabled = false;
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
    textarea: HTMLTextAreaElement;
  } | null = null;

  constructor() {
    super();
    const props = textareaContract.props;
    this.label = '';
    this.labelHidden = props.labelHidden.default;
    this.value = props.defaultValue.default;
    this.defaultValue = props.defaultValue.default;
    this.rows = props.rows.default;
    this.variant = props.variant.default;
    this.size = props.size.default;
    this.placeholder = '';
    this.helpText = '';
    this.error = '';
    this.invalid = props.invalid.default;
    this.required = props.required.default;
    this.disabled = props.disabled.default;
    this.readOnly = props.readOnly.default;
    this.maxLength = undefined;
    this.name = undefined;
    this.#internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('invalid', this.#onInvalid);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('invalid', this.#onInvalid);
    this.#cancelControlledReconcile();
    super.disconnectedCallback();
  }

  /** The associated form, if any. */
  get form(): HTMLFormElement | null {
    return this.#internals?.form ?? this.closest('form');
  }

  /** Focuses the native editable textarea. */
  override focus(options?: FocusOptions): void {
    this.#textarea()?.focus(options);
  }

  /** Returns the native validity state of the inner textarea. */
  get validity(): ValidityState | undefined {
    return this.#textarea()?.validity;
  }

  /** Returns the browser's constraint-validation message. */
  get validationMessage(): string {
    return this.#textarea()?.validationMessage ?? '';
  }

  /** Returns whether the textarea satisfies its native constraints. */
  checkValidity(): boolean {
    return this.#textarea()?.checkValidity() ?? true;
  }

  /** Checks validity and asks the browser to present its localized message. */
  reportValidity(): boolean {
    this.#showNativeError = true;
    this.requestUpdate();
    this.#syncFormState();
    return this.#internals?.reportValidity() ?? this.#textarea()?.reportValidity() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.#formDisabled = disabled;
    this.requestUpdate();
  }

  formResetCallback(): void {
    this.#showNativeError = false;
    this.#edited = false;
    if (this.valueControlled) {
      this.emit<TextareaChangeDetail>('cosm-change', { value: this.defaultValue ?? '' });
      return;
    }
    this.value = this.defaultValue ?? '';
  }

  formStateRestoreCallback(state: string | File | FormData): void {
    if (typeof state !== 'string') return;
    this.#showNativeError = false;
    if (this.valueControlled) {
      this.emit<TextareaChangeDetail>('cosm-change', { value: state });
      return;
    }
    this.value = state;
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (!this.label.trim()) throw new TypeError('Textarea requires a non-empty label.');
    if (!Number.isInteger(this.rows) || (this.rows ?? 0) < 1)
      throw new TypeError('Textarea rows must be a positive integer.');
    if (this.maxLength !== undefined && (!Number.isInteger(this.maxLength) || this.maxLength < 0)) {
      throw new TypeError('Textarea maxLength must be a nonnegative integer.');
    }
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
      const textarea = this.#textarea();
      if (textarea && !this.#composing && textarea.value !== (this.value ?? '')) {
        const selection = {
          start: textarea.selectionStart,
          end: textarea.selectionEnd,
          direction: textarea.selectionDirection,
        };
        textarea.value = this.value ?? '';
        if (selection.start !== null && selection.end !== null) {
          textarea.setSelectionRange(
            Math.min(selection.start, textarea.value.length),
            Math.min(selection.end, textarea.value.length),
            selection.direction ?? undefined
          );
        }
      }
    }
    this.#syncFormState();
  }

  #textarea = (): HTMLTextAreaElement | null =>
    this.renderRoot.querySelector<HTMLTextAreaElement>('textarea');

  #syncFormState(): void {
    const textarea = this.#textarea();
    if (!textarea) return;
    textarea.disabled = this.disabled || this.#formDisabled;
    if (!this.#internals) return;
    const currentValue = this.value ?? '';
    this.#internals.setFormValue(
      this.disabled || this.#formDisabled ? null : currentValue,
      currentValue
    );
    const invalidFlags: ValidityStateFlags = {};
    for (const key of ['tooLong', 'valueMissing'] as const) {
      if (textarea.validity[key]) invalidFlags[key] = true;
    }
    if (textarea.validity.valid) this.#internals.setValidity({});
    else this.#internals.setValidity(invalidFlags, textarea.validationMessage, textarea);
  }

  #cancelControlledReconcile(): void {
    this.#controlledReconcileCancel?.();
    this.#controlledReconcileCancel = null;
    this.#pendingControlledRestore = null;
  }

  #scheduleControlledReconcile(textarea: HTMLTextAreaElement, value: string): void {
    this.#pendingControlledRestore = {
      value,
      selection: {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        direction: textarea.selectionDirection,
      },
      textarea,
    };
    if (this.#controlledReconcileCancel) return;

    const reconcile = () => {
      this.#controlledReconcileCancel = null;
      const pending = this.#pendingControlledRestore;
      this.#pendingControlledRestore = null;
      if (
        !pending ||
        this.value !== pending.value ||
        this.#composing ||
        !pending.textarea.isConnected
      )
        return;
      pending.textarea.value = pending.value;
      if (pending.selection.start !== null && pending.selection.end !== null) {
        pending.textarea.setSelectionRange(
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
    const textarea = event.currentTarget as HTMLTextAreaElement;
    if (this.disabled || this.#formDisabled || this.readOnly) {
      textarea.value = this.value ?? '';
      return;
    }
    this.#edited = true;
    this.#showNativeError = false;
    const proposedValue = textarea.value;
    if (!this.valueControlled) this.value = proposedValue;
    this.#syncFormState();
    this.emit<TextareaChangeDetail>('cosm-change', { value: proposedValue });
    if (this.valueControlled && !this.#composing) {
      this.#scheduleControlledReconcile(textarea, this.value ?? '');
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
      const textarea = event.currentTarget as HTMLTextAreaElement;
      const selection = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        direction: textarea.selectionDirection,
      };
      textarea.value = this.value ?? '';
      if (selection.start !== null && selection.end !== null) {
        textarea.setSelectionRange(
          Math.min(selection.start, textarea.value.length),
          Math.min(selection.end, textarea.value.length),
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

  #onInvalid = (): void => {
    this.#showNativeError = true;
    this.requestUpdate();
  };

  protected override render() {
    const value = this.value ?? '';
    const textarea = this.#textarea();
    const nativeInvalid = this.#showNativeError && !(textarea?.validity.valid ?? true);
    const shownError = this.error || (nativeInvalid ? this.validationMessage : '');
    const isInvalid = this.invalid || Boolean(this.error) || nativeInvalid;
    const describedBy = [
      this.helpText ? `${this.#id}-help` : '',
      shownError ? `${this.#id}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');
    return html`
      <label
        part="label"
        class=${this.labelHidden ? 'label label-hidden' : 'label'}
        for=${`${this.#id}-input`}
      >${this.label}</label>
      <div part="control" class="control" data-invalid=${isInvalid ? 'true' : 'false'}>
        <textarea
          part="textarea"
          class="textarea"
          id=${`${this.#id}-input`}
          .value=${value}
          rows=${this.rows}
          placeholder=${this.placeholder || nothing}
          maxlength=${this.maxLength ?? nothing}
          ?required=${this.required}
          .disabled=${this.disabled || this.#formDisabled}
          ?readonly=${this.readOnly}
          aria-invalid=${isInvalid ? 'true' : nothing}
          aria-describedby=${describedBy || nothing}
          @input=${this.#onInput}
          @compositionstart=${this.#onCompositionStart}
          @compositionend=${this.#onCompositionEnd}
          @blur=${this.#onBlur}
          @invalid=${this.#onInvalid}
        ></textarea>
      </div>
      ${
        this.helpText
          ? html`<span part="help" class="message" id=${`${this.#id}-help`}>${this.helpText}</span>`
          : nothing
      }
      ${
        shownError
          ? html`<span part="error" class="message error" id=${`${this.#id}-error`}>${shownError}</span>`
          : nothing
      }
    `;
  }
}

define('cosm-textarea', CosmTextarea);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-textarea': CosmTextarea;
  }

  interface HTMLElementEventMap {
    'cosm-change': CustomEvent<TextareaChangeDetail>;
  }
}
