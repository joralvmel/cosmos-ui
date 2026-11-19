import {
  type CalendarChangeDetail,
  calendarContract,
  calendarScenariosFor,
  formatCalendarDate,
  getCalendarToday,
  propNames,
} from '@joralvmel/cosmos-core';
import { defaultThemeName, getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Platform } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Calendar, calendarPropNames } from '../src/index.js';
import { __accessibilityAnnouncements } from './react-native.mock.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container.querySelector<HTMLElement>('[data-testid="subject"]');
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  Platform.OS = 'web';
  __accessibilityAnnouncements.length = 0;
});

function dayButton(value: string) {
  const button = container?.querySelector<HTMLButtonElement>(
    `[data-testid="subject-day-${value}"]`
  );
  if (!button) throw new Error(`Missing calendar date ${value}.`);
  return button;
}

describe('Calendar (native): shared scenarios', () => {
  for (const scenario of calendarScenariosFor('native')) {
    it(scenario.name, async () => {
      const onValueChange = vi.fn<(detail: CalendarChangeDetail) => void>();
      const subject = await render(
        <Calendar {...scenario.props} onValueChange={onValueChange} testID="subject" />
      );

      for (const action of scenario.actions) {
        if (action.type === 'select') {
          await act(async () => dayButton(action.value).click());
        } else if (action.type === 'sync') {
          await act(async () =>
            root?.render(
              <Calendar
                {...scenario.props}
                value={action.value}
                onValueChange={onValueChange}
                testID="subject"
              />
            )
          );
        } else if (action.type === 'navigate') {
          const buttonId = action.months < 0 ? 'subject-previous' : 'subject-next';
          const button = container?.querySelector<HTMLButtonElement>(`[data-testid="${buttonId}"]`);
          if (!button) throw new Error('Missing calendar navigation button.');
          for (let month = 0; month < Math.abs(action.months); month++)
            await act(async () => button.click());
        }
      }

      await act(async () => Promise.resolve());
      const active = subject?.querySelector<HTMLButtonElement>('button[tabindex="0"]');
      expect(active?.id.split('-day-').at(-1)).toBe(scenario.expected.activeDate);
      const monthParts = scenario.expected.month.split('-');
      const year = Number(monthParts[0]);
      const month = Number(monthParts[1]);
      const locale = scenario.props.locale ?? 'en-US';
      expect(
        subject?.querySelector('[data-testid="subject-choose-month"]')?.textContent?.trim()
      ).toBe(
        new Intl.DateTimeFormat(locale, {
          calendar: 'gregory',
          month: 'long',
          timeZone: 'UTC',
        }).format(new Date(Date.UTC(year, month - 1, 1, 12)))
      );
      expect(
        subject?.querySelector('[data-testid="subject-choose-year"]')?.textContent?.trim()
      ).toBe(new Intl.NumberFormat(locale, { useGrouping: false }).format(year));
      expect(onValueChange.mock.calls.map(([detail]) => detail.value)).toEqual(
        scenario.expected.changes
      );
      const selectedButton = scenario.expected.value
        ? subject?.querySelector(`[data-testid="subject-day-${scenario.expected.value}"]`)
        : null;
      if (selectedButton) expect(selectedButton.getAttribute('aria-selected')).toBe('true');
    });
  }
});

describe('Calendar (native): contract drift', () => {
  it('handles exactly the native contract props', async () => {
    expect([...calendarPropNames].sort()).toEqual(propNames(calendarContract, 'native').sort());
    await render(<Calendar testID="subject" />);
  });
});

describe('Calendar (native)', () => {
  it('uses the active theme, a 44-point day target and accessible selection states', async () => {
    const date = getCalendarToday();
    const subject = await render(<Calendar defaultValue={date} locale="en-US" testID="subject" />);
    const button = dayButton(date);
    const style = JSON.parse(button.getAttribute('data-style') ?? '{}') as Record<string, unknown>;
    const theme = getNativeTheme(defaultThemeName, 'light');

    expect(style.minHeight).toBe(44);
    expect(style.minWidth).toBe(44);
    expect(style.backgroundColor).toBe(theme.colors.primary);
    expect(button.getAttribute('aria-selected')).toBe('true');
    expect(button.getAttribute('aria-label')).toContain(formatCalendarDate(date, 'en-US'));
    expect(subject?.querySelector('[role="grid"]')).not.toBeNull();
  });

  it('uses native button semantics and announces month navigation', async () => {
    Platform.OS = 'android';
    const subject = await render(
      <Calendar defaultValue="2024-05-15" locale="en-US" testID="subject" />
    );
    expect(subject?.querySelector('[role="grid"]')).toBeNull();
    expect(dayButton('2024-05-15').getAttribute('role')).toBe('button');
    const next = container?.querySelector<HTMLButtonElement>('[data-testid="subject-next"]');
    if (!next) throw new Error('Missing next-month button.');
    await act(async () => next.click());
    expect(__accessibilityAnnouncements).toContain('June 2024');
  });

  it('jumps to a month or year without changing the selected date', async () => {
    const onValueChange = vi.fn<(detail: CalendarChangeDetail) => void>();
    const subject = await render(
      <Calendar
        defaultValue="2024-05-15"
        locale="en-US"
        onValueChange={onValueChange}
        testID="subject"
      />
    );
    const chooseMonth = container?.querySelector<HTMLButtonElement>(
      '[data-testid="subject-choose-month"]'
    );
    if (!chooseMonth) throw new Error('Missing month picker button.');
    await act(async () => chooseMonth.click());

    const august = container?.querySelector<HTMLButtonElement>('[data-testid="subject-month-08"]');
    if (!august) throw new Error('Missing August option.');
    await act(async () => august.click());
    expect(subject?.textContent).toContain('August');

    const chooseYear = container?.querySelector<HTMLButtonElement>(
      '[data-testid="subject-choose-year"]'
    );
    if (!chooseYear) throw new Error('Missing year picker button.');
    await act(async () => chooseYear.click());
    const year = container?.querySelector<HTMLButtonElement>('[data-testid="subject-year-2030"]');
    if (!year) throw new Error('Missing 2030 option.');
    await act(async () => year.click());

    expect(subject?.textContent).toContain('2030');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps native month and year choices inside the selectable bounds', async () => {
    const subject = await render(
      <Calendar
        defaultValue="2024-06-15"
        min="2024-06-10"
        max="2025-02-02"
        locale="en-US"
        testID="subject"
      />
    );
    const chooseYear = container?.querySelector<HTMLButtonElement>(
      '[data-testid="subject-choose-year"]'
    );
    if (!chooseYear) throw new Error('Missing year picker button.');
    await act(async () => chooseYear.click());

    expect(
      container?.querySelector<HTMLButtonElement>('[data-testid="subject-year-2023"]')?.disabled
    ).toBe(true);
    const year = container?.querySelector<HTMLButtonElement>('[data-testid="subject-year-2025"]');
    if (!year) throw new Error('Missing 2025 option.');
    await act(async () => year.click());

    expect(subject?.textContent).toContain('February');
  });

  it('marks bounded native dates as disabled buttons', async () => {
    Platform.OS = 'android';
    await render(
      <Calendar defaultValue="2024-05-15" min="2024-05-10" max="2024-05-20" testID="subject" />
    );
    expect(dayButton('2024-05-09').disabled).toBe(true);
    expect(dayButton('2024-05-09').getAttribute('aria-disabled')).toBe('true');
  });
});
