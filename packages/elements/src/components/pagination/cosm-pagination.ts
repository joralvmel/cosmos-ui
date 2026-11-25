import {
  type ContractProps,
  getPaginationView,
  type PaginationChangeDetail,
  paginationContract,
} from '@joralvmel/cosmos-core';
import { chevronLeft } from '@joralvmel/cosmos-icons/chevron-left';
import { chevronRight } from '@joralvmel/cosmos-icons/chevron-right';
import { chevronsLeft } from '@joralvmel/cosmos-icons/chevrons-left';
import { chevronsRight } from '@joralvmel/cosmos-icons/chevrons-right';
import { css, html, LitElement, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing } from '../../internal/styles.js';
import '../button/cosm-button.js';
import '../icon-button/cosm-icon-button.js';
import '../icon/cosm-icon.js';

type Props = ContractProps<typeof paginationContract, 'web'>;

const styles = css`
  :host {
    display: inline-block;
    max-width: 100%;
    color: var(--cosm-fg, oklch(0.24 0.01 268));
    font-family: var(--cosm-font-sans, system-ui, sans-serif);
    font-size: var(--cosm-text-sm, 0.875rem);
    --_control-height: var(--cosm-control-md, 2.5rem);
    --_page-font-size: var(--cosm-text-sm, 0.875rem);
  }
  :host([size='sm']) { --_control-height: var(--cosm-control-sm, 2rem); }
  :host([size='lg']) {
    --_control-height: var(--cosm-control-lg, 3rem);
    --_page-font-size: var(--cosm-text-md, 1rem);
  }
  nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--cosm-pagination-gap, var(--cosm-space-xs, 0.25rem));
  }
  cosm-button, cosm-icon-button { flex: 0 0 auto; }
  cosm-button::part(base), cosm-icon-button::part(base) {
    min-height: var(--cosm-pagination-min-height, var(--_control-height));
    min-width: var(--cosm-pagination-min-height, var(--_control-height));
    border-radius: var(--cosm-pagination-radius, var(--cosm-radius-md, 0.5rem));
  }
  cosm-button::part(base) { padding-inline: var(--cosm-space-sm, 0.5rem); }
  cosm-button[data-current]::part(base) {
    /* Resolve the composed Button's state colors when no pagination hook is supplied. */
    background: var(--cosm-pagination-current-background, var(--_bg));
    color: var(--cosm-pagination-current-color, var(--_fg));
    border-color: var(--cosm-pagination-current-border, var(--_border));
  }
  [part='summary'] { padding-inline: var(--cosm-space-sm, 0.5rem); }
  [part='ellipsis'] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--cosm-pagination-min-height, var(--_control-height));
    min-width: var(--cosm-pagination-min-height, var(--_control-height));
    padding-inline: var(--cosm-space-sm, 0.5rem);
    border: 1px solid transparent;
    font-size: var(--_page-font-size);
    font-weight: var(--cosm-button-font-weight, var(--cosm-weight-semibold, 600));
  }
  .cell { display: inline-grid; place-items: center; font-variant-numeric: tabular-nums; }
  .cell::before {
    content: attr(data-total);
    visibility: hidden;
    grid-area: 1 / 1;
  }
  .cell > span { grid-area: 1 / 1; }
`;

/**
 * Button-based, localized pagination with controlled or autonomous state.
 * @tag cosm-pagination
 * @csspart base - Navigation landmark.
 * @csspart control - Navigation control.
 * @csspart page - Numbered page control.
 * @csspart current - Current page control.
 * @csspart ellipsis - Decorative omitted range.
 * @csspart summary - Compact summary.
 * @fires {CustomEvent<PaginationChangeDetail>} cosm-change - Proposed page.
 * @cssprop --cosm-pagination-gap - Control gap.
 * @cssprop --cosm-pagination-min-height - Minimum control dimensions.
 * @cssprop --cosm-pagination-radius - Control corner radius.
 * @cssprop --cosm-pagination-current-background - Current background.
 * @cssprop --cosm-pagination-current-color - Current foreground.
 * @cssprop --cosm-pagination-current-border - Current border.
 */
