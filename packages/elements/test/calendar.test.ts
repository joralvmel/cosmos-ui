import {
  type CalendarChangeDetail,
  calendarContract,
  calendarScenariosFor,
  eventNames,
  formatCalendarMonth,
  getCalendarToday,
  propNames,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmCalendar } from '../src/components/calendar/cosm-calendar.js';
import { cleanup, fixture } from './fixture.js';

afterEach(cleanup);

async function createCalendar(props: Partial<CosmCalendar> = {}): Promise<CosmCalendar> {
  const element = await fixture<CosmCalendar>('<cosm-calendar></cosm-calendar>');
  Object.assign(element, props);
  await element.updateComplete;
  return element;
}

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
  active.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      key: shiftKey ? key.slice('Shift+'.length) : key,
      shiftKey,
    })
  );
  if (key === 'Enter' || key === ' ') active.click();
  await element.updateComplete;
}

describe('cosm-calendar: shared scenarios', () => {
  for (const scenario of calendarScenariosFor('web')) {
    it(scenario.name, async () => {
      const element = await createCalendar(scenario.props);
      const changes: string[] = [];
      element.addEventListener('cosm-change', event => {
        changes.push((event as CustomEvent<CalendarChangeDetail>).detail.value);
      });

      for (const action of scenario.actions) {
        if (action.type === 'select') dayButton(element, action.value).click();
        else if (action.type === 'sync') element.value = action.value;
        else if (action.type === 'navigate') {
          const selector = action.months < 0 ? '[part="previous"]' : '[part="next"]';
          for (let month = 0; month < Math.abs(action.months); month++) {
            const button = element.shadowRoot?.querySelector<HTMLElement>(`cosm-button${selector}`);
            if (!button) throw new Error('Missing calendar navigation button.');
            button.click();
          }
        } else if (action.type === 'key') await applyKey(element, action.key);
        await element.updateComplete;
      }

      expect(element.value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      expect(element.shadowRoot?.querySelector('[part="heading"]')?.textContent?.trim()).toBe(
        formatCalendarMonth(scenario.expected.month, scenario.props.locale ?? 'en-US')
      );
      expect(
        element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]')?.dataset.date
      ).toBe(scenario.expected.activeDate);
      expect(element.disabled).toBe(scenario.expected.disabled);
    });
  }
});

describe('cosm-calendar: contract drift', () => {
  it('exposes exactly the web props of the contract', async () => {
    const element = await createCalendar();
    expect(Object.keys(CosmCalendar.properties).sort()).toEqual(
      propNames(calendarContract, 'web').sort()
    );
    expect(eventNames(calendarContract, 'dom')).toEqual(['cosm-change']);
    expect(element).toBeInstanceOf(CosmCalendar);
  });

  it('dispatches the contract event as the original composed CustomEvent', async () => {
    const element = await createCalendar({ defaultValue: '2024-05-15' });
    const listener = vi.fn<(event: CustomEvent<CalendarChangeDetail>) => void>();
    element.addEventListener('cosm-change', listener);
    dayButton(element, '2024-05-16').click();

    expect(listener).toHaveBeenCalledOnce();
    const event = listener.mock.calls[0]?.[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event?.bubbles).toBe(true);
    expect(event?.composed).toBe(true);
    expect(event?.detail).toEqual({ value: '2024-05-16' });
  });
});

describe('cosm-calendar', () => {
  it('localizes week headings and date labels and reflects RTL direction', async () => {
    const element = await createCalendar({
      defaultValue: '2024-05-15',
      locale: 'ar-EG',
    });
    const firstWeekday = element.shadowRoot?.querySelector('[part="weekday"]');
    const previousIcon = element.shadowRoot?.querySelector<HTMLElementTagNameMap['cosm-icon']>(
      'cosm-button[part="previous"] cosm-icon'
    );
    const nextIcon = element.shadowRoot?.querySelector<HTMLElementTagNameMap['cosm-icon']>(
      'cosm-button[part="next"] cosm-icon'
    );
    expect(element.shadowRoot?.querySelector('[part="base"]')?.getAttribute('dir')).toBe('rtl');
    expect(firstWeekday?.getAttribute('aria-label')).toBe(
      new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(new Date('2024-01-06T12:00:00Z'))
    );
    expect(dayButton(element, '2024-05-15').getAttribute('aria-label')).toContain('١٥');
    expect(previousIcon?.icon.name).toBe('chevron-right');
    expect(nextIcon?.icon.name).toBe('chevron-left');
  });

  it('uses a single roving date tab stop and moves by day, week, month and year', async () => {
    const element = await createCalendar({ defaultValue: '2024-05-15', locale: 'en-US' });
    expect(element.shadowRoot?.querySelectorAll('.day[tabindex="0"]')).toHaveLength(1);
    await applyKey(element, 'ArrowRight');
    expect(
      element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]')?.dataset.date
    ).toBe('2024-05-16');
    await applyKey(element, 'ArrowDown');
    expect(
      element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]')?.dataset.date
    ).toBe('2024-05-23');
    await applyKey(element, 'Home');
    expect(
      element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]')?.dataset.date
    ).toBe('2024-05-19');
    await applyKey(element, 'End');
    expect(
      element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]')?.dataset.date
    ).toBe('2024-05-25');
    await applyKey(element, 'PageUp');
    expect(
      element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]')?.dataset.date
    ).toBe('2024-04-25');
    await applyKey(element, 'Shift+PageDown');
    expect(
      element.shadowRoot?.querySelector<HTMLButtonElement>('.day[tabindex="0"]')?.dataset.date
    ).toBe('2025-04-25');
  });

  it('marks today and selected state without relying on color alone', async () => {
    const todayDate = getCalendarToday();
    const element = await createCalendar({ defaultValue: todayDate, locale: 'en-US' });
    const selectedCell = dayButton(element, todayDate).parentElement;
    expect(selectedCell?.getAttribute('role')).toBe('gridcell');
    expect(selectedCell?.getAttribute('aria-selected')).toBe('true');
    const today = element.shadowRoot?.querySelector('[aria-current="date"]');
    expect(today?.getAttribute('aria-label')).toContain('today');
  });

  it('rejects invalid dates and reversed bounds explicitly', async () => {
    const element = await createCalendar();
    element.min = '2024-06-01';
    element.max = '2024-05-01';
    await expect(element.updateComplete).rejects.toThrow(/min/);

    const invalid = await fixture<CosmCalendar>('<cosm-calendar></cosm-calendar>');
    invalid.defaultValue = '2024-02-30';
    await expect(invalid.updateComplete).rejects.toThrow(/Invalid calendar date/);
  });
});
