import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type CalendarChangeDetail,
  calendarContract,
  calendarScenariosFor,
  eventNames,
  formatCalendarMonth,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmCalendar } from '@joralvmel/cosmos-elements/calendar';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COSMOS_COMPONENTS, CosmCalendarComponent } from '../src/index.js';

@Component({
  imports: [CosmCalendarComponent],
  template: '<cosm-calendar></cosm-calendar>',
})
class HostComponent {}

afterEach(() => TestBed.resetTestingModule());

async function setup() {
  await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const host = fixture.debugElement.children[0];
  if (!host) throw new Error('Calendar host was not rendered.');
  const component = host.componentInstance as CosmCalendarComponent;
  await component.element.updateComplete;
  return { fixture, component, element: component.element };
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

describe('CosmCalendarComponent', () => {
  for (const scenario of calendarScenariosFor('angular')) {
    it(scenario.name, async () => {
      const { element } = await setup();
      Object.assign(element, scenario.props);
      element.valueControlled = scenario.props.value !== undefined;
      await element.updateComplete;
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

  it('forwards all inputs and joins COSMOS_COMPONENTS', async () => {
    const { component, element } = await setup();
    component.value = '2024-05-15';
    component.defaultValue = '2024-05-16';
    component.min = '2024-05-01';
    component.max = '2024-05-31';
    component.locale = 'en-US';
    component.disabled = true;
    await element.updateComplete;

    expect(element.value).toBe('2024-05-15');
    expect(element.defaultValue).toBe('2024-05-16');
    expect(element.min).toBe('2024-05-01');
    expect(element.max).toBe('2024-05-31');
    expect(element.locale).toBe('en-US');
    expect(element.disabled).toBe(true);
    expect(COSMOS_COMPONENTS).toContain(CosmCalendarComponent);
  });

  it('re-emits the original CustomEvent from the underlying element', async () => {
    const { component, element } = await setup();
    const listener = vi.fn();
    component.valueChange.subscribe(listener);
    const event = new CustomEvent<CalendarChangeDetail>('cosm-change', {
      detail: { value: '2024-05-16' },
      bubbles: true,
      composed: true,
    });
    element.dispatchEvent(event);
    expect(listener.mock.calls[0]?.[0]).toBe(event);
  });
});

describe('CosmCalendarComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmCalendarComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(calendarContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(calendarContract, 'angular'));
  });
});
