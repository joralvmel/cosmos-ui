import {
  type ContractProps,
  findListboxMatch,
  getListboxInitialActive,
  getListboxOptions,
  type ListboxOption,
  moveListboxActive,
  type SelectChangeDetail,
  type SelectItems,
  type SelectOption,
  type SelectValue,
  selectContract,
  validateSelectValue,
} from '@joralvmel/cosmos-core';
import { check } from '@joralvmel/cosmos-icons/check';
import { chevronDown } from '@joralvmel/cosmos-icons/chevron-down';
import { css, html, LitElement, nothing } from 'lit';
import '../icon/cosm-icon.js';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';

type Props = Required<
  ContractProps<
    typeof selectContract,
    'web',
    { SelectItems: SelectItems; SelectValue: SelectValue }
  >
>;
type Variant = NonNullable<Props['variant']>;
type Size = NonNullable<Props['size']>;

let instance = 0;
const typeaheadInterval = 700;

const styles = css`
  :host {
    display: block;
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
  }
  .base {
    display: grid;
    gap: var(--cosm-space-xs, 0.25rem);
  }
  .label {
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-size: var(--cosm-text-sm, 0.875rem);
    font-weight: 500;
  }
  :host([size='sm']) {
    --_control-height: var(--cosm-control-sm, 2rem);
    --_option-height: 2.25rem;
    --_font-size: var(--cosm-text-sm, 0.875rem);
  }
  :host([size='md']) {
    --_control-height: var(--cosm-control-md, 2.5rem);
    --_option-height: 2.5rem;
    --_font-size: var(--cosm-text-md, 1rem);
  }
  :host([size='lg']) {
    --_control-height: var(--cosm-control-lg, 3rem);
    --_option-height: 3rem;
    --_font-size: var(--cosm-text-lg, 1.125rem);
  }
  .control {
    position: relative;
    display: flex;
    align-items: stretch;
    min-width: 0;
  }
  .trigger {
    box-sizing: border-box;
    display: inline-flex;
    width: 100%;
    min-height: max(
      var(--_control-height, var(--cosm-control-md, 2.5rem)),
      var(--cosm-select-trigger-min-height, 0px)
    );
    align-items: center;
    justify-content: space-between;
    gap: var(--cosm-space-sm, 0.5rem);
    padding: var(--cosm-space-xs, 0.25rem) var(--cosm-space-md, 0.75rem);
    border: 1px solid var(--cosm-select-border, var(--cosm-border-strong, oklch(0.64 0.01 268)));
    border-radius: var(--cosm-select-radius, var(--cosm-radius-md, 0.5rem));
    background: var(--cosm-select-background, var(--cosm-bg, oklch(0.985 0.007 268)));
    color: var(--cosm-select-color, var(--cosm-fg, oklch(0.24 0.01 268)));
    font: inherit;
    font-size: var(--_font-size, var(--cosm-text-md, 1rem));
    text-align: start;
    cursor: pointer;
    transition:
      border-color var(--cosm-duration-fast, 120ms) var(--cosm-easing-standard, ease),
      background-color var(--cosm-duration-fast, 120ms) var(--cosm-easing-standard, ease);
  }
  :host([variant='filled']) .trigger {
    border-color: var(--cosm-select-border, var(--cosm-border-strong, oklch(0.64 0.01 268)));
    background: var(--cosm-select-background, var(--cosm-neutral-2, oklch(0.96 0.008 268)));
  }
  @media (hover: hover) {
    .trigger:hover:not(:disabled):not([aria-invalid='true']) {
      border-color: var(--cosm-select-border, var(--cosm-primary, oklch(0.55 0.2 268)));
    }
  }
  .trigger:focus-visible {
    outline: 2px solid var(--cosm-select-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    outline-offset: 2px;
  }
  .trigger[aria-invalid='true'] {
    border-color: var(--cosm-danger, oklch(0.55 0.2 25));
  }
  .trigger[aria-expanded='true'] {
    background: var(--cosm-select-background, var(--cosm-primary-subtle, oklch(0.92 0.04 265)));
    box-shadow: inset 0 0 0 1px
      var(--cosm-select-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
  }
  .trigger[aria-expanded='true']:not([aria-invalid='true']) {
    border-color: var(--cosm-select-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
  }
  .trigger:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
  .value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .placeholder { color: var(--cosm-select-placeholder, var(--cosm-fg-muted, oklch(0.48 0.01 268))); }
  .trigger-icon {
    flex: none;
    transition: transform var(--cosm-duration-fast, 120ms) var(--cosm-easing-standard, ease);
  }
  .trigger[aria-expanded='true'] .trigger-icon { transform: rotate(180deg); }
  .popup {
    position: fixed;
    inset: auto;
    z-index: var(--cosm-popover-z-index, 1000);
    display: none;
    max-width: calc(100vw - 1rem);
    max-height: calc(100vh - 1rem);
    overflow: auto;
    box-sizing: border-box;
    margin: 0;
    padding: var(--cosm-space-xs, 0.25rem);
    border: 1px solid var(--cosm-border-strong, oklch(0.64 0.01 268));
    border-radius: var(--cosm-select-radius, var(--cosm-radius-md, 0.5rem));
    background: var(--cosm-bg, oklch(0.985 0.007 268));
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    box-shadow: var(--cosm-shadow-lg, 0 8px 24px oklch(0 0 0 / 16%));
  }
  .popup[data-open='true'],
  .popup:popover-open { display: block; }
  .listbox { display: grid; gap: var(--cosm-space-2xs, 0.125rem); }
  .option {
    display: flex;
    min-height: var(--_option-height, 2.5rem);
    align-items: center;
    gap: var(--cosm-space-sm, 0.5rem);
    padding: var(--cosm-space-xs, 0.25rem) var(--cosm-space-sm, 0.5rem);
    border-radius: var(--cosm-radius-sm, 0.25rem);
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    cursor: pointer;
  }
  .option[data-selected='true'] {
    background: var(--cosm-select-option-selected-background, var(--cosm-primary-subtle, oklch(0.92 0.04 265)));
    color: var(--cosm-select-option-selected-color, var(--cosm-primary-text, oklch(0.32 0.12 265)));
    font-weight: 600;
  }
  .option[data-active='true']:not([data-disabled='true']):not([data-selected='true']) {
    background: var(--cosm-neutral-2, oklch(0.96 0.008 268));
  }
  @media (hover: hover) {
    .option:hover:not([data-disabled='true']):not([data-selected='true']) {
      background: var(--cosm-neutral-2, oklch(0.96 0.008 268));
    }
  }
  .option[data-active='true']:focus-visible {
    outline: 2px solid var(--cosm-select-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    outline-offset: -2px;
  }
  .option[data-disabled='true'] {
    color: var(--cosm-fg-muted, oklch(0.48 0.01 268));
    cursor: not-allowed;
    opacity: 0.55;
  }
  .option-content { display: grid; min-width: 0; }
  .option-label { font-size: var(--_font-size, var(--cosm-text-md, 1rem)); }
  .check { margin-inline-start: auto; flex: none; }
  .help, .error { font-size: var(--cosm-text-sm, 0.875rem); }
  .help { color: var(--cosm-muted, oklch(0.48 0.01 268)); }
  .error { color: var(--cosm-danger, oklch(0.55 0.2 25)); }
  .native-validation {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    .trigger, .trigger-icon, .option { transition: none; }
  }
  @media (forced-colors: active) {
    .trigger:focus-visible, .option[data-active='true']:focus-visible {
      outline-color: Highlight;
    }
    .trigger[aria-expanded='true'] { border-color: Highlight; }
    .option[data-selected='true'] { border: 1px solid Highlight; }
  }
`;

