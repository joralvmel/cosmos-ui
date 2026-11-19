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
  .heading-trigger {
    border: 0;
    border-radius: var(--cosm-radius-sm, 0.25rem);
    padding: 0.125rem;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .heading-trigger:hover,
  .picker-option:hover:not(:disabled) {
    background: var(--cosm-neutral-3, color-mix(in oklab, currentColor 10%, transparent));
  }
  .heading-trigger:disabled {
    color: var(--cosm-calendar-muted-color, var(--cosm-fg-muted, currentColor));
    cursor: not-allowed;
  }
  .heading-trigger:focus-visible,
  .picker-option:focus-visible {
    outline: 2px solid var(--cosm-calendar-focus);
    outline-offset: 2px;
  }
  .picker-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--cosm-calendar-gap, var(--cosm-space-2xs, 0.125rem));
  }
  .month-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .picker-option {
    min-inline-size: 44px;
    min-block-size: 44px;
    border: 1px solid transparent;
    border-radius: var(--cosm-calendar-radius, var(--cosm-radius-md, 0.5rem));
    background: transparent;
    color: var(--cosm-calendar-color, var(--cosm-fg, currentColor));
    font: inherit;
    cursor: pointer;
  }
  .picker-option[aria-pressed='true'] {
    border-color: var(--cosm-calendar-focus);
    font-weight: var(--cosm-weight-semibold, 600);
  }
  .picker-option:disabled {
    color: var(--cosm-calendar-muted-color, var(--cosm-fg-muted, currentColor));
    cursor: not-allowed;
  }
  .picker-range {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--cosm-space-xs, 0.25rem);
    margin-block-end: var(--cosm-space-xs, 0.25rem);
    text-align: center;
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
 * An inline, localized Gregorian calendar for selecting one date with direct month and year navigation.
 *
 * @tag cosm-calendar
 * @csspart base - Calendar root.
 * @csspart header - Month heading and navigation controls.
 * @csspart previous - Previous-month navigation button.
 * @csspart heading - Localized month and year heading.
 * @csspart next - Next-month navigation button.
 * @csspart month-trigger - Button that opens direct month selection.
 * @csspart year-trigger - Button that opens direct year selection.
 * @csspart month-option - Month choice in the month selection view.
 * @csspart year-option - Year choice in the year selection view.
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
  #navigationView: 'days' | 'months' | 'years' = 'days';
  #yearPageStart = 1;
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
    if (this.#navigationView === 'years') {
      const start = this.#yearPageStart + months * 12;
      return start >= 1 && start <= 9999 && this.#hasSelectableYearInRange(start, start + 11);
    }
    if (this.#navigationView === 'months') {
      const year = parseCalendarDate(this.#visibleMonth).year + months;
      return year >= 1 && year <= 9999 && this.#hasSelectableYear(year);
    }
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
    if (this.#navigationView === 'years') {
      this.#yearPageStart += months * 12;
      this.requestUpdate();
      return;
    }
    if (this.#navigationView === 'months') {
      const { year, month } = parseCalendarDate(this.#visibleMonth);
      const targetYear = year + months;
      const targetMonth = this.#monthForYear(targetYear, month);
      if (targetMonth !== undefined) this.#setVisibleMonth(targetMonth, localeInfo);
      return;
    }
    this.#activeDate = addCalendarMonths(this.#activeDate, months);
    this.#visibleMonth = addCalendarMonths(this.#visibleMonth, months);
    this.requestUpdate();
  }

  #hasSelectableMonth(month: string): boolean {
    const dates = getCalendarMonthDates(month, 0).filter(
      (date): date is string => date !== undefined && date.slice(0, 7) === month.slice(0, 7)
    );
    const first = dates[0];
    const last = dates.at(-1);
    return (
      !this.disabled &&
      first !== undefined &&
      last !== undefined &&
      (this.min === undefined || last >= this.min) &&
      (this.max === undefined || first <= this.max)
    );
  }

  #hasSelectableYear(year: number): boolean {
    const first = `${String(year).padStart(4, '0')}-01-01`;
    const last = `${String(year).padStart(4, '0')}-12-31`;
    return (
      !this.disabled &&
      year >= 1 &&
      year <= 9999 &&
      (this.min === undefined || last >= this.min) &&
      (this.max === undefined || first <= this.max)
    );
  }

  #hasSelectableYearInRange(start: number, end: number): boolean {
    for (let year = start; year <= Math.min(end, 9999); year++) {
      if (this.#hasSelectableYear(year)) return true;
    }
    return false;
  }

  #monthForYear(year: number, preferredMonth: number): string | undefined {
    const month = Array.from({ length: 12 }, (_, index) => index + 1)
      .filter(value =>
        this.#hasSelectableMonth(
          `${String(year).padStart(4, '0')}-${String(value).padStart(2, '0')}-01`
        )
      )
      .sort((left, right) => Math.abs(left - preferredMonth) - Math.abs(right - preferredMonth))[0];
    return month === undefined
      ? undefined
      : `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`;
  }

  #setVisibleMonth(month: string, localeInfo: CalendarLocaleInfo) {
    if (!this.#hasSelectableMonth(month)) return;
    const current = parseCalendarDate(this.#visibleMonth);
    const target = parseCalendarDate(month);
    const monthDelta = (target.year - current.year) * 12 + target.month - current.month;
    const candidate = tryAddCalendarMonths(this.#activeDate, monthDelta);
    const selectableDates = getCalendarMonthDates(month, localeInfo.firstDay).filter(
      (date): date is string =>
        date !== undefined &&
        date.slice(0, 7) === month.slice(0, 7) &&
        isCalendarDateSelectable(date, this.min, this.max)
    );
    this.#visibleMonth = month;
    this.#activeDate =
      candidate && selectableDates.includes(candidate) ? candidate : (selectableDates[0] ?? month);
    this.#pendingFocusDate = this.#activeDate;
    this.requestUpdate();
  }

  #onMonthTrigger = () => {
    this.#navigationView = 'months';
    this.requestUpdate();
  };

  #onYearTrigger = () => {
    const { year } = parseCalendarDate(this.#visibleMonth);
    this.#yearPageStart = Math.max(1, Math.floor((year - 1) / 10) * 10);
    this.#navigationView = 'years';
    this.requestUpdate();
  };

  #onMonthSelect = (event: MouseEvent, localeInfo: CalendarLocaleInfo) => {
    const button = event.currentTarget as HTMLButtonElement;
    const month = button.dataset.month;
    if (!month) return;
    const year = parseCalendarDate(this.#visibleMonth).year;
    this.#setVisibleMonth(`${String(year).padStart(4, '0')}-${month}-01`, localeInfo);
    this.#navigationView = 'days';
    this.requestUpdate();
  };

  #onYearSelect = (event: MouseEvent, localeInfo: CalendarLocaleInfo) => {
    const button = event.currentTarget as HTMLButtonElement;
    const year = Number(button.dataset.year);
    if (!Number.isInteger(year) || !this.#hasSelectableYear(year)) return;
    const month = this.#monthForYear(year, parseCalendarDate(this.#visibleMonth).month);
    if (month) this.#setVisibleMonth(month, localeInfo);
    this.#navigationView = 'days';
    this.requestUpdate();
  };

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
    const currentDate = parseCalendarDate(this.#visibleMonth);
    const monthName = new Intl.DateTimeFormat(localeInfo.locale, {
      calendar: 'gregory',
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(currentDate.year, currentDate.month - 1, 1, 12)));
    const yearName = new Intl.NumberFormat(localeInfo.locale, { useGrouping: false }).format(
      currentDate.year
    );
    const monthLabel = formatCalendarMonth(this.#visibleMonth, localeInfo.locale);
    const relative = new Intl.RelativeTimeFormat(localeInfo.locale, { numeric: 'auto' });
    const relativeUnit = this.#navigationView === 'days' ? 'month' : 'year';
    const relativeStep = this.#navigationView === 'years' ? 12 : 1;
    const previousLabel = relative.format(-relativeStep, relativeUnit);
    const nextLabel = relative.format(relativeStep, relativeUnit);
    const formatDay = new Intl.NumberFormat(localeInfo.locale, { useGrouping: false });
    const yearPageEnd = Math.min(9999, this.#yearPageStart + 11);
    const yearPageLabel = `${new Intl.NumberFormat(localeInfo.locale, {
      useGrouping: false,
    }).format(
      this.#yearPageStart
    )}–${new Intl.NumberFormat(localeInfo.locale, { useGrouping: false }).format(yearPageEnd)}`;
    const monthOptions = Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1).padStart(2, '0');
      const monthStart = `${String(currentDate.year).padStart(4, '0')}-${month}-01`;
      return {
        month,
        label: new Intl.DateTimeFormat(localeInfo.locale, {
          calendar: 'gregory',
          month: 'long',
          timeZone: 'UTC',
        }).format(new Date(Date.UTC(currentDate.year, index, 1, 12))),
        selected: currentDate.month === index + 1,
        disabled: !this.#hasSelectableMonth(monthStart),
      };
    });
    const yearOptions = Array.from(
      { length: yearPageEnd - this.#yearPageStart + 1 },
      (_, index) => {
        const year = this.#yearPageStart + index;
        return {
          year,
          label: new Intl.NumberFormat(localeInfo.locale, { useGrouping: false }).format(year),
          selected: currentDate.year === year,
          disabled: !this.#hasSelectableYear(year),
        };
      }
    );
    const monthPickerId = `${this.#headingId}-month-picker`;
    const yearPickerId = `${this.#headingId}-year-picker`;

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
          <button
            class="heading-trigger"
            type="button"
            part="month-trigger"
            aria-expanded=${this.#navigationView === 'months' ? 'true' : 'false'}
            aria-controls=${monthPickerId}
            ?disabled=${this.disabled}
            @click=${this.#onMonthTrigger}
          >
            ${monthName}
          </button>
          <button
            class="heading-trigger"
            type="button"
            part="year-trigger"
            aria-expanded=${this.#navigationView === 'years' ? 'true' : 'false'}
            aria-controls=${yearPickerId}
            ?disabled=${this.disabled}
            @click=${this.#onYearTrigger}
          >
            ${yearName}
          </button>
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
      ${
        this.#navigationView === 'months'
          ? html`<div
            id=${monthPickerId}
            class="picker-grid month-grid"
            role="group"
            aria-label=${monthLabel}
          >
            ${monthOptions.map(
              option => html`<button
                class="picker-option"
                part="month-option"
                type="button"
                data-month=${option.month}
                aria-pressed=${option.selected ? 'true' : 'false'}
                ?disabled=${option.disabled}
                @click=${(event: MouseEvent) => this.#onMonthSelect(event, localeInfo)}
              >
                ${option.label}
              </button>`
            )}
          </div>`
          : this.#navigationView === 'years'
            ? html`<div
              id=${yearPickerId}
              role="group"
              aria-label=${yearPageLabel}
            >
              <div class="picker-range">
                <cosm-button
                  size="sm"
                  variant="ghost"
                  tone="neutral"
                  .label=${previousLabel}
                  .disabled=${!this.#canNavigate(-1, localeInfo)}
                  @cosm-press=${() => this.#navigate(-1, localeInfo)}
                >
                  <cosm-icon
                    .icon=${localeInfo.direction === 'rtl' ? chevronRight : chevronLeft}
                    size="sm"
                    decorative
                  ></cosm-icon>
                </cosm-button>
                <span aria-live="polite">${yearPageLabel}</span>
                <cosm-button
                  size="sm"
                  variant="ghost"
                  tone="neutral"
                  .label=${nextLabel}
                  .disabled=${!this.#canNavigate(1, localeInfo)}
                  @cosm-press=${() => this.#navigate(1, localeInfo)}
                >
                  <cosm-icon
                    .icon=${localeInfo.direction === 'rtl' ? chevronLeft : chevronRight}
                    size="sm"
                    decorative
                  ></cosm-icon>
                </cosm-button>
              </div>
              <div class="picker-grid">
                ${yearOptions.map(
                  option => html`<button
                    class="picker-option"
                    part="year-option"
                    type="button"
                    data-year=${option.year}
                    aria-pressed=${option.selected ? 'true' : 'false'}
                    ?disabled=${option.disabled}
                    @click=${(event: MouseEvent) => this.#onYearSelect(event, localeInfo)}
                  >
                    ${option.label}
                  </button>`
                )}
              </div>
            </div>`
            : html`<div class="calendar-scroll">
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
      </div>`
      }
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
