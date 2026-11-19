export interface CalendarLocaleInfo {
  locale: string;
  firstDay: number;
  direction: 'ltr' | 'rtl';
}

export interface CalendarWeekdayName {
  short: string;
  long: string;
}

interface WeekInfo {
  firstDay: number;
}

interface TextInfo {
  direction: 'ltr' | 'rtl';
}

interface LocaleWithCalendarInfo extends Intl.Locale {
  getWeekInfo?: () => WeekInfo;
  readonly weekInfo?: WeekInfo;
  getTextInfo?: () => TextInfo;
  readonly textInfo?: TextInfo;
}

// CLDR 49 territory week-start data is the fallback when the runtime lacks Intl.Locale methods.
const sundayFirstRegions = new Set(
  'AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN IS JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM VE VI WS YE ZA ZW'.split(
    ' '
  )
);
const saturdayFirstRegions = new Set('AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));
const rtlLanguages = new Set('ar dv fa he ps sd ug ur yi'.split(' '));
const rtlScripts = new Set('Adlm Arab Hebr Nkoo Rohg Samr Syrc Thaa'.split(' '));

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function formatDate(year: number, month: number, day: number): string {
  if (year < 1 || year > 9999) throw new RangeError('Calendar dates must use years 0001–9999.');
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseCalendarDate(value: string): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError('Calendar dates must use YYYY-MM-DD format.');
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  if (
    year < 1 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    throw new TypeError(`Invalid calendar date: ${value}.`);
  }
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return { year, month, day, weekday: date.getUTCDay() };
}

export function compareCalendarDates(left: string, right: string): number {
  parseCalendarDate(left);
  parseCalendarDate(right);
  return left < right ? -1 : left > right ? 1 : 0;
}

export function addCalendarDays(value: string, days: number): string {
  const result = tryAddCalendarDays(value, days);
  if (!result) throw new RangeError('Calendar day movement is outside years 0001–9999.');
  return result;
}

export function tryAddCalendarDays(value: string, days: number): string | undefined {
  const parts = parseCalendarDate(value);
  if (!Number.isSafeInteger(days))
    throw new TypeError('Calendar day movement must be a safe integer.');
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day + days);
  const year = date.getUTCFullYear();
  if (!Number.isFinite(date.getTime()) || year < 1 || year > 9999) return undefined;
  return formatDate(year, date.getUTCMonth() + 1, date.getUTCDate());
}

export function addCalendarMonths(value: string, months: number): string {
  const parts = parseCalendarDate(value);
  if (!Number.isSafeInteger(months))
    throw new TypeError('Calendar month movement must be a safe integer.');
  const totalMonths = parts.year * 12 + parts.month - 1 + months;
  const year = Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return formatDate(year, month, Math.min(parts.day, daysInMonth(year, month)));
}

export function tryAddCalendarMonths(value: string, months: number): string | undefined {
  if (!Number.isSafeInteger(months))
    throw new TypeError('Calendar month movement must be a safe integer.');
  const { year, month } = parseCalendarDate(value);
  const absoluteMonth = (year - 1) * 12 + month - 1 + months;
  if (absoluteMonth < 0 || absoluteMonth >= 9999 * 12) return undefined;
  return addCalendarMonths(value, months);
}

export function getCalendarMonth(value: string): string {
  const { year, month } = parseCalendarDate(value);
  return formatDate(year, month, 1);
}

export function getCalendarMonthDates(value: string, firstDay: number): Array<string | undefined> {
  const { year, month, weekday } = parseCalendarDate(value);
  if (!Number.isInteger(firstDay) || firstDay < 0 || firstDay > 6) {
    throw new TypeError('Calendar first day must be an integer from 0 (Sunday) to 6 (Saturday).');
  }
  const offset = (weekday - firstDay + 7) % 7;
  const count = daysInMonth(year, month);
  const cellCount = Math.ceil((offset + count) / 7) * 7;
  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - offset + 1;
    if (day >= 1 && day <= count) return formatDate(year, month, day);
    if (day < 1) {
      if (month === 1 && year === 1) return undefined;
      const previousMonth = month === 1 ? 12 : month - 1;
      const previousYear = month === 1 ? year - 1 : year;
      return formatDate(
        previousYear,
        previousMonth,
        daysInMonth(previousYear, previousMonth) + day
      );
    }
    if (month === 12 && year === 9999) return undefined;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return formatDate(nextYear, nextMonth, day - count);
  });
}

export function validateCalendarBounds(min?: string, max?: string): void {
  if (min !== undefined) parseCalendarDate(min);
  if (max !== undefined) parseCalendarDate(max);
  if (min !== undefined && max !== undefined && min > max) {
    throw new RangeError('Calendar min must be earlier than or equal to max.');
  }
}