/**
 * Labeled, single-selection combobox with a flat popup and native Web form behavior.
 *
 * @tag cosm-select
 * @csspart base - Field wrapper.
 * @csspart label - Visible accessible label.
 * @csspart trigger - Select-only combobox trigger.
 * @csspart value - Selected option text.
 * @csspart placeholder - Text displayed when no option is selected.
 * @csspart popup - Anchored option surface.
 * @csspart listbox - Single-selection option collection.
 * @csspart option - Selectable option row.
 * @csspart content - Option text wrapper.
 * @csspart option-label - Primary option text.
 * @csspart help - Supporting text.
 * @csspart error - Error description.
 * @fires {CustomEvent<SelectChangeDetail>} cosm-change - Proposes a selection.
 * @cssprop --cosm-select-background - Control background.
 * @cssprop --cosm-select-color - Control and value text color.
 * @cssprop --cosm-select-placeholder - Placeholder text color.
 * @cssprop --cosm-select-border - Control boundary color.
 * @cssprop --cosm-select-focus - Visible keyboard focus indicator color.
 * @cssprop --cosm-select-radius - Control corner radius.
 * @cssprop --cosm-select-trigger-min-height - Custom minimum trigger height.
 * @cssprop --cosm-select-option-selected-background - Selected option background.
 * @cssprop --cosm-select-option-selected-color - Selected option text color.
 */
