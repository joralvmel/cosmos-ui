import {
  type ContractProps,
  findListboxMatch,
  getListboxInitialActive,
  getListboxOptions,
  getListboxSelection,
  type ListboxItem,
  type ListboxOption,
  type ListboxSelectionChangeDetail,
  listboxContract,
  moveListboxActive,
  validateListboxSize,
  validateListboxValues,
} from '@joralvmel/cosmos-core';
import { type IconDefinition, isIconDefinition } from '@joralvmel/cosmos-icons';
import { check } from '@joralvmel/cosmos-icons/check';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';
import '../icon/cosm-icon.js';

type Props = ContractProps<
  typeof listboxContract,
  'web',
  { ListboxItems: readonly ListboxItem<IconDefinition>[]; ListboxValues: readonly string[] }
>;
export type ListboxSize = NonNullable<Props['size']>;
export type ListboxVariant = NonNullable<Props['variant']>;

let instance = 0;

const sizeConverter = {
  fromAttribute(value: string | null): ListboxSize {
    if (value === null) return 'md';
    const number = Number(value);
    return value.trim() !== '' && Number.isFinite(number) ? number : (value as ListboxSize);
  },
  toAttribute(value: ListboxSize): string {
    return String(value);
  },
};

const styles = css`
  :host {
    display: block;
    min-width: 0;
    color: var(--cosm-listbox-color, var(--cosm-fg, oklch(0.24 0.01 268)));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
    --_minimum-height: var(--cosm-control-md, 2.5rem);
    --_font-size: var(--cosm-text-sm, 0.875rem);
  }
  :host([size='sm']) {
    --_minimum-height: var(--cosm-control-sm, 2rem);
    --_font-size: var(--cosm-text-xs, 0.75rem);
  }
  :host([size='lg']) {
    --_minimum-height: var(--cosm-control-lg, 3rem);
    --_font-size: var(--cosm-text-md, 1rem);
  }
  .base {
    min-width: 0;
    border: 1px solid transparent;
    border-radius: var(--cosm-listbox-radius, var(--cosm-radius-md, 0.5rem));
    background: var(--cosm-listbox-background, var(--cosm-bg, oklch(0.985 0.007 268)));
  }
  :host([variant='outlined']) .base {
    border-color: var(
      --cosm-listbox-border,
      var(--cosm-border-strong, oklch(0.64 0.01 268))
    );
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
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .list {
    max-height: var(--cosm-listbox-max-height, 20rem);
    overflow: auto;
    overscroll-behavior: contain;
    padding: var(--cosm-space-2xs, 0.125rem);
    outline: none;
  }
  .group + .group,
  .group + .option,
  .option + .group {
    margin-block-start: var(--cosm-space-2xs, 0.125rem);
  }
  .group-label {
    padding: var(--cosm-space-xs, 0.25rem) var(--cosm-listbox-option-padding, 0.75rem);
    color: var(--cosm-fg-muted, oklch(0.48 0.01 268));
    font-size: var(--cosm-text-xs, 0.75rem);
    font-weight: var(--cosm-weight-medium, 500);
  }
  .option {
    display: flex;
    align-items: center;
    gap: var(--cosm-listbox-gap, var(--cosm-space-sm, 0.5rem));
    width: 100%;
    min-height: var(--cosm-listbox-option-height, var(--_minimum-height));
    padding: var(--cosm-listbox-option-padding, var(--cosm-space-sm, 0.5rem))
      var(--cosm-listbox-option-padding, var(--cosm-space-md, 0.75rem));
    border: 0;
    border-radius: var(--cosm-listbox-radius, var(--cosm-radius-sm, 0.25rem));
    color: inherit;
    background: transparent;
    text-align: start;
    font: inherit;
    font-size: var(--cosm-listbox-font-size, var(--_font-size));
    cursor: pointer;
  }
  .option[data-active='true']:not([aria-disabled='true']):not([data-selected='true']) {
    background: var(--cosm-neutral-2, oklch(0.96 0.008 268));
  }
  .option[data-selected='true'] {
    color: var(--cosm-listbox-selected-color, var(--cosm-primary-text, oklch(0.45 0.17 268)));
    background: var(--cosm-listbox-selected-background, var(--cosm-primary-subtle, oklch(0.93 0.03 268)));
  }
  .option[data-selected='true'][data-active='true'] {
    background: var(--cosm-listbox-selected-background, var(--cosm-primary-subtle, oklch(0.93 0.03 268)));
  }
  .option:focus-visible {
    position: relative;
    z-index: 1;
    outline: 2px solid var(--cosm-listbox-focus, var(--cosm-focus-ring, oklch(0.55 0.2 268)));
    outline-offset: -2px;
  }
  .option[aria-disabled='true'] {
    color: var(--cosm-fg-muted, oklch(0.48 0.01 268));
    cursor: not-allowed;
  }
  :host([disabled]) .option {
    cursor: not-allowed;
  }
  .icon {
    flex: none;
  }
  .content {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: var(--cosm-space-3xs, 0.125rem);
  }
  .option-label,
  .description {
    overflow-wrap: anywhere;
  }
  .option-label {
    font-size: inherit;
  }
  .description {
    color: var(--cosm-listbox-description-color, var(--cosm-fg-muted, oklch(0.48 0.01 268)));
    font-size: var(--cosm-text-xs, 0.75rem);
  }
  .indicator {
    display: grid;
    width: 1.25rem;
    height: 1.25rem;
    flex: none;
    place-items: center;
  }
  .indicator cosm-icon {
    width: 1rem;
    height: 1rem;
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
    }
  }
`;

