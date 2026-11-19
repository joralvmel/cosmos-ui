import { describe, expect, it } from 'vitest';
import {
  addCalendarDays,
  addCalendarMonths,
  canNavigateCalendarMonth,
  compareCalendarDates,
  formatCalendarDate,
  formatCalendarMonth,
  getCalendarLocaleInfo,
  getCalendarMonthDates,
  getCalendarToday,
  getCalendarTodayLabel,
  getCalendarWeekdayNames,
  isCalendarDateSelectable,
  parseCalendarDate,
  tryAddCalendarDays,
  tryAddCalendarMonths,
  validateCalendarBounds,
} from '../src/headless/calendar.js';

describe('calendar date arithmetic', () => {
  it('validates date-only values and compares them chronologically', () => {
    expect(parseCalendarDate('2024-02-29')).toMatchObject({
      year: 2024,
      month: 2,
      day: 29,
      weekday: 4,
    });
    expect(compareCalendarDates('2024-02-29', '2024-03-01')).toBe(-1);
    for (const value of ['2024-2-01', '2023-02-29', '0000-01-01', '2024-13-01']) {
      expect(() => parseCalendarDate(value)).toThrow();
    }
  });

  it('moves days and months across leap days and clamps month-end dates', () => {
    expect(addCalendarDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addCalendarDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(addCalendarMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addCalendarMonths('2024-02-29', 12)).toBe('2025-02-28');
    expect(() => addCalendarMonths('0001-01-01', -1)).toThrow(RangeError);
    expect(tryAddCalendarDays('0001-01-01', -1)).toBeUndefined();
    expect(tryAddCalendarDays('2024-01-01', Number.MAX_SAFE_INTEGER)).toBeUndefined();
    expect(() => addCalendarDays('2024-01-01', Number.MAX_SAFE_INTEGER)).toThrow(RangeError);
    expect(tryAddCalendarMonths('9999-12-31', 1)).toBeUndefined();
  });

  it('builds localized full-week rows, including edge years', () => {
    expect(getCalendarMonthDates('2024-05-01', 0)).toHaveLength(35);
    expect(getCalendarMonthDates('2024-05-01', 0)[0]).toBe('2024-04-28');
    expect(getCalendarMonthDates('2024-05-01', 1)[0]).toBe('2024-04-29');
    expect(getCalendarMonthDates('2021-02-01', 1)).toHaveLength(28);
    expect(getCalendarMonthDates('0001-01-01', 0).slice(0, 2)).toEqual([undefined, '0001-01-01']);
    expect(getCalendarMonthDates('9999-12-01', 0).slice(-1)).toEqual([undefined]);
  });
});

describe('calendar locale and bounds', () => {
  it('resolves localized week starts, direction and weekday labels', () => {
    expect(getCalendarLocaleInfo('en-US')).toMatchObject({ firstDay: 0, direction: 'ltr' });
    expect(getCalendarLocaleInfo('de-DE')).toMatchObject({ firstDay: 1, direction: 'ltr' });
    expect(getCalendarLocaleInfo('ar-EG')).toMatchObject({ firstDay: 6, direction: 'rtl' });
    expect(getCalendarWeekdayNames('en-US', 0)[0]?.long).toBe('Sunday');
    expect(getCalendarWeekdayNames('de-DE', 1)[0]?.long).toBe('Montag');
    expect(() => getCalendarLocaleInfo('not_a_locale')).toThrow();
  });

  it('formats Gregorian dates and the current local date', () => {
    expect(formatCalendarMonth('2024-05-01', 'en-US')).toBe('May 2024');
    expect(formatCalendarDate('2024-05-15', 'en-US')).toBe('Wednesday, May 15, 2024');
    expect(getCalendarToday(new Date(2024, 1, 29, 12))).toBe('2024-02-29');
    expect(getCalendarTodayLabel('en-US')).toBe('today');
  });

  it('enforces inclusive bounds and rejects malformed or reversed bounds', () => {
    expect(isCalendarDateSelectable('2024-05-10', '2024-05-10', '2024-05-20')).toBe(true);
    expect(isCalendarDateSelectable('2024-05-09', '2024-05-10', '2024-05-20')).toBe(false);
    expect(isCalendarDateSelectable('2024-05-21', '2024-05-10', '2024-05-20')).toBe(false);
    expect(isCalendarDateSelectable('2024-05-15', undefined, undefined, true)).toBe(false);
    expect(() => validateCalendarBounds('2024-06-01', '2024-05-01')).toThrow(RangeError);
    expect(() => validateCalendarBounds('invalid', '2024-05-01')).toThrow();
  });

  it('allows browsing toward the range but prevents movement beyond its ends', () => {
    expect(canNavigateCalendarMonth('2024-05-01', 1, 0, '2024-07-01')).toBe(true);
    expect(canNavigateCalendarMonth('2024-05-01', -1, 0, '2024-07-01')).toBe(false);
    expect(canNavigateCalendarMonth('2024-05-01', 1, 0, undefined, '2024-05-31')).toBe(false);
    expect(canNavigateCalendarMonth('2024-05-01', -1, 0, undefined, '2024-05-31')).toBe(true);
    expect(canNavigateCalendarMonth('2024-05-01', 1, 0, undefined, undefined, true)).toBe(false);
  });
});