export class CosmSelect extends CosmElement {
  static formAssociated = true;
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  static override properties = {
    label: { type: String },
    items: { attribute: false },
    value: { attribute: false, noAccessor: true },
    defaultValue: { attribute: false },
    placeholder: { type: String },
    variant: { reflect: true },
    size: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    invalid: { type: Boolean, reflect: true },
    helpText: { type: String, attribute: 'help-text' },
    errorText: { type: String, attribute: 'error-text' },
    name: { type: String, reflect: true },
  };
  static override styles = [boxSizing, focusRing, styles];

  declare label: Props['label'];
  declare items: Props['items'];
  declare defaultValue: Props['defaultValue'] | undefined;
  declare placeholder: Props['placeholder'];
  declare variant: Variant;
  declare size: Size;
  declare disabled: Props['disabled'];
  declare required: Props['required'];
  declare invalid: Props['invalid'];
  declare helpText: Props['helpText'];
  declare errorText: Props['errorText'];
  declare name: Props['name'] | undefined;

  /** Set by adapters to distinguish a bound value, including null, from autonomous state. */
  valueControlled = false;

  readonly #internals: ElementInternals | undefined;
  readonly #id = `cosm-select-${++instance}`;
  #value: SelectValue = null;
  #formDisabled = false;
  #initialized = false;
  #open = false;
  #activeValue: string | null = null;
  #nativePopoverOpen = false;
  #typeahead = '';
  #typeaheadAt = 0;
  #showNativeError = false;
  #resizeObserver: ResizeObserver | undefined;

  get value(): SelectValue {
    return this.#value;
  }

  set value(value: SelectValue | undefined) {
    this.valueControlled = value !== undefined;
    this.#setValue(value ?? null);
  }