export function canNavigateCalendarMonth(
  value: string,
  months: -1 | 1,
  firstDay: number,
  min?: string,
  max?: string,
  disabled = false
): boolean {
  validateCalendarBounds(min, max);
  if (disabled) return false;
  const { year, month } = parseCalendarDate(value);
  if ((months < 0 && year === 1 && month === 1) || (months > 0 && year === 9999 && month === 12)) {
    return false;
  }
  const targetMonth = addCalendarMonths(getCalendarMonth(value), months);
  const dates = getCalendarMonthDates(targetMonth, firstDay).filter(
    (date): date is string => date !== undefined && date.slice(0, 7) === targetMonth.slice(0, 7)
  );
  const targetStart = dates[0];
  const targetEnd = dates.at(-1);
  if (!targetStart || !targetEnd) return false;
  return months < 0
    ? min === undefined || compareCalendarDates(targetEnd, min) >= 0
    : max === undefined || compareCalendarDates(targetStart, max) <= 0;
}

function firstDayForRegion(region: string | undefined): number {
  if (region === 'MV') return 5;
  if (region && saturdayFirstRegions.has(region)) return 6;
  if (region && sundayFirstRegions.has(region)) return 0;
  return 1;
}

function localeRegion(locale: string): string | undefined {
  const match = locale.match(/(?:^|-)([A-Z]{2})(?:-|$)/i);
  return match?.[1]?.toUpperCase();
}

function localeDirection(locale: LocaleWithCalendarInfo | undefined, tag: string) {
  const direction = locale?.getTextInfo?.().direction ?? locale?.textInfo?.direction;
  if (direction === 'rtl' || direction === 'ltr') return direction;
  const script =
    locale?.script ?? tag.match(/-(Adlm|Arab|Hebr|Nkoo|Rohg|Samr|Syrc|Thaa)(?:-|$)/i)?.[1];
  if (script && rtlScripts.has(script[0]?.toUpperCase() + script.slice(1).toLowerCase()))
    return 'rtl';
  const language = locale?.language ?? tag.split('-')[0];
  return language && rtlLanguages.has(language.toLowerCase()) ? 'rtl' : 'ltr';
}

export function getCalendarLocaleInfo(locale?: string): CalendarLocaleInfo {
  const resolvedLocale = new Intl.DateTimeFormat(locale).resolvedOptions().locale;
  const localeObject =
    typeof Intl.Locale === 'function'
      ? (new Intl.Locale(resolvedLocale) as LocaleWithCalendarInfo)
      : undefined;
  const weekInfo = localeObject?.getWeekInfo?.() ?? localeObject?.weekInfo;
  const firstDay =
    weekInfo &&
    Number.isInteger(weekInfo.firstDay) &&
    weekInfo.firstDay >= 1 &&
    weekInfo.firstDay <= 7
      ? weekInfo.firstDay % 7
      : firstDayForRegion(localeObject?.region ?? localeRegion(resolvedLocale));
  return {
    locale: resolvedLocale,
    firstDay,
    direction: localeDirection(localeObject, resolvedLocale),
  };
}

export function getCalendarWeekdayNames(locale: string, firstDay: number): CalendarWeekdayName[] {
  if (!Number.isInteger(firstDay) || firstDay < 0 || firstDay > 6) {
    throw new TypeError('Calendar first day must be an integer from 0 (Sunday) to 6 (Saturday).');
  }
  const formatter = new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    timeZone: 'UTC',
    weekday: 'short',
  });
  const longFormatter = new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    timeZone: 'UTC',
    weekday: 'long',
  });
  const sunday = new Date(Date.UTC(2024, 0, 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setUTCDate(sunday.getUTCDate() + ((firstDay + index) % 7));
    return { short: formatter.format(date), long: longFormatter.format(date) };
  });
}

export function formatCalendarMonth(value: string, locale: string): string {
  const { year, month } = parseCalendarDate(value);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

export function formatCalendarDate(value: string, locale: string): string {
  const { year, month, day } = parseCalendarDate(value);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
  }).format(date);
}

export function getCalendarToday(now = new Date()): string {
  if (Number.isNaN(now.getTime())) throw new TypeError('Calendar current date must be valid.');
  return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function isCalendarDateSelectable(
  value: string,
  min?: string,
  max?: string,
  disabled = false
): boolean {
  parseCalendarDate(value);
  validateCalendarBounds(min, max);
  if (min !== undefined && compareCalendarDates(value, min) < 0) return false;
  if (max !== undefined && compareCalendarDates(value, max) > 0) return false;
  return !disabled;
}

export function getCalendarTodayLabel(locale: string): string {
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day');
}
