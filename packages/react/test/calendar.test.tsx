import {
  type CalendarChangeDetail,
  calendarContract,
  calendarScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmCalendar } from '@joralvmel/cosmos-elements/calendar';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Calendar, type CalendarProps, calendarEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: Partial<CalendarProps> = {}) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<Calendar {...props} />));
  const element = container.querySelector('cosm-calendar') as CosmCalendar;
  await element.updateComplete;
  return element;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

function dayButton(element: CosmCalendar, value: string): HTMLButtonElement {
  const button = element.shadowRoot?.querySelector<HTMLButtonElement>(
    `button[data-date="${value}"]`
  );
  if (!button) throw new Error(`Missing calendar date ${value}.`);
  return button;
}

async function applyKey(element: CosmCalendar, key: string) {
  const active = element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]');
  if (!active) throw new Error('The calendar has no active date.');
  const shiftKey = key.startsWith('Shift+');
  await act(async () => {
    active.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        key: shiftKey ? key.slice('Shift+'.length) : key,
        shiftKey,
      })
    );
    if (key === 'Enter' || key === ' ') active.click();
  });
  await element.updateComplete;
}

function ControlledCalendar() {
  const [value, setValue] = React.useState('2024-05-15');
  return <Calendar value={value} locale="en-US" onChange={event => setValue(event.detail.value)} />;
}

describe('Calendar: shared scenarios', () => {
  for (const scenario of calendarScenariosFor('react')) {
    it(scenario.name, async () => {
      const changes: string[] = [];
      const onChange = (event: CustomEvent<CalendarChangeDetail>) =>
        changes.push(event.detail.value);
      const element = await render({ ...scenario.props, onChange });

      for (const action of scenario.actions) {
        if (action.type === 'select') {
          await act(async () => dayButton(element, action.value).click());
        } else if (action.type === 'sync') {
          await act(async () =>
            root?.render(<Calendar {...scenario.props} value={action.value} onChange={onChange} />)
          );
        } else if (action.type === 'navigate') {
          const selector = action.months < 0 ? '[part="previous"]' : '[part="next"]';
          for (let month = 0; month < Math.abs(action.months); month++) {
            const button = element.shadowRoot?.querySelector<HTMLElement>(`cosm-button${selector}`);
            if (!button) throw new Error('Missing calendar navigation button.');
            await act(async () => button.click());
          }
        } else if (action.type === 'key') {
          await applyKey(element, action.key);
        }
        await act(async () => element.updateComplete);
      }

      expect(element.value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      const monthParts = scenario.expected.month.split('-');
      const year = Number(monthParts[0]);
      const month = Number(monthParts[1]);
      const locale = scenario.props.locale ?? 'en-US';
      expect(
        element.shadowRoot
          ?.querySelector('[part="heading"] [part="month-trigger"]')
          ?.textContent?.trim()
      ).toBe(
        new Intl.DateTimeFormat(locale, {
          calendar: 'gregory',
          month: 'long',
          timeZone: 'UTC',
        }).format(new Date(Date.UTC(year, month - 1, 1, 12)))
      );
      expect(
        element.shadowRoot
          ?.querySelector('[part="heading"] [part="year-trigger"]')
          ?.textContent?.trim()
      ).toBe(new Intl.NumberFormat(locale, { useGrouping: false }).format(year));
      expect(
        element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]')?.dataset.date
      ).toBe(scenario.expected.activeDate);
      expect(element.disabled).toBe(scenario.expected.disabled);
    });
  }
});

describe('Calendar: contract drift', () => {
  it('maps every contract event to its React name and DOM event', () => {
    expect(Object.keys(calendarEvents)).toEqual(eventNames(calendarContract, 'react'));
    expect(Object.values(calendarEvents)).toEqual(eventNames(calendarContract, 'dom'));
  });

  it('forwards every contract prop to the element', async () => {
    const values: Record<string, unknown> = {
      value: '2024-05-15',
      defaultValue: '2024-05-16',
      min: '2024-05-01',
      max: '2024-05-31',
      locale: 'en-US',
      disabled: true,
    };
    expect(Object.keys(values).sort()).toEqual(propNames(calendarContract, 'react').sort());
    const element = await render(values as CalendarProps);
    for (const [name, value] of Object.entries(values))
      expect(element[name as keyof CosmCalendar], name).toBe(value);
    expect(element.valueControlled).toBe(true);
  });

  it('forwards the original change CustomEvent and supports immediate controlled acceptance', async () => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root?.render(<ControlledCalendar />));
    const element = container?.querySelector('cosm-calendar') as CosmCalendar;
    await element.updateComplete;
    const listener = vi.fn<(event: CustomEvent<CalendarChangeDetail>) => void>();
    element.addEventListener('cosm-change', listener);
    await act(async () => dayButton(element, '2024-05-16').click());
    await element.updateComplete;

    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0]?.[0].detail).toEqual({ value: '2024-05-16' });
    expect(element.value).toBe('2024-05-16');
  });
});