  constructor() {
    super();
    const props = selectContract.props;
    this.label = '';
    this.items = [];
    this.defaultValue = undefined;
    this.placeholder = '';
    this.variant = props.variant.default as Variant;
    this.size = props.size.default as Size;
    this.disabled = props.disabled.default;
    this.required = props.required.default;
    this.invalid = props.invalid.default;
    this.helpText = '';
    this.errorText = '';
    this.name = undefined;
    this.#internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('invalid', this.#onInvalid);
    this.addEventListener('focusout', this.#onFocusOut);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('invalid', this.#onInvalid);
    this.removeEventListener('focusout', this.#onFocusOut);
    this.#closePopup(false);
    super.disconnectedCallback();
  }

  get form(): HTMLFormElement | null {
    return this.#internals?.form ?? this.closest('form');
  }

  override focus(options?: FocusOptions): void {
    this.#trigger()?.focus(options);
  }

  checkValidity(): boolean {
    return this.#internals?.checkValidity() ?? true;
  }

  reportValidity(): boolean {
    this.#showNativeError = true;
    this.requestUpdate();
    this.#syncFormState();
    return this.#internals?.reportValidity() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.#formDisabled = disabled;
    this.requestUpdate();
  }

  formResetCallback(): void {
    this.#showNativeError = false;
    const resetValue = this.defaultValue ?? null;
    if (this.valueControlled) {
      this.emit<SelectChangeDetail>('cosm-change', { value: resetValue });
      return;
    }
    this.#setValue(resetValue);
  }

  formStateRestoreCallback(state: string | File | FormData): void {
    if (typeof state !== 'string') return;
    const restoredValue = state || null;
    const options = getListboxOptions(this.items);
    validateSelectValue(restoredValue, options, 'value');
    this.#showNativeError = false;
    if (this.valueControlled) {
      this.emit<SelectChangeDetail>('cosm-change', { value: restoredValue });
      return;
    }
    this.#setValue(restoredValue);
  }

  protected override willUpdate(): void {
    if (typeof this.label !== 'string' || !this.label.trim()) {
      throw new TypeError('Select requires a non-empty label.');
    }
    if (typeof this.placeholder !== 'string' || !this.placeholder.trim()) {
      throw new TypeError('Select requires a non-empty placeholder.');
    }
    if (!['outlined', 'filled'].includes(this.variant)) {
      throw new TypeError('Select variant must be outlined or filled.');
    }
    if (!['sm', 'md', 'lg'].includes(this.size)) {
      throw new TypeError('Select size must be sm, md, or lg.');
    }
    for (const [name, value] of [
      ['disabled', this.disabled],
      ['required', this.required],
      ['invalid', this.invalid],
    ] as const) {
      if (typeof value !== 'boolean') throw new TypeError(`Select ${name} must be a boolean.`);
    }
    if (
      typeof this.helpText !== 'string' ||
      typeof this.errorText !== 'string' ||
      (typeof this.name !== 'string' && this.name !== undefined)
    ) {
      throw new TypeError('Select helpText, errorText and name must be strings.');
    }

    const options = getListboxOptions(this.items);
    if (options.length === 0) throw new TypeError('Select requires at least one option.');
    validateSelectValue(this.value, options, 'value');
    validateSelectValue(this.defaultValue ?? null, options, 'defaultValue');

    if (!this.#initialized) {
      if (!this.valueControlled) this.#setValue(this.defaultValue ?? null);
      this.#initialized = true;
    }
    if (
      !this.#activeValue ||
      !options.some(option => option.value === this.#activeValue && !option.disabled)
    ) {
      this.#activeValue = getListboxInitialActive(options, this.value ? [this.value] : []);
    }
    if (this.#open && (this.disabled || this.#formDisabled)) {
      this.#closePopup(false);
    }
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    this.#syncFormState();
    if (this.#open && [...changed.keys()].some(key => key === 'items' || key === 'size')) {
      this.#positionPopup();
    }
  }

  #trigger = (): HTMLButtonElement | null =>
    this.renderRoot.querySelector<HTMLButtonElement>('[part="trigger"]');

  #popup = (): HTMLElement | null => this.renderRoot.querySelector<HTMLElement>('[part="popup"]');

  #setValue(value: SelectValue): void {
    const previous = this.#value;
    if (previous === value) return;
    this.#value = value;
    this.requestUpdate('value', previous);
  }

  #syncFormState(): void {
    if (!this.#internals) return;
    const disabled = this.disabled || this.#formDisabled;
    const options = getListboxOptions(this.items);
    const selected = options.find(option => option.value === this.value);
    const selectedDisabled = selected?.disabled === true;
    this.#internals.setFormValue(
      disabled || selectedDisabled ? null : (this.value ?? null),
      this.value ?? ''
    );
    if (disabled || !this.required || (this.value !== null && !selectedDisabled)) {
      this.#internals.setValidity({});
      return;
    }
    const validation = this.renderRoot.querySelector<HTMLSelectElement>('.native-validation');
    const trigger = this.#trigger();
    this.#internals.setValidity(
      { valueMissing: true },
      validation?.validationMessage || this.errorText || 'Please select an option.',
      trigger ?? undefined
    );
  }