export class CosmPagination extends CosmElement {
  static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  static override properties = {
    totalPages: { type: Number, attribute: 'total-pages' },
    page: { type: Number, noAccessor: true },
    defaultPage: { type: Number, attribute: 'default-page' },
    label: {},
    previousLabel: { attribute: 'previous-label' },
    nextLabel: { attribute: 'next-label' },
    firstLabel: { attribute: 'first-label' },
    lastLabel: { attribute: 'last-label' },
    pageLabel: { attribute: 'page-label' },
    summaryLabel: { attribute: 'summary-label' },
    locale: {},
    direction: {},
    presentation: { reflect: true },
    variant: { reflect: true },
    size: { reflect: true },
    showFirstLast: { type: Boolean, attribute: 'show-first-last' },
    disabled: { type: Boolean, reflect: true },
  };
  static override styles = [boxSizing, styles];

  declare totalPages: number;
  declare defaultPage: number;
  declare label: string;
  declare previousLabel: string;
  declare nextLabel: string;
  declare firstLabel: string;
  declare lastLabel: string;
  declare pageLabel: string;
  declare summaryLabel: string;
  declare locale: string | undefined;
  declare direction: NonNullable<Props['direction']>;
  declare presentation: NonNullable<Props['presentation']>;
  declare variant: NonNullable<Props['variant']>;
  declare size: NonNullable<Props['size']>;
  declare showFirstLast: boolean;
  declare disabled: boolean;

  pageControlled = false;
  #requested: number | undefined;
  #owned = 1;
  #effective = 1;
  #initialized = false;
  #view: ReturnType<typeof getPaginationView> | undefined;
  #restoreFocus = false;

  constructor() {
    super();
    const defaults = paginationContract.props;
    this.totalPages = Number.NaN;
    this.defaultPage = defaults.defaultPage.default;
    this.label = '';
    this.previousLabel = defaults.previousLabel.default;
    this.nextLabel = defaults.nextLabel.default;
    this.firstLabel = defaults.firstLabel.default;
    this.lastLabel = defaults.lastLabel.default;
    this.pageLabel = defaults.pageLabel.default;
    this.summaryLabel = defaults.summaryLabel.default;
    this.locale = undefined;
    this.direction = defaults.direction.default;
    this.presentation = defaults.presentation.default;
    this.variant = defaults.variant.default;
    this.size = defaults.size.default;
    this.showFirstLast = defaults.showFirstLast.default;
    this.disabled = defaults.disabled.default;
  }

  protected override willUpdate(): void {
    if (this.shadowRoot?.activeElement) this.#restoreFocus = true;
    if (!this.#initialized) {
      this.#owned = this.defaultPage;
      this.#initialized = true;
    }
    this.#view = getPaginationView(
      {
        totalPages: this.totalPages,
        defaultPage: this.defaultPage,
        page: this.pageControlled ? this.#requested : undefined,
        label: this.label,
        previousLabel: this.previousLabel,
        nextLabel: this.nextLabel,
        firstLabel: this.firstLabel,
        lastLabel: this.lastLabel,
        pageLabel: this.pageLabel,
        summaryLabel: this.summaryLabel,
        locale: this.locale,
        direction: this.direction,
        presentation: this.presentation,
        variant: this.variant,
        size: this.size,
        disabled: this.disabled,
        showFirstLast: this.showFirstLast,
      },
      this.pageControlled ? (this.#requested ?? this.#owned) : this.#owned
    );
    this.#effective = this.#view.page;
    if (!this.pageControlled) this.#owned = this.#effective;
  }

