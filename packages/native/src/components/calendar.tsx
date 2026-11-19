import type { ContractProps } from '@joralvmel/cosmos-core';
import {
  addCalendarMonths,
  type CalendarChangeDetail,
  type CalendarKey,
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
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';
import { Button } from './button.js';
import { Icon } from './icon.js';

type ContractCalendarProps = ContractProps<typeof calendarContract, 'native'>;

export interface CalendarProps extends ContractCalendarProps {
  /** Receives the selected date proposal; controlled selection waits for the owner. */
  onValueChange?: (detail: CalendarChangeDetail) => void;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const calendarPropNames = [
  'value',
  'defaultValue',
  'min',
  'max',
  'locale',
  'disabled',
] as const satisfies readonly (keyof ContractCalendarProps)[];

interface CalendarKeyEvent {
  key?: string;
  shiftKey?: boolean;
  nativeEvent?: { key: string; shiftKey?: boolean };
  preventDefault?: () => void;
  stopPropagation?: () => void;
}

interface WebFocusTarget {
  focus(): void;
}

interface WebDocument {
  getElementById(id: string): WebFocusTarget | null;
}

type CalendarNavigationView = 'days' | 'months' | 'years';

const minimumDaySize = 44;
const webKeys: readonly CalendarKey[] = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Shift+PageUp',
  'Shift+PageDown',
];

function focusWebDate(id: string) {
  if (Platform.OS !== 'web') return;
  const browserDocument = (globalThis as { document?: WebDocument }).document;
  browserDocument?.getElementById(id)?.focus();
}

function getCalendarWeekCells(week: readonly (string | undefined)[]) {
  let emptyIndex = 0;
  return week.map(date => ({
    date,
    key: date ?? `empty-${emptyIndex++}`,
  }));
}

/** Inline, localized Gregorian calendar with direct month and year navigation. */
export function Calendar({
  value,
  defaultValue,
  min,
  max,
  locale,
  disabled = calendarContract.props.disabled.default,
  onValueChange,
  testID,
}: CalendarProps) {
  const theme = useTheme();
  const minimumGridWidth = minimumDaySize * 7 + theme.space['2xs'] * 6;
  const id = useId();
  const localeInfo = useMemo(() => getCalendarLocaleInfo(locale), [locale]);
  const today = getCalendarToday();
  validateCalendarBounds(min, max);
  if (value !== undefined) parseCalendarDate(value);
  if (defaultValue !== undefined) parseCalendarDate(defaultValue);

  const initialDate = value ?? defaultValue ?? today;
  const [ownedValue, setOwnedValue] = useState<string | undefined>(defaultValue);
  const currentValue = value === undefined ? ownedValue : value;
  const [activeDate, setActiveDate] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(getCalendarMonth(initialDate));
  const [navigationView, setNavigationView] = useState<CalendarNavigationView>('days');
  const [yearPageStart, setYearPageStart] = useState(1);
  const valueEdited = useRef(false);
  const focusAfterUpdate = useRef(false);
  const weekdays = useMemo(
    () => getCalendarWeekdayNames(localeInfo.locale, localeInfo.firstDay),
    [localeInfo]
  );
  const dates = useMemo(
    () => getCalendarMonthDates(visibleMonth, localeInfo.firstDay),
    [visibleMonth, localeInfo.firstDay]
  );
  const weeks = useMemo(
    () =>
      Array.from({ length: dates.length / 7 }, (_, index) => dates.slice(index * 7, index * 7 + 7)),
    [dates]
  );
  const monthLabel = formatCalendarMonth(visibleMonth, localeInfo.locale);
  const formatDay = new Intl.NumberFormat(localeInfo.locale, { useGrouping: false });

  useEffect(() => {
    if (value !== undefined) {
      setActiveDate(value);
      setVisibleMonth(getCalendarMonth(value));
    }
  }, [value]);

  useEffect(() => {
    if (value !== undefined || valueEdited.current) return;
    setOwnedValue(defaultValue);
    if (defaultValue !== undefined) {
      setActiveDate(defaultValue);
      setVisibleMonth(getCalendarMonth(defaultValue));
    }
  }, [defaultValue, value]);

  useEffect(() => {
    if (!focusAfterUpdate.current || navigationView !== 'days') return;
    focusAfterUpdate.current = false;
    focusWebDate(`${id}-day-${activeDate}`);
  }, [activeDate, id, navigationView]);

  const announceMonth = (nextMonth: string) => {
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(formatCalendarMonth(nextMonth, localeInfo.locale));
    }
  };
  const currentDate = parseCalendarDate(visibleMonth);
  const monthName = new Intl.DateTimeFormat(localeInfo.locale, {
    calendar: 'gregory',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(currentDate.year, currentDate.month - 1, 1, 12)));
  const yearName = new Intl.NumberFormat(localeInfo.locale, { useGrouping: false }).format(
    currentDate.year
  );
  const relative = new Intl.RelativeTimeFormat(localeInfo.locale, { numeric: 'auto' });
  const relativeUnit = navigationView === 'days' ? 'month' : 'year';
  const relativeStep = navigationView === 'years' ? 12 : 1;
  const previousLabel = relative.format(-relativeStep, relativeUnit);
  const nextLabel = relative.format(relativeStep, relativeUnit);
  const yearPageEnd = Math.min(9999, yearPageStart + 11);
  const yearPageLabel = `${new Intl.NumberFormat(localeInfo.locale, { useGrouping: false }).format(
    yearPageStart
  )}–${new Intl.NumberFormat(localeInfo.locale, { useGrouping: false }).format(yearPageEnd)}`;
  const hasSelectableMonth = (month: string) => {
    const monthDates = getCalendarMonthDates(month, 0).filter(
      (date): date is string => date !== undefined && date.slice(0, 7) === month.slice(0, 7)
    );
    const first = monthDates[0];
    const last = monthDates.at(-1);
    return (
      !disabled &&
      first !== undefined &&
      last !== undefined &&
      (min === undefined || last >= min) &&
      (max === undefined || first <= max)
    );
  };
  const hasSelectableYear = (year: number) => {
    const first = `${String(year).padStart(4, '0')}-01-01`;
    const last = `${String(year).padStart(4, '0')}-12-31`;
    return (
      !disabled &&
      year >= 1 &&
      year <= 9999 &&
      (min === undefined || last >= min) &&
      (max === undefined || first <= max)
    );
  };
  const monthForYear = (year: number, preferredMonth: number) => {
    const month = Array.from({ length: 12 }, (_, index) => index + 1)
      .filter(value =>
        hasSelectableMonth(`${String(year).padStart(4, '0')}-${String(value).padStart(2, '0')}-01`)
      )
      .sort((left, right) => Math.abs(left - preferredMonth) - Math.abs(right - preferredMonth))[0];
    return month === undefined
      ? undefined
      : `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`;
  };
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
      disabled: !hasSelectableMonth(monthStart),
    };
  });
  const yearOptions = Array.from({ length: yearPageEnd - yearPageStart + 1 }, (_, index) => {
    const year = yearPageStart + index;
    return {
      year,
      label: new Intl.NumberFormat(localeInfo.locale, { useGrouping: false }).format(year),
      selected: currentDate.year === year,
      disabled: !hasSelectableYear(year),
    };
  });
  const hasSelectableYearInRange = (start: number, end: number) => {
    for (let year = start; year <= Math.min(end, 9999); year++) {
      if (hasSelectableYear(year)) return true;
    }
    return false;
  };
  const setMonthView = (month: string) => {
    if (!hasSelectableMonth(month)) return;
    const current = parseCalendarDate(visibleMonth);
    const target = parseCalendarDate(month);
    const monthDelta = (target.year - current.year) * 12 + target.month - current.month;
    const candidate = tryAddCalendarMonths(activeDate, monthDelta);
    const selectableDates = getCalendarMonthDates(month, localeInfo.firstDay).filter(
      (date): date is string =>
        date !== undefined &&
        date.slice(0, 7) === month.slice(0, 7) &&
        isCalendarDateSelectable(date, min, max)
    );
    setVisibleMonth(month);
    setActiveDate(
      candidate && selectableDates.includes(candidate) ? candidate : (selectableDates[0] ?? month)
    );
    focusAfterUpdate.current = true;
    announceMonth(month);
  };
  const canNavigate = (months: -1 | 1) => {
    if (navigationView === 'years') {
      const start = yearPageStart + months * 12;
      return start >= 1 && start <= 9999 && hasSelectableYearInRange(start, start + 11);
    }
    if (navigationView === 'months') {
      const year = parseCalendarDate(visibleMonth).year + months;
      return year >= 1 && year <= 9999 && hasSelectableYear(year);
    }
    return canNavigateCalendarMonth(visibleMonth, months, localeInfo.firstDay, min, max, disabled);
  };
  const navigate = (months: -1 | 1) => {
    if (!canNavigate(months)) return;
    if (navigationView === 'years') {
      setYearPageStart(current => current + months * 12);
      return;
    }
    if (navigationView === 'months') {
      const { year, month } = parseCalendarDate(visibleMonth);
      const target = monthForYear(year + months, month);
      if (target) setMonthView(target);
      return;
    }
    const nextMonth = addCalendarMonths(visibleMonth, months);
    setActiveDate(current => addCalendarMonths(current, months));
    setVisibleMonth(nextMonth);
    announceMonth(nextMonth);
  };

  const selectDate = (date: string) => {
    if (disabled || !isCalendarDateSelectable(date, min, max) || currentValue === date) return;
    if (value === undefined) {
      valueEdited.current = true;
      setOwnedValue(date);
    }
    setActiveDate(date);
    const nextMonth = getCalendarMonth(date);
    if (nextMonth !== visibleMonth) setVisibleMonth(nextMonth);
    onValueChange?.({ value: date });
  };

  const handleKeyDown = (event: unknown) => {
    if (Platform.OS !== 'web' || disabled || navigationView !== 'days') return;
    const keyEvent = event as CalendarKeyEvent;
    const key = keyEvent.nativeEvent?.key ?? keyEvent.key;
    if (!key || !webKeys.includes(key as CalendarKey)) return;
    const movement: Partial<Record<string, number>> = {
      ArrowLeft: localeInfo.direction === 'rtl' ? 1 : -1,
      ArrowRight: localeInfo.direction === 'rtl' ? -1 : 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const delta = movement[key];
    let nextDate: string | undefined;
    const parts = parseCalendarDate(activeDate);
    if (delta !== undefined) {
      nextDate = tryAddCalendarDays(activeDate, delta);
    } else if (key === 'Home' || key === 'End') {
      const offset = (parts.weekday - localeInfo.firstDay + 7) % 7;
      nextDate = tryAddCalendarDays(activeDate, key === 'Home' ? -offset : 6 - offset);
    } else if (key === 'PageUp' || key === 'PageDown') {
      nextDate = tryAddCalendarMonths(
        activeDate,
        (key === 'PageUp' ? -1 : 1) * (keyEvent.shiftKey || keyEvent.nativeEvent?.shiftKey ? 12 : 1)
      );
    }
    if (!nextDate) return;
    keyEvent.preventDefault?.();
    keyEvent.stopPropagation?.();
    focusAfterUpdate.current = true;
    setActiveDate(nextDate);
    const nextMonth = getCalendarMonth(nextDate);
    if (nextMonth !== visibleMonth) {
      setVisibleMonth(nextMonth);
      announceMonth(nextMonth);
    }
  };

  const headerStyle: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    direction: localeInfo.direction,
    alignItems: 'center',
    gap: theme.space.xs,
  };
  const gridStyle: StyleProp<ViewStyle> = {
    gap: theme.space['2xs'],
    width: '100%',
  };
  const dayRowStyle: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    direction: localeInfo.direction,
    gap: theme.space['2xs'],
  };

  return (
    <View testID={testID} style={{ width: '100%', gap: theme.space.sm }}>
      <View style={headerStyle}>
        <Button
          testID={testID ? `${testID}-previous` : undefined}
          size="sm"
          variant="ghost"
          tone="neutral"
          label={previousLabel}
          disabled={!canNavigate(-1)}
          onPress={() => navigate(-1)}
        >
          <Icon icon={localeInfo.direction === 'rtl' ? chevronRight : chevronLeft} size="sm" />
        </Button>
        <View
          accessibilityRole="header"
          style={{ alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'center' }}
        >
          <Button
            testID={testID ? `${testID}-choose-month` : undefined}
            size="sm"
            variant="ghost"
            tone="neutral"
            label={monthName}
            disabled={disabled}
            onPress={() => setNavigationView('months')}
          >
            {monthName}
          </Button>
          <Button
            testID={testID ? `${testID}-choose-year` : undefined}
            size="sm"
            variant="ghost"
            tone="neutral"
            label={yearName}
            disabled={disabled}
            onPress={() => {
              setYearPageStart(Math.max(1, Math.floor((currentDate.year - 1) / 10) * 10));
              setNavigationView('years');
            }}
          >
            {yearName}
          </Button>
        </View>
        <Button
          testID={testID ? `${testID}-next` : undefined}
          size="sm"
          variant="ghost"
          tone="neutral"
          label={nextLabel}
          disabled={!canNavigate(1)}
          onPress={() => navigate(1)}
        >
          <Icon icon={localeInfo.direction === 'rtl' ? chevronLeft : chevronRight} size="sm" />
        </Button>
      </View>
      {navigationView === 'months' ? (
        <View
          style={{
            direction: localeInfo.direction,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.space['2xs'],
          }}
        >
          {monthOptions.map(option => (
            <Button
              key={option.month}
              testID={testID ? `${testID}-month-${option.month}` : undefined}
              size="sm"
              variant={option.selected ? 'soft' : 'ghost'}
              tone={option.selected ? 'primary' : 'neutral'}
              label={option.label}
              disabled={option.disabled}
              style={{ flexBasis: '31%', flexGrow: 1, minHeight: minimumDaySize }}
              onPress={() => {
                const year = parseCalendarDate(visibleMonth).year;
                setMonthView(`${String(year).padStart(4, '0')}-${option.month}-01`);
                setNavigationView('days');
              }}
            >
              {option.label}
            </Button>
          ))}
        </View>
      ) : navigationView === 'years' ? (
        <View style={{ gap: theme.space.xs }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Button
              size="sm"
              variant="ghost"
              tone="neutral"
              label={previousLabel}
              disabled={!canNavigate(-1)}
              onPress={() => navigate(-1)}
            >
              <Icon icon={localeInfo.direction === 'rtl' ? chevronRight : chevronLeft} size="sm" />
            </Button>
            <Text accessibilityRole="header" style={{ color: theme.colors.fg }}>
              {yearPageLabel}
            </Text>
            <Button
              size="sm"
              variant="ghost"
              tone="neutral"
              label={nextLabel}
              disabled={!canNavigate(1)}
              onPress={() => navigate(1)}
            >
              <Icon icon={localeInfo.direction === 'rtl' ? chevronLeft : chevronRight} size="sm" />
            </Button>
          </View>
          <View
            style={{
              direction: localeInfo.direction,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.space['2xs'],
            }}
          >
            {yearOptions.map(option => (
              <Button
                key={option.year}
                testID={testID ? `${testID}-year-${option.year}` : undefined}
                size="sm"
                variant={option.selected ? 'soft' : 'ghost'}
                tone={option.selected ? 'primary' : 'neutral'}
                label={option.label}
                disabled={option.disabled}
                style={{ flexBasis: '23%', flexGrow: 1, minHeight: minimumDaySize }}
                onPress={() => {
                  const month = monthForYear(option.year, parseCalendarDate(visibleMonth).month);
                  if (month) {
                    setMonthView(month);
                    setNavigationView('days');
                  }
                }}
              >
                {option.label}
              </Button>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView
          horizontal
          style={{ width: '100%' }}
          contentContainerStyle={{ minWidth: '100%' }}
        >
          <View
            style={{ ...gridStyle, minWidth: minimumGridWidth }}
            onKeyDown={handleKeyDown}
            {...(Platform.OS === 'web'
              ? ({
                  role: 'grid',
                  'aria-label': monthLabel,
                  'aria-disabled': disabled || undefined,
                } as Record<string, unknown>)
              : {})}
          >
            <View
              style={dayRowStyle}
              {...(Platform.OS === 'web' ? ({ role: 'row' } as Record<string, unknown>) : {})}
            >
              {weekdays.map(weekday => (
                <Text
                  key={weekday.long}
                  accessibilityLabel={weekday.long}
                  accessibilityRole="text"
                  style={{
                    color: theme.colors['fg-muted'],
                    flex: 1,
                    fontSize: theme.text.sm,
                    minHeight: minimumDaySize,
                    minWidth: minimumDaySize,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  }}
                  {...(Platform.OS === 'web'
                    ? ({
                        role: 'columnheader',
                        'aria-label': weekday.long,
                      } as Record<string, unknown>)
                    : {})}
                >
                  {weekday.short}
                </Text>
              ))}
            </View>
            {weeks.map(week => {
              const cells = getCalendarWeekCells(week);
              const firstDate = cells.find(cell => cell.date !== undefined)?.date ?? 'edge';
              return (
                <View
                  key={`week-${firstDate}`}
                  style={dayRowStyle}
                  {...(Platform.OS === 'web' ? ({ role: 'row' } as Record<string, unknown>) : {})}
                >
                  {cells.map(({ date, key }) => {
                    if (!date) {
                      return (
                        <View
                          key={key}
                          style={{
                            flex: 1,
                            minHeight: minimumDaySize,
                            minWidth: minimumDaySize,
                          }}
                          {...(Platform.OS === 'web'
                            ? ({ role: 'gridcell', 'aria-hidden': true } as Record<string, unknown>)
                            : {})}
                        />
                      );
                    }
                    const dateParts = parseCalendarDate(date);
                    const selected = currentValue === date;
                    const isToday = date === today;
                    const selectable = isCalendarDateSelectable(date, min, max);
                    const inMonth = date.slice(0, 7) === visibleMonth.slice(0, 7);
                    const dayColor = selected
                      ? theme.colors['primary-fg']
                      : selectable && inMonth
                        ? theme.colors.fg
                        : theme.colors['fg-muted'];
                    const webProps =
                      Platform.OS === 'web'
                        ? ({
                            id: `${id}-day-${date}`,
                            tabIndex: !disabled && activeDate === date ? 0 : -1,
                            'aria-disabled': disabled || !selectable,
                            'aria-current': isToday ? 'date' : undefined,
                            'data-date': date,
                            onFocus: () => setActiveDate(date),
                          } as Record<string, unknown>)
                        : {};
                    return (
                      <View
                        key={key}
                        {...(Platform.OS === 'web'
                          ? ({
                              role: 'gridcell',
                              'aria-selected': selected,
                              'aria-disabled': disabled || !selectable,
                            } as Record<string, unknown>)
                          : {})}
                        style={{ flex: 1, minWidth: minimumDaySize }}
                      >
                        <Pressable
                          {...webProps}
                          accessibilityRole="button"
                          accessibilityLabel={`${formatCalendarDate(date, localeInfo.locale)}${
                            isToday ? `, ${getCalendarTodayLabel(localeInfo.locale)}` : ''
                          }`}
                          accessibilityState={{
                            disabled: disabled || !selectable,
                            selected,
                          }}
                          disabled={disabled || (Platform.OS !== 'web' && !selectable)}
                          hitSlop={{ left: 4, right: 4 }}
                          onPress={() => selectDate(date)}
                          style={{
                            aspectRatio: 1,
                            alignItems: 'center',
                            backgroundColor: selected ? theme.colors.primary : 'transparent',
                            borderColor: isToday ? theme.colors.primary : 'transparent',
                            borderRadius: theme.radius.md,
                            borderWidth: 1,
                            flex: 1,
                            justifyContent: 'center',
                            minHeight: minimumDaySize,
                            minWidth: minimumDaySize,
                          }}
                          testID={testID ? `${testID}-day-${date}` : undefined}
                        >
                          <Text
                            style={{
                              color: dayColor,
                              fontSize: theme.text.sm,
                              fontWeight: selected ? theme.weight.semibold : theme.weight.regular,
                            }}
                          >
                            {formatDay.format(dateParts.day)}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
