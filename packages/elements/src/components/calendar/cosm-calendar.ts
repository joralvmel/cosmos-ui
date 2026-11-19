import type { ContractProps } from '@joralvmel/cosmos-core';
import {
  addCalendarMonths,
  type CalendarChangeDetail,
  type CalendarLocaleInfo,
  calendarContract,
  canNavigateCalendarMonth,
  formatCalendarDate,
  formatCalendarMonth,
  getCalendarLocaleInfo,
  getCalendarMonth,
  getCalendarMonthDates,
  getCalendarToday,
  getCalendarTodayLabel,
  getCalendarWeekdayNames,
  isCalendarDateSelectable,
  parseCalendarDate,
  tryAddCalendarDays,
  tryAddCalendarMonths,
  validateCalendarBounds,
} from '@joralvmel/cosmos-core';
import { chevronLeft } from '@joralvmel/cosmos-icons/chevron-left';
import { chevronRight } from '@joralvmel/cosmos-icons/chevron-right';
import { css, html, LitElement, nothing } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing, focusRing } from '../../internal/styles.js';
import '../button/cosm-button.js';
import '../icon/cosm-icon.js';

type Props = ContractProps<typeof calendarContract, 'web'>;

const styles = css`
  :host {
    --cosm-calendar-focus: var(--cosm-primary, oklch(0.55 0.2 268));
    display: block;
    min-inline-size: 0;
    inline-size: 100%;
    color: var(--cosm-calendar-color, var(--cosm-fg, currentColor));
    background: var(--cosm-calendar-background, var(--cosm-bg, transparent));
    font-family: var(--cosm-font-sans, ui-sans-serif, system-ui, sans-serif);
  }
  .base {
    --cosm-focus-ring: var(--cosm-calendar-focus, var(--cosm-primary, oklch(0.55 0.2 268)));
    display: grid;
    gap: var(--cosm-space-sm, 0.5rem);
    color: var(--cosm-calendar-color, var(--cosm-fg, currentColor));
    background: var(--cosm-calendar-background, var(--cosm-bg, transparent));
  }
  .header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--cosm-space-xs, 0.25rem);
  }
  .heading {
    margin: 0;
    text-align: center;
    font: inherit;
    font-size: var(--cosm-text-md, 1rem);
    font-weight: var(--cosm-weight-semibold, 600);
  }
  .weekdays,
  .week {
    display: grid;
    grid-template-columns: repeat(
      7,
      minmax(max(44px, var(--cosm-calendar-day-size, 2.75rem)), 1fr)
    );
    gap: var(--cosm-calendar-gap, var(--cosm-space-2xs, 0.125rem));
  }
  .calendar-scroll {
    inline-size: 100%;
    max-inline-size: 100%;
    min-inline-size: 0;
    overflow-x: auto;
  }
  .weekdays {
    color: var(--cosm-calendar-muted-color, var(--cosm-fg-muted, currentColor));
    font-size: var(--cosm-text-sm, 0.875rem);
    text-align: center;
  }
  .weekday,
  .empty {
    display: grid;
    min-block-size: max(44px, var(--cosm-calendar-day-size, 2.75rem));
    place-items: center;
  }
  .weekday {
    overflow: hidden;
    font-weight: var(--cosm-weight-medium, 500);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .day {
    display: grid;
    inline-size: 100%;
    min-inline-size: max(44px, var(--cosm-calendar-day-size, 2.75rem));
    min-block-size: max(44px, var(--cosm-calendar-day-size, 2.75rem));
    aspect-ratio: 1;
    place-items: center;
    border: 1px solid transparent;
    border-radius: var(--cosm-calendar-radius, var(--cosm-radius-md, 0.5rem));
    background: transparent;
    color: var(--cosm-calendar-color, var(--cosm-fg, currentColor));
    font: inherit;
    font-size: var(--cosm-text-sm, 0.875rem);
    cursor: pointer;
  }
  .day:hover:not([data-disabled='true']) {
    background: var(--cosm-neutral-3, color-mix(in oklab, currentColor 10%, transparent));
  }
  .day:active:not([data-disabled='true']) {
    background: var(--cosm-neutral-4, color-mix(in oklab, currentColor 16%, transparent));
  }
  .day[data-outside-month='true'] {
    color: var(--cosm-calendar-muted-color, var(--cosm-fg-muted, currentColor));
  }
  .day[data-disabled='true'] {
    color: var(--cosm-calendar-muted-color, var(--cosm-fg-muted, currentColor));
    cursor: not-allowed;
  }
  .day[data-selected='true'] {
    background: var(
      --cosm-calendar-selected-background,
      var(--cosm-primary, oklch(0.55 0.2 268))
    );
    color: var(
      --cosm-calendar-selected-color,
      var(--cosm-primary-fg, oklch(1 0 0))
    );
    font-weight: var(--cosm-weight-semibold, 600);
  }
  .day[aria-current='date'] {
    box-shadow: inset 0 0 0 1px
      var(--cosm-calendar-today-border, var(--cosm-calendar-color, currentColor));
  }
  :host([disabled]) .base {
    opacity: 0.6;
  }
  @media (forced-colors: active) {
    .day[data-selected='true'] {
      outline: 1px solid Highlight;
    }
    .day[aria-current='date'] {
      border-color: ButtonText;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .day {
      transition: none;
    }
  }
`;

