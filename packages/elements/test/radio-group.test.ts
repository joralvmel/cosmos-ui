import {
  eventNames,
  propNames,
  type RadioGroupChangeDetail,
  radioGroupContract,
  radioGroupScenarioOptions,
  radioGroupScenariosFor,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmRadioGroup } from '../src/components/radio-group/cosm-radio-group.js';

const mounted: HTMLElement[] = [];

afterEach(() => {
  for (const host of mounted.splice(0)) host.remove();
});

async function createRadioGroup(props: Partial<CosmRadioGroup> = {}): Promise<CosmRadioGroup> {
  const host = document.createElement('div');
  const element = document.createElement('cosm-radio-group') as CosmRadioGroup;
  Object.assign(element, {
    label: 'Contact method',
    options: radioGroupScenarioOptions,
    ...props,
  });
  element.valueControlled = props.value !== undefined;
  host.append(element);
  document.body.append(host);
  mounted.push(host);
  await element.updateComplete;
  return element;
}

const radiosOf = (element: CosmRadioGroup) => [
  ...(element.shadowRoot?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []),
];
const radioOf = (element: CosmRadioGroup, value: string) =>
  radiosOf(element).find(radio => radio.value === value) as HTMLInputElement;

describe('cosm-radio-group: shared scenarios', () => {
  for (const scenario of radioGroupScenariosFor('web')) {
    it(scenario.name, async () => {
      const element = await createRadioGroup(scenario.props);
      const changes: (string | null)[] = [];
      element.addEventListener('cosm-change', event => {
        changes.push((event as CustomEvent<RadioGroupChangeDetail>).detail.value);
      });

      for (const action of scenario.actions) {
        if (action.type === 'select') radioOf(element, action.value).click();
        else {
          element.valueControlled = true;
          element.value = action.value;
        }
        await element.updateComplete;
      }

      expect(element.value).toBe(scenario.expected.value);
      expect(
        radiosOf(element)
          .filter(radio => radio.checked)
          .map(radio => radio.value)
      ).toEqual(scenario.expected.value === null ? [] : [scenario.expected.value]);
      expect(changes).toEqual(scenario.expected.changes);
    });
  }
});

describe('cosm-radio-group: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmRadioGroup.properties).sort()).toEqual(
      propNames(radioGroupContract, 'web').sort()
    );
  });

  it('dispatches the contract event as the original composed CustomEvent', async () => {
    const element = await createRadioGroup();
    const listener = vi.fn<(event: CustomEvent<RadioGroupChangeDetail>) => void>();
    element.addEventListener('cosm-change', listener);
    radioOf(element, 'email').click();

    expect(eventNames(radioGroupContract, 'dom')).toEqual(['cosm-change']);
    expect(listener).toHaveBeenCalledOnce();
    const event = listener.mock.calls[0]?.[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event?.bubbles).toBe(true);
    expect(event?.composed).toBe(true);
    expect(event?.detail).toEqual({ value: 'email' });
  });
});

describe('cosm-radio-group', () => {
  it('renders labeled radio semantics, descriptions and validation state', async () => {
    const element = await createRadioGroup({
      required: true,
      invalid: true,
      helpText: 'Choose one contact method.',
      errorText: 'A contact method is required.',
      orientation: 'horizontal',
    });
    const group = element.shadowRoot?.querySelector<HTMLElement>('[part="base"]');
    const input = radioOf(element, 'email');
    if (!group) throw new Error('Missing radio group fieldset.');

    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.querySelector('[part="label"]')?.textContent).toBe('Contact method');
    expect(group.getAttribute('aria-required')).toBe('true');
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(group.getAttribute('aria-describedby')).toContain('help');
    expect(group.getAttribute('aria-describedby')).toContain('error');
    expect(input.type).toBe('radio');
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-describedby')).toContain('option');
    expect(
      element.shadowRoot?.querySelector('[part="options"]')?.getAttribute('data-orientation')
    ).toBe('horizontal');
    expect(element.shadowRoot?.querySelector('[part="error-text"]')?.textContent).toBe(
      'A contact method is required.'
    );
  });

  it('associates with a form, resets to defaultValue and proposes a controlled reset', async () => {
    const form = document.createElement('form');
    const element = await createRadioGroup({ name: 'contact-method', defaultValue: 'email' });
    form.append(element);
    document.body.append(form);
    expect(element.form).toBe(form);

    radioOf(element, 'phone').click();
    await element.updateComplete;
    expect(element.value).toBe('phone');
    element.formResetCallback();
    await element.updateComplete;
    expect(element.value).toBe('email');

    element.value = null;
    element.valueControlled = true;
    await element.updateComplete;
    const changes: (string | null)[] = [];
    element.addEventListener('cosm-change', event => {
      changes.push((event as CustomEvent<RadioGroupChangeDetail>).detail.value);
    });
    element.formResetCallback();
    expect(element.value).toBeNull();
    expect(changes).toEqual(['email']);
    form.remove();
  });

  it('honors disabled-fieldset state and rejects invalid option data', async () => {
    const element = await createRadioGroup();
    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(radioOf(element, 'email').disabled).toBe(true);
    radioOf(element, 'email').click();
    expect(element.value).toBeNull();

    element.options = [
      { value: 'duplicate', label: 'First' },
      { value: 'duplicate', label: 'Second' },
    ];
    await expect(element.updateComplete).rejects.toThrow(/must be unique/);
  });
});
