import { defineContract } from '../contract.js';

/** Proposed calendar selection. */
export interface CalendarChangeDetail {
  value: string;
}

/**
 * An inline Gregorian calendar with controlled or autonomous single-date selection.
 *
 * | State | Autonomous | Controlled | Event |
 * | --- | --- | --- | --- |
 * | value | Starts at defaultValue and commits enabled date selection | A supplied value waits for the owner | change |
 */
export const calendarContract = defineContract({
  name: 'calendar',
  tag: 'cosm-calendar',
  description:
    'Selects one Gregorian date from an inline, localized calendar with keyboard navigation and optional date bounds.',
  role: 'grid',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/grid/',
  props: {
    value: {
      type: 'string',
      description:
        'Controlled selected date in YYYY-MM-DD format; when supplied, selection proposals wait for the owner to update this value.',
    },
    defaultValue: {
      type: 'string',
      description:
        'Initial autonomous selected date in YYYY-MM-DD format; later changes do not reset selection.',
    },
    min: {
      type: 'string',
      description: 'Earliest selectable date in YYYY-MM-DD format, inclusive.',
    },
    max: {
      type: 'string',
      description: 'Latest selectable date in YYYY-MM-DD format, inclusive.',
    },
    locale: {
      type: 'string',
      description:
        'BCP 47 locale for month and weekday names, week start, and text direction; defaults to the environment locale. Invalid locale identifiers are rejected.',
    },
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Disables date selection and month navigation.',
    },
  },
  events: {
    change: {
      description:
        'Proposes an enabled selected date as a YYYY-MM-DD value; autonomous selection commits and controlled selection waits for the owner.',
      detail: 'CalendarChangeDetail',
      names: {
        dom: 'cosm-change',
        react: 'onChange',
        angular: 'valueChange',
        native: 'onValueChange',
      },
    },
  },
  states: [{ prop: 'value', event: 'change', defaultProp: 'defaultValue' }],
  slots: {},
  parts: {
    base: 'Calendar root.',
    header: 'Month heading and navigation controls.',
    previous: 'Previous-month navigation button.',
    heading: 'Localized month and year heading.',
    next: 'Next-month navigation button.',
    weekday: 'Localized weekday heading.',
    grid: 'Seven-column date grid.',
    day: 'Date button, including adjacent-month dates.',
  },
  cssProperties: {
    '--cosm-calendar-background': 'Calendar surface background.',
    '--cosm-calendar-color': 'Primary calendar text color.',
    '--cosm-calendar-muted-color': 'Adjacent-month and weekday text color.',
    '--cosm-calendar-selected-background': 'Selected-date background.',
    '--cosm-calendar-selected-color': 'Selected-date text color.',
    '--cosm-calendar-day-size': 'Minimum date target dimensions.',
    '--cosm-calendar-gap': 'Space between date targets.',
    '--cosm-calendar-radius': 'Date target corner radius.',
    '--cosm-calendar-focus': 'Visible keyboard focus indicator color.',
    '--cosm-calendar-today-border': 'Non-color-only today marker.',
  },
  keyboard: [
    {
      keys: ['Tab', 'Shift+Tab'],
      action: 'Moves between the navigation controls and one active date.',
      platforms: ['web', 'react', 'angular'],
    },
    {
      keys: ['ArrowLeft', 'ArrowRight'],
      action: 'Moves the active date by one day; direction follows the visual RTL/LTR order.',
      platforms: ['web', 'react', 'angular'],
    },
    {
      keys: ['ArrowUp', 'ArrowDown'],
      action: 'Moves the active date by one week.',
      platforms: ['web', 'react', 'angular'],
    },
    {
      keys: ['Home', 'End'],
      action: 'Moves to the first or last day of the localized week.',
      platforms: ['web', 'react', 'angular'],
    },
    {
      keys: ['PageUp', 'PageDown'],
      action: 'Moves the active date by one month.',
      platforms: ['web', 'react', 'angular'],
    },
    {
      keys: ['Shift+PageUp', 'Shift+PageDown'],
      action: 'Moves the active date by one year.',
      platforms: ['web', 'react', 'angular'],
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Proposes selection of the active enabled date.',
      platforms: ['web', 'react', 'angular'],
    },
  ],
});