let instance = 0;

/**
 * An inline, localized Gregorian calendar for selecting one date.
 *
 * @tag cosm-calendar
 * @csspart base - Calendar root.
 * @csspart header - Month heading and navigation controls.
 * @csspart previous - Previous-month navigation button.
 * @csspart heading - Localized month and year heading.
 * @csspart next - Next-month navigation button.
 * @csspart weekday - Localized weekday heading.
 * @csspart grid - Seven-column date grid.
 * @csspart day - Date button, including adjacent-month dates.
 * @fires {CustomEvent<CalendarChangeDetail>} cosm-change - Proposed selected date.
 * @cssprop --cosm-calendar-background - Calendar surface background.
 * @cssprop --cosm-calendar-color - Primary calendar text color.
 * @cssprop --cosm-calendar-muted-color - Adjacent-month and weekday text color.
 * @cssprop --cosm-calendar-selected-background - Selected-date background.
 * @cssprop --cosm-calendar-selected-color - Selected-date text color.
 * @cssprop --cosm-calendar-day-size - Minimum date target dimensions.
 * @cssprop --cosm-calendar-gap - Space between date targets.
 * @cssprop --cosm-calendar-radius - Date target corner radius.
 * @cssprop --cosm-calendar-focus - Visible keyboard focus indicator color.
 * @cssprop --cosm-calendar-today-border - Non-color-only today marker.
 */