  protected override async updated(): Promise<void> {
    if (!this.#restoreFocus) return;
    this.#restoreFocus = false;
    const controls = [
      ...this.renderRoot.querySelectorAll<HTMLElement>('cosm-button, cosm-icon-button'),
    ];
    await Promise.all(controls.map(control => (control as LitElement).updateComplete));
    const root = this.getRootNode();
    if (
      'activeElement' in root &&
      root.activeElement &&
      root.activeElement !== this &&
      root.activeElement !== this.ownerDocument.body
    )
      return;
    const focused = this.shadowRoot?.activeElement;
    if (focused && !focused.hasAttribute('data-unavailable')) return;
    const target =
      controls.find(
        control => control.hasAttribute('data-current') && !control.hasAttribute('data-unavailable')
      ) ?? controls.find(control => !control.hasAttribute('data-unavailable'));
    target?.focus({ preventScroll: true });
  }

  get page(): number {
    return this.#effective;
  }
  set page(value: number | undefined) {
    this.#requested = value;
    this.pageControlled = value !== undefined;
    this.requestUpdate();
  }

  #activate(event: Event, page: number): void {
    event.stopPropagation();
    if (this.disabled || page < 1 || page > this.totalPages || page === this.page) return;
    this.#restoreFocus = Boolean(this.shadowRoot?.activeElement);
    if (!this.pageControlled) this.#owned = page;
    this.requestUpdate();
    this.emit<PaginationChangeDetail>('cosm-change', { page });
  }

  #navigation(kind: 'first' | 'previous' | 'next' | 'last') {
    const previous = kind === 'first' || kind === 'previous';
    const rtl = this.direction === 'rtl';
    const edge = kind === 'first' || kind === 'last';
    const icon = edge
      ? previous !== rtl
        ? chevronsLeft
        : chevronsRight
      : previous !== rtl
        ? chevronLeft
        : chevronRight;
    const page =
      kind === 'first' ? 1 : kind === 'last' ? this.totalPages : this.page + (previous ? -1 : 1);
    const disabled = this.disabled || (previous ? this.page === 1 : this.page === this.totalPages);
    return html`<cosm-icon-button part="control" data-kind=${kind}
      ?data-unavailable=${disabled}
      .label=${this[`${kind}Label`]} .variant=${'ghost'} .size=${this.size}
      .disabled=${disabled} .type=${'button'}
      @cosm-press=${(event: Event) => this.#activate(event, page)}>
      <cosm-icon .icon=${icon} .size=${18}></cosm-icon>
    </cosm-icon-button>`;
  }

  protected override render() {
    const view = this.#view;
    if (!view || this.totalPages <= 1) return nothing;
    const cell = (content: string) =>
      html`<span class="cell" data-total=${view.number(this.totalPages)}><span>${content}</span></span>`;
    return html`<nav part="base" aria-label=${this.label} dir=${this.direction}>
      ${this.showFirstLast ? this.#navigation('first') : nothing}
      ${this.#navigation('previous')}
      ${
        this.presentation === 'compact'
          ? html`<span part="summary">${view.summary}</span>`
          : repeat(
              view.items,
              (item, index) => (typeof item === 'number' ? item : `gap-${index}`),
              item =>
                typeof item !== 'number'
                  ? html`<span part="ellipsis" aria-hidden="true">${cell('…')}</span>`
                  : html`<cosm-button part=${item === this.page ? 'page current' : 'page'}
                data-page=${item} ?data-current=${item === this.page}
                ?data-unavailable=${this.disabled}
                .currentPage=${item === this.page} .label=${view.pageName(item)}
                .variant=${item === this.page ? this.variant : 'ghost'}
                .size=${this.size} .disabled=${this.disabled} .type=${'button'}
                @cosm-press=${(event: Event) => this.#activate(event, item)}
              >${cell(view.number(item))}</cosm-button>`
            )
      }
      ${this.#navigation('next')}
      ${this.showFirstLast ? this.#navigation('last') : nothing}
    </nav>`;
  }
}

define('cosm-pagination', CosmPagination);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-pagination': CosmPagination;
  }
}