  #onInvalid = (): void => {
    this.#showNativeError = true;
    this.requestUpdate();
  };

  #onFocusOut = (event: FocusEvent): void => {
    if (
      event.relatedTarget === this ||
      (event.relatedTarget instanceof Node &&
        (this.contains(event.relatedTarget) || this.renderRoot.contains(event.relatedTarget)))
    ) {
      return;
    }
    this.#closePopup(false);
  };

  #proposeValue(value: SelectValue): void {
    if (value === this.value) return;
    this.#showNativeError = false;
    if (!this.valueControlled) this.#setValue(value);
    this.emit<SelectChangeDetail>('cosm-change', { value });
    if (this.valueControlled) this.#syncFormState();
  }

  #onTriggerKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled || this.#formDisabled || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const options = getListboxOptions(this.items);
    if (!this.#open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.#activeValue = getListboxInitialActive(options, this.value ? [this.value] : []);
        this.#openPopup();
        return;
      }
      if (event.key.length === 1 && event.key.trim()) {
        const match = this.#findTypeaheadMatch(event.key, options);
        if (match) {
          event.preventDefault();
          this.#activeValue = match;
          this.#openPopup();
        }
      }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      this.#setActive(
        moveListboxActive(
          options,
          this.#activeValue,
          event.key as 'ArrowDown' | 'ArrowUp' | 'Home' | 'End'
        )
      );
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.#activeValue) this.#select(this.#activeValue);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.#closePopup(true);
      return;
    }
    if (event.key.length === 1 && event.key.trim() && event.key !== ' ') {
      const match = this.#findTypeaheadMatch(event.key, options);
      if (match) this.#setActive(match);
      event.preventDefault();
    }
  };

  #findTypeaheadMatch(key: string, options: readonly ListboxOption[]): string | null {
    const now = Date.now();
    this.#typeahead =
      now - this.#typeaheadAt > typeaheadInterval ? key : `${this.#typeahead}${key}`;
    this.#typeaheadAt = now;
    return findListboxMatch(
      options,
      this.#activeValue,
      this.#typeahead,
      this.closest('[lang]')?.getAttribute('lang') || undefined
    );
  }

  #setActive(value: string | null): void {
    this.#activeValue = value;
    this.requestUpdate();
  }

  #select(value: string): void {
    const option = getListboxOptions(this.items).find(candidate => candidate.value === value);
    if (!option || option.disabled || this.disabled || this.#formDisabled) return;
    if (this.value !== value) this.#proposeValue(value);
    this.#closePopup(true);
  }

  #openPopup = (): void => {
    if (this.#open || this.disabled || this.#formDisabled) return;
    this.#open = true;
    this.requestUpdate();
    document.addEventListener('pointerdown', this.#onDocumentPointerDown, true);
    window.addEventListener('resize', this.#positionPopup);
    window.addEventListener('scroll', this.#positionPopup, true);
    void this.updateComplete.then(() => {
      const popup = this.#popup();
      if (!popup || !this.isConnected || !this.#open) return;
      if (typeof popup.showPopover === 'function' && !this.#nativePopoverOpen) {
        popup.showPopover();
        this.#nativePopoverOpen = true;
      }
      this.#positionPopup();
      if (typeof ResizeObserver !== 'undefined') {
        this.#resizeObserver = new ResizeObserver(this.#positionPopup);
        this.#resizeObserver.observe(popup);
        const trigger = this.#trigger();
        if (trigger) this.#resizeObserver.observe(trigger);
      }
    });
  };

  #closePopup = (restoreFocus: boolean): void => {
    if (!this.#open) return;
    this.#open = false;
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
    document.removeEventListener('pointerdown', this.#onDocumentPointerDown, true);
    window.removeEventListener('resize', this.#positionPopup);
    window.removeEventListener('scroll', this.#positionPopup, true);
    const popup = this.#popup();
    if (this.#nativePopoverOpen && popup && typeof popup.hidePopover === 'function') {
      popup.hidePopover();
      this.#nativePopoverOpen = false;
    }
    this.requestUpdate();
    if (restoreFocus) void this.updateComplete.then(() => this.#trigger()?.focus());
  };

  #onDocumentPointerDown = (event: PointerEvent): void => {
    if (event.composedPath().includes(this)) return;
    this.#closePopup(false);
  };

  #positionPopup = (): void => {
    if (!this.#open) return;
    const trigger = this.#trigger();
    const popup = this.#popup();
    if (!trigger || !popup) return;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const margin = 8;
    const gap = 4;
    const below = viewportHeight - rect.bottom - margin - gap;
    const above = rect.top - margin - gap;
    const maxHeight = Math.max(0, Math.min(320, Math.max(below, above)));
    popup.style.maxHeight = `${maxHeight}px`;
    popup.style.minWidth = `${Math.min(rect.width, viewportWidth - margin * 2)}px`;
    const popupHeight = popup.getBoundingClientRect().height;
    const placeBelow = below >= Math.min(popupHeight, maxHeight) || below >= above;
    const top = placeBelow
      ? rect.bottom + gap
      : Math.max(margin, rect.top - Math.min(popupHeight, maxHeight) - gap);
    const left = Math.max(margin, Math.min(rect.left, viewportWidth - rect.width - margin));
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  };

  #renderOption(option: SelectOption, index: number) {
    const selected = option.value === this.value;
    const active = option.value === this.#activeValue;
    const disabled = Boolean(option.disabled);
    return html`
      <div
        part="option"
        class="option"
        role="option"
        id="${this.#id}-option-${index}"
        data-value=${option.value}
        data-selected=${String(selected)}
        data-active=${String(active)}
        data-disabled=${String(disabled)}
        aria-selected=${String(selected)}
        aria-disabled=${disabled ? 'true' : nothing}
        @click=${() => this.#select(option.value)}
      >
        <span part="content" class="option-content">
          <span part="option-label" class="option-label">${option.label}</span>
        </span>
        ${
          selected
            ? html`<cosm-icon class="check" aria-hidden="true" .icon=${check}></cosm-icon>`
            : nothing
        }
      </div>
    `;
  }

  protected override render() {
    const effectiveDisabled = this.disabled || this.#formDisabled;
    const invalid = this.invalid || Boolean(this.errorText) || this.#showNativeError;
    const options = getListboxOptions(this.items);
    const selected = options.find(option => option.value === this.value);
    const activeIndex = options.findIndex(
      option => option.value === this.#activeValue && !option.disabled
    );
    const describedBy = [
      this.helpText ? `${this.#id}-help` : '',
      this.errorText || this.#showNativeError ? `${this.#id}-error` : '',
    ]
      .filter(Boolean)
      .join(' ');
    const items = options.map((option, index) => this.#renderOption(option, index));
    return html`
      <div part="base" class="base" data-disabled=${String(effectiveDisabled)}>
        <label part="label" class="label" id="${this.#id}-label" for="${this.#id}-trigger">
          ${this.label}
        </label>
        <div class="control">
          <button
            part="trigger"
            class="trigger"
            id="${this.#id}-trigger"
            type="button"
            role="combobox"
            aria-labelledby="${this.#id}-label ${this.#id}-value"
            aria-controls="${this.#id}-listbox"
            aria-haspopup="listbox"
            aria-expanded=${String(this.#open)}
            aria-activedescendant=${
              this.#open && activeIndex >= 0 ? `${this.#id}-option-${activeIndex}` : nothing
            }
            aria-required=${this.required ? 'true' : 'false'}
            aria-invalid=${invalid ? 'true' : 'false'}
            aria-describedby=${describedBy || nothing}
            ?disabled=${effectiveDisabled}
            @keydown=${this.#onTriggerKeyDown}
            @click=${() => {
              if (this.#open) {
                this.#closePopup(true);
                return;
              }
              this.#activeValue = getListboxInitialActive(options, this.value ? [this.value] : []);
              this.#openPopup();
            }}
          >
            <span
              part=${selected ? 'value' : 'value placeholder'}
              class=${selected ? 'value' : 'value placeholder'}
              id="${this.#id}-value"
            >${selected?.label ?? this.placeholder}</span>
            <cosm-icon class="trigger-icon" aria-hidden="true" .icon=${chevronDown}></cosm-icon>
          </button>
        </div>
        <div
          part="popup"
          class="popup"
          popover="manual"
          data-open=${String(this.#open)}
        >
          <div
            part="listbox"
            class="listbox"
            id="${this.#id}-listbox"
            role="listbox"
            aria-labelledby="${this.#id}-label"
            aria-required=${this.required ? 'true' : 'false'}
          >${items}</div>
        </div>
        <select
          class="native-validation"
          tabindex="-1"
          aria-hidden="true"
          .value=${this.value ?? ''}
          ?required=${this.required}
        >
          <option value=""></option>
          ${options.map(option => html`<option value=${option.value} ?disabled=${option.disabled}>${option.label}</option>`)}
        </select>
        ${
          this.helpText
            ? html`<div part="help" class="help" id="${this.#id}-help">${this.helpText}</div>`
            : nothing
        }
        ${
          this.errorText || this.#showNativeError
            ? html`<div part="error" class="error" id="${this.#id}-error">${this.errorText || this.renderRoot.querySelector<HTMLSelectElement>('.native-validation')?.validationMessage || ''}</div>`
            : nothing
        }
      </div>
    `;
  }
}

define('cosm-select', CosmSelect);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-select': CosmSelect;
  }
}