/**
 * Renders a named, keyboard-navigable single- or multiple-selection listbox.
 *
 * @tag cosm-listbox
 * @slot - No content slot; options are supplied through the `items` property.
 * @csspart base - Outer listbox container.
 * @csspart label - Visible or visually hidden accessible label.
 * @csspart list - Scrollable listbox element.
 * @csspart group - Named, noninteractive option group.
 * @csspart group-label - Noninteractive group heading.
 * @csspart option - Selectable row with data-active, data-selected and data-disabled states.
 * @csspart icon - Decorative option icon.
 * @csspart content - Option text content wrapper.
 * @csspart option-label - Primary option text.
 * @csspart description - Supporting option text.
 * @csspart indicator - Decorative selected-state indicator.
 * @fires {CustomEvent<ListboxSelectionChangeDetail>} cosm-selection-change - Proposes a selection update.
 * @cssprop --cosm-listbox-background - Container background.
 * @cssprop --cosm-listbox-color - Primary foreground.
 * @cssprop --cosm-listbox-border - Outlined container border color.
 * @cssprop --cosm-listbox-radius - Container and option corner radius.
 * @cssprop --cosm-listbox-option-height - Minimum option height.
 * @cssprop --cosm-listbox-option-padding - Option padding.
 * @cssprop --cosm-listbox-gap - Space between icon, content and selection indicator.
 * @cssprop --cosm-listbox-font-size - Primary option text size.
 * @cssprop --cosm-listbox-description-color - Supporting text color.
 * @cssprop --cosm-listbox-selected-background - Selected option background.
 * @cssprop --cosm-listbox-selected-color - Selected option foreground.
 * @cssprop --cosm-listbox-focus - Visible keyboard focus outline color.
 * @cssprop --cosm-listbox-max-height - Maximum scrollable list height.
 */