export class CosmCalendar extends CosmElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  static override properties = {
    value: { attribute: false, noAccessor: true },
    defaultValue: { attribute: 'default-value' },
    min: {},
    max: {},
    locale: {},
    disabled: { type: Boolean, reflect: true },
  };

  static override styles = [boxSizing, focusRing, styles];

  declare defaultValue: Props['defaultValue'];
  declare min: Props['min'];
  declare max: Props['max'];
  declare locale: Props['locale'];
  declare disabled: NonNullable<Props['disabled']>;

  valueControlled = false;
  #value: Props['value'];
  #valueEdited = false;
  #activeDate: string;
  #visibleMonth: string;
  #pendingFocusDate: string | undefined;
  readonly #headingId = `cosm-calendar-heading-${++instance}`;

  constructor() {
    super();
    this.defaultValue = undefined;
    this.min = undefined;
    this.max = undefined;
    this.locale = undefined;
    this.disabled = calendarContract.props.disabled.default;
    this.#activeDate = getCalendarToday();
    this.#visibleMonth = getCalendarMonth(this.#activeDate);
  }

  get value(): Props['value'] {
    return this.#value;
  }

  set value(value: Props['value']) {
    this.valueControlled = value !== undefined;
    this.#setValue(value);
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>) {
    validateCalendarBounds(this.min, this.max);
    if (this.defaultValue !== undefined) parseCalendarDate(this.defaultValue);
    if (this.value !== undefined) parseCalendarDate(this.value);
    if (changed.has('defaultValue') && !this.valueControlled && !this.#valueEdited) {
      this.#setValue(this.defaultValue);
      this.#syncViewTo(this.defaultValue ?? getCalendarToday());
    }
    if (changed.has('value') && this.valueControlled && this.value !== undefined) {
      this.#syncViewTo(this.value);
    }
  }

  protected override updated() {
    const date = this.#pendingFocusDate;
    if (!date) return;
    this.#pendingFocusDate = undefined;
    const button = [...this.renderRoot.querySelectorAll<HTMLButtonElement>('[data-date]')].find(
      candidate => candidate.dataset.date === date
    );
    button?.focus();
  }

  #setValue(value: Props['value']) {
    const old = this.#value;
    this.#value = value;
    this.requestUpdate('value', old);
  }

  #syncViewTo(value: string) {
    this.#activeDate = value;
    this.#visibleMonth = getCalendarMonth(value);
  }

  #canNavigate(months: -1 | 1, localeInfo: CalendarLocaleInfo): boolean {
    return canNavigateCalendarMonth(
      this.#visibleMonth,
      months,
      localeInfo.firstDay,
      this.min,
      this.max,
      this.disabled
    );
  }

  #navigate(months: -1 | 1, localeInfo: CalendarLocaleInfo) {
    if (!this.#canNavigate(months, localeInfo)) return;
    this.#activeDate = addCalendarMonths(this.#activeDate, months);
    this.#visibleMonth = addCalendarMonths(this.#visibleMonth, months);
    this.requestUpdate();
  }

  #moveActiveDate(value: string) {
    this.#activeDate = value;
    this.#visibleMonth = getCalendarMonth(value);
    this.#pendingFocusDate = value;
    this.requestUpdate();
  }

  #onPrevious = () => this.#navigate(-1, getCalendarLocaleInfo(this.locale));
  #onNext = () => this.#navigate(1, getCalendarLocaleInfo(this.locale));

  #onDayFocus = (event: FocusEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const date = button.dataset.date;
    if (date && date !== this.#activeDate) {
      this.#activeDate = date;
      this.requestUpdate();
    }
  };

  #onDayClick = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const date = button.dataset.date;
    if (!date || this.disabled || !isCalendarDateSelectable(date, this.min, this.max)) return;
    const changed = this.value !== date;
    this.#activeDate = date;
    this.#visibleMonth = getCalendarMonth(date);
    if (!changed) {
      this.requestUpdate();
      return;
    }
    if (!this.valueControlled) {
      this.#valueEdited = true;
      this.#setValue(date);
    }
    this.emit<CalendarChangeDetail>('cosm-change', { value: date });
    this.requestUpdate();
  };

  #onGridKeydown = (event: KeyboardEvent, localeInfo: CalendarLocaleInfo) => {
    if (event.defaultPrevented || this.disabled) return;
    const rtlDelta = localeInfo.direction === 'rtl' ? -1 : 1;
    const movement: Partial<Record<string, number>> = {
      ArrowLeft: -rtlDelta,
      ArrowRight: rtlDelta,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    let next: string | undefined;
    const day = parseCalendarDate(this.#activeDate);
    const delta = movement[event.key];
    if (delta !== undefined) {
      next = tryAddCalendarDays(this.#activeDate, delta);
    } else if (event.key === 'Home' || event.key === 'End') {
      const offset = (day.weekday - localeInfo.firstDay + 7) % 7;
      next = tryAddCalendarDays(this.#activeDate, event.key === 'Home' ? -offset : 6 - offset);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      next = tryAddCalendarMonths(
        this.#activeDate,
        (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1)
      );
    }
    if (!next) return;
    event.preventDefault();
    event.stopPropagation();
    this.#moveActiveDate(next);
  };

  protected override render() {
    const localeInfo = getCalendarLocaleInfo(this.locale);
    const weekdayNames = getCalendarWeekdayNames(localeInfo.locale, localeInfo.firstDay);
    const today = getCalendarToday();
    const dates = getCalendarMonthDates(this.#visibleMonth, localeInfo.firstDay);
    const monthLabel = formatCalendarMonth(this.#visibleMonth, localeInfo.locale);
    const previousLabel = new Intl.RelativeTimeFormat(localeInfo.locale, {
      numeric: 'auto',
    }).format(-1, 'month');
    const nextLabel = new Intl.RelativeTimeFormat(localeInfo.locale, {
      numeric: 'auto',
    }).format(1, 'month');
    const formatDay = new Intl.NumberFormat(localeInfo.locale, { useGrouping: false });

    return html`<div
      part="base"
      class="base"
      dir=${localeInfo.direction}
      aria-disabled=${this.disabled ? 'true' : 'false'}
    >
      <div part="header" class="header">
        <cosm-button
          part="previous"
          size="sm"
          variant="ghost"
          tone="neutral"
          .label=${previousLabel}
          .disabled=${!this.#canNavigate(-1, localeInfo)}
          @cosm-press=${this.#onPrevious}
        >
          <cosm-icon
            .icon=${localeInfo.direction === 'rtl' ? chevronRight : chevronLeft}
            size="sm"
            decorative
          ></cosm-icon>
        </cosm-button>
        <h2 part="heading" class="heading" id=${this.#headingId} aria-live="polite" aria-atomic="true">
          ${monthLabel}
        </h2>
        <cosm-button
          part="next"
          size="sm"
          variant="ghost"
          tone="neutral"
          .label=${nextLabel}
          .disabled=${!this.#canNavigate(1, localeInfo)}
          @cosm-press=${this.#onNext}
        >
          <cosm-icon
            .icon=${localeInfo.direction === 'rtl' ? chevronLeft : chevronRight}
            size="sm"
            decorative
          ></cosm-icon>
        </cosm-button>
      </div>
      <div class="calendar-scroll">
        <div class="weekdays" role="row">
          ${weekdayNames.map(
            weekday =>
              html`<div part="weekday" class="weekday" role="columnheader" aria-label=${weekday.long}>
                ${weekday.short}
              </div>`
          )}
        </div>
        <div
          part="grid"
          role="grid"
          aria-labelledby=${this.#headingId}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          @keydown=${(event: KeyboardEvent) => this.#onGridKeydown(event, localeInfo)}
        >
          ${Array.from({ length: dates.length / 7 }, (_, weekIndex) => {
            const week = dates.slice(weekIndex * 7, weekIndex * 7 + 7);
            return html`<div class="week" role="row">
              ${week.map(date => {
                if (!date)
                  return html`<div class="empty" role="gridcell" aria-hidden="true"></div>`;
                const parts = parseCalendarDate(date);
                const selectable = isCalendarDateSelectable(date, this.min, this.max);
                const todayDate = date === today;
                const label = `${formatCalendarDate(date, localeInfo.locale)}${
                  todayDate ? `, ${getCalendarTodayLabel(localeInfo.locale)}` : ''
                }`;
                return html`<div
                  role="gridcell"
                  aria-selected=${this.value === date ? 'true' : 'false'}
                  aria-disabled=${selectable && !this.disabled ? nothing : 'true'}
                >
                  <button
                    part="day"
                    class="day"
                    type="button"
                    data-date=${date}
                    data-selected=${this.value === date ? 'true' : 'false'}
                    data-disabled=${selectable && !this.disabled ? 'false' : 'true'}
                    data-outside-month=${
                      date.slice(0, 7) === this.#visibleMonth.slice(0, 7) ? 'false' : 'true'
                    }
                    aria-label=${label}
                    aria-disabled=${selectable && !this.disabled ? nothing : 'true'}
                    aria-current=${todayDate ? 'date' : nothing}
                    tabindex=${!this.disabled && this.#activeDate === date ? 0 : -1}
                    ?disabled=${this.disabled}
                    @focus=${this.#onDayFocus}
                    @click=${this.#onDayClick}
                  >
                    ${formatDay.format(parts.day)}
                  </button>
                </div>`;
              })}
            </div>`;
          })}
        </div>
      </div>
    </div>`;
  }
}

define('cosm-calendar', CosmCalendar);

declare global {
  interface HTMLElementTagNameMap {
    'cosm-calendar': CosmCalendar;
  }
  interface HTMLElementEventMap {
    'cosm-change': CustomEvent<CalendarChangeDetail>;
  }
}