export class CosmListbox extends CosmElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override properties = {
    label: { type: String },
    labelHidden: { type: Boolean, reflect: true, attribute: 'label-hidden' },
    items: { attribute: false },
    selectionMode: { reflect: true, attribute: 'selection-mode' },
    selectedValues: { attribute: false, noAccessor: true },
    defaultSelectedValues: { attribute: false },
    variant: { reflect: true },
    size: { reflect: true, converter: sizeConverter },
    disabled: { type: Boolean, reflect: true },
    readOnly: { type: Boolean, reflect: true, attribute: 'read-only' },
    locale: { type: String },
  };

  static override styles = [boxSizing, focusRing, styles];

  /** Required, nonempty accessible name for the listbox. */
  declare label: Props['label'];
  /** Visually hides the label while retaining it as the listbox accessible name. */
  declare labelHidden: Props['labelHidden'];
  /** Ordered readonly options and named groups to render. */
  declare items: Props['items'];
  /** Permits one selected value or toggling multiple values. */
  declare selectionMode: Props['selectionMode'];
  /** Values used for the initial autonomous selection; later changes do not reset it. */
  declare defaultSelectedValues: Props['defaultSelectedValues'];
  /** Plain or outlined container presentation. */
  declare variant: Props['variant'];
  /** Semantic size or a positive finite minimum option height in CSS pixels. */
  declare size: ListboxSize;
  /** Prevents focus and selection interaction for the whole list. */
  declare disabled: Props['disabled'];
  /** Allows exploration while preventing selection proposals. */
  declare readOnly: Props['readOnly'];
  /** Locale override for typeahead; otherwise inherits the nearest `lang`. */
  declare locale: Props['locale'];

  /** Set by adapters or imperative callers to override binding inference for `selectedValues`. */
  get selectedValuesControlled(): boolean {
    return this.#selectedValuesControlled;
  }

  set selectedValuesControlled(value: boolean) {
    const previous = this.#selectedValuesControlled;
    this.#selectedValuesControlled = Boolean(value);
    if (previous !== this.#selectedValuesControlled) this.requestUpdate();
  }

  #selectedValues: Props['selectedValues'];
  #selectedValuesControlled = false;
  #selection: readonly string[] = [];
  #activeValue: string | null = null;
  #initialized = false;
  #restoreFocusAfterUpdate = false;
  #pointerEntry = false;
  #typeahead = '';
  readonly #id = `cosm-listbox-${++instance}`;

  /** Controlled selected values; setting a defined array marks the state controlled. */
  get selectedValues(): Props['selectedValues'] {
    return this.#selectedValues;
  }

  set selectedValues(value: Props['selectedValues']) {
    const previous = this.#selectedValues;
    this.#selectedValues = value;
    if (value === undefined) this.selectedValuesControlled = false;
    else this.selectedValuesControlled = true;
    this.requestUpdate('selectedValues', previous);
  }

  /** The current committed selection, regardless of whether it is autonomous or controlled. */
  get currentSelectedValues(): readonly string[] {
    return this.selectedValuesControlled ? (this.#selectedValues ?? []) : this.#selection;
  }

  /** The current roving option value, or `null` when every option is disabled or absent. */
  get activeValue(): string | null {
    return this.#activeValue;
  }

  constructor() {
    super();
    const props = listboxContract.props;
    this.label = '';
    this.labelHidden = props.labelHidden.default;
    this.items = [];
    this.selectionMode = props.selectionMode.default;
    this.#selectedValues = undefined;
    this.defaultSelectedValues = [];
    this.variant = props.variant.default;
    this.size = props.size.default as ListboxSize;
    this.disabled = props.disabled.default;
    this.readOnly = props.readOnly.default;
    this.locale = undefined;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('focusin', this.#onFocusIn);
    this.addEventListener('focusout', this.#onFocusOut);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('focusin', this.#onFocusIn);
    this.removeEventListener('focusout', this.#onFocusOut);
    super.disconnectedCallback();
  }

  /** Focuses the active enabled option, or the initially selected enabled option. */
  override focus(options?: FocusOptions): void {
    if (this.disabled) return;
    const flattened = this.#getOptions();
    const active =
      getListboxInitialActive(flattened, this.currentSelectedValues) ?? this.#activeValue;
    if (active) this.#focusOption(active, options);
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    this.#restoreFocusAfterUpdate =
      this.hasUpdated &&
      changed.has('items') &&
      this.shadowRoot?.activeElement?.getAttribute('role') === 'option';
    if (typeof this.label !== 'string' || !this.label.trim()) {
      throw new TypeError('Listbox requires a non-empty label.');
    }
    if (this.selectionMode !== 'single' && this.selectionMode !== 'multiple') {
      throw new TypeError('Listbox selectionMode must be single or multiple.');
    }
    if (this.variant !== 'plain' && this.variant !== 'outlined') {
      throw new TypeError('Listbox variant must be plain or outlined.');
    }
    validateListboxSize(this.size);
    const options = this.#getOptions();
    if (this.#selectedValues !== undefined) {
      validateListboxValues(this.#selectedValues, this.selectionMode);
    }
    if (this.defaultSelectedValues !== undefined) {
      validateListboxValues(this.defaultSelectedValues, this.selectionMode);
    }
    if (!this.#initialized) {
      this.#selection = [...(this.defaultSelectedValues ?? [])];
      this.#initialized = true;
    }
    const values = this.currentSelectedValues;
    validateListboxValues(values, this.selectionMode);
    for (const option of options) {
      if (option.icon !== undefined && !isIconDefinition(option.icon)) {
        throw new TypeError('Listbox option icon requires a valid IconDefinition.');
      }
    }
    const locale = this.#getLocale();
    try {
      new Intl.Collator(locale);
    } catch {
      throw new TypeError('Listbox locale must be a valid BCP 47 identifier.');
    }
    if (typeof this.size === 'number')
      this.style.setProperty('--_minimum-height', `${this.size}px`);
    else this.style.removeProperty('--_minimum-height');

    if (
      !this.#activeValue ||
      !options.some(option => option.value === this.#activeValue && !option.disabled)
    ) {
      this.#activeValue = getListboxInitialActive(options, values);
    }
  }

  protected override updated(): void {
    if (!this.#restoreFocusAfterUpdate) return;
    this.#restoreFocusAfterUpdate = false;
    if (this.#activeValue) this.#focusOption(this.#activeValue);
  }

  #getOptions(): readonly ListboxOption<IconDefinition>[] {
    return getListboxOptions(this.items);
  }

  #getLocale(): string | undefined {
    if (this.locale !== undefined) {
      if (typeof this.locale !== 'string' || !this.locale.trim()) {
        throw new TypeError('Listbox locale must be a valid BCP 47 identifier.');
      }
      return this.locale;
    }
    return this.closest('[lang]')?.getAttribute('lang')?.trim() || undefined;
  }

  #onFocusIn = (event: FocusEvent): void => {
    if (this.#pointerEntry) return;
    if (this.disabled || !this.#isEnteringFromOutside(event.relatedTarget)) return;
    const focused = getListboxInitialActive(this.#getOptions(), this.currentSelectedValues);
    if (focused && focused !== this.#activeValue) this.#focusOption(focused);
  };

  #onFocusOut = (event: FocusEvent): void => {
    if (event.relatedTarget && !this.#isEnteringFromOutside(event.relatedTarget)) return;
    const resetEntry = () => {
      if (!this.isConnected) return;
      if (this.shadowRoot?.activeElement) return;
      this.#typeahead = '';
      this.#setActive(getListboxInitialActive(this.#getOptions(), this.currentSelectedValues));
    };
    if (event.relatedTarget) {
      this.#typeahead = '';
      this.#setActive(getListboxInitialActive(this.#getOptions(), this.currentSelectedValues));
    } else {
      queueMicrotask(resetEntry);
    }
  };

  #isEnteringFromOutside(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return true;
    return target !== this && !this.contains(target) && !this.renderRoot.contains(target);
  }

  #onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const options = this.#getOptions();
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      this.#focusOption(moveListboxActive(options, this.#activeValue, event.key));
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.readOnly && this.#activeValue) this.#activate(this.#activeValue, 'keyboard');
      return;
    }
    if (event.key.length === 1 && event.key !== ' ' && event.key.trim().length > 0) {
      const locale = this.#getLocale();
      this.#typeahead += event.key;
      const match = findListboxMatch(options, this.#activeValue, this.#typeahead, locale);
      if (match) this.#focusOption(match);
      event.preventDefault();
      return;
    }
    this.#typeahead = '';
  };

  #onOptionClick = (event: MouseEvent): void => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const option = this.#getOptions().find(item => item.value === target.dataset.value);
    if (!option || option.disabled || this.disabled) return;
    this.#focusFromPointer(option.value);
    if (!this.readOnly) this.#activate(option.value, 'pointer');
  };

  #onOptionPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.disabled) return;
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    const option = this.#getOptions().find(item => item.value === target.dataset.value);
    if (!option || option.disabled) return;
    event.preventDefault();
    this.#focusFromPointer(option.value);
  };

  #focusFromPointer(value: string): void {
    this.#pointerEntry = true;
    try {
      this.#focusOption(value);
    } finally {
      this.#pointerEntry = false;
    }
  }

  #focusOption(value: string | null, options?: FocusOptions): void {
    this.#setActive(value);
    if (!value) return;
    const option = [...this.renderRoot.querySelectorAll<HTMLElement>('[role="option"]')].find(
      element => element.dataset.value === value
    );
    if (!option) return;
    option.focus(options);
    try {
      option.scrollIntoView?.({ block: 'nearest' });
    } catch {
      // Some DOM implementations expose scrollIntoView but do not implement its options.
    }
  }

  #setActive(value: string | null): void {
    if (this.#activeValue === value) return;
    this.#activeValue = value;
    for (const option of this.renderRoot.querySelectorAll<HTMLElement>('[role="option"]')) {
      option.tabIndex = option.dataset.value === value ? 0 : -1;
      option.dataset.active = String(option.dataset.value === value);
    }
    this.requestUpdate();
  }

  #activate(value: string, source: ListboxSelectionChangeDetail['source']): void {
    const option = this.#getOptions().find(item => item.value === value);
    if (!option || option.disabled || this.disabled || this.readOnly) return;
    const mode = this.selectionMode;
    if (mode !== 'single' && mode !== 'multiple') {
      throw new TypeError('Listbox selectionMode must be single or multiple.');
    }
    const selected = this.currentSelectedValues;
    if (mode === 'single' && selected.includes(value)) return;
    const next = getListboxSelection(selected, value, mode);
    this.emit<ListboxSelectionChangeDetail>('cosm-selection-change', {
      selectedValues: next,
      value,
      source,
    });
    if (!this.selectedValuesControlled) {
      this.#selection = [...next];
      this.requestUpdate();
    }
  }

  protected override render() {
    const items = this.items;
    const selected = new Set(this.currentSelectedValues);
    const locale = this.#getLocale();
    let optionIndex = 0;
    const renderOption = (option: ListboxOption<IconDefinition>) => {
      const index = optionIndex++;
      const isSelected = selected.has(option.value);
      const isActive = this.#activeValue === option.value;
      const isDisabled = this.disabled || Boolean(option.disabled);
      const descriptionId = option.description ? `${this.#id}-description-${index}` : undefined;
      const optionLabelId = `${this.#id}-option-label-${index}`;
      return html`<div
        part="option"
        class="option"
        id=${`${this.#id}-option-${index}`}
        role="option"
        data-value=${option.value}
        data-active=${String(isActive)}
        data-selected=${String(isSelected)}
        data-disabled=${String(isDisabled)}
        aria-selected=${String(isSelected)}
        aria-disabled=${String(isDisabled)}
        aria-labelledby=${optionLabelId}
        aria-describedby=${descriptionId ?? nothing}
        tabindex=${isActive && !isDisabled ? 0 : -1}
        @pointerdown=${this.#onOptionPointerDown}
        @click=${this.#onOptionClick}
      >
        ${
          option.icon
            ? html`<cosm-icon part="icon" class="icon" .icon=${option.icon} decorative size="sm"></cosm-icon>`
            : nothing
        }
        <span part="content" class="content">
          <span part="option-label" class="option-label" id=${optionLabelId}>${option.label}</span>
          ${
            option.description
              ? html`<span part="description" class="description" id=${descriptionId}>${option.description}</span>`
              : nothing
          }
        </span>
        <span part="indicator" class="indicator" aria-hidden="true">
          ${
            isSelected ? html`<cosm-icon .icon=${check} decorative size="sm"></cosm-icon>` : nothing
          }
        </span>
      </div>`;
    };
    const listDisabled = this.disabled;
    return html`
      <div part="base" class="base">
        <span
          part="label"
          class=${this.labelHidden ? 'label label-hidden' : 'label'}
          id=${`${this.#id}-label`}
        >${this.label}</span>
        <div
          part="list"
          class="list"
          role="listbox"
          aria-labelledby=${`${this.#id}-label`}
          aria-multiselectable=${this.selectionMode === 'multiple' ? 'true' : nothing}
          aria-disabled=${String(listDisabled)}
          aria-readonly=${this.readOnly ? 'true' : nothing}
          lang=${locale ?? nothing}
          @keydown=${this.#onKeyDown}
        >
          ${items.map((item, index) =>
            'options' in item
              ? html`<div
                  part="group"
                  class="group"
                  role="group"
                  aria-labelledby=${`${this.#id}-group-${index}-label`}
                >
                  <div
                    part="group-label"
                    class="group-label"
                    id=${`${this.#id}-group-${index}-label`}
                  >${item.label}</div>
                  ${item.options.map(renderOption)}
                </div>`
              : renderOption(item)
          )}
        </div>
      </div>
    `;
  }
}

define('cosm-listbox', CosmListbox);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-listbox': CosmListbox;
  }

  interface HTMLElementEventMap {
    'cosm-selection-change': CustomEvent<ListboxSelectionChangeDetail>;
  }
}
