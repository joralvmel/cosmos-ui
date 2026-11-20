import {
  eventNames,
  type ListboxItem,
  propNames,
  type SelectChangeDetail,
  selectContract,
  selectScenarioItems,
  selectScenariosFor,
} from '@joralvmel/cosmos-core';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmSelect } from '../src/components/select/cosm-select.js';

const typedScenarioItems: readonly ListboxItem<IconDefinition>[] = selectScenarioItems.map(item =>
  'options' in item
    ? {
        label: item.label,
        options: item.options.map(({ icon: _icon, ...option }) => option),
      }
    : (({ icon: _icon, ...option }) => option)(item)
);

const mounted: HTMLElement[] = [];

async function createSelect(props: Partial<CosmSelect> = {}): Promise<CosmSelect> {
  const element = document.createElement('cosm-select') as CosmSelect;
  Object.assign(
    element,
    {
      label: 'Fruit',
      items: typedScenarioItems,
      placeholder: 'Choose a fruit',
    },
    props
  );
  element.valueControlled = props.value !== undefined;
  document.body.append(element);
  mounted.push(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  for (const element of mounted.splice(0)) element.remove();
});

const optionOf = (element: CosmSelect, value: string) =>
  [...(element.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])].find(
    option => option.dataset.value === value
  );

describe('cosm-select: shared scenarios', () => {
  for (const scenario of selectScenariosFor('web')) {
    it(scenario.name, async () => {
      const element = await createSelect({ ...scenario.props, items: typedScenarioItems });
      const changes: (string | null)[] = [];
      element.addEventListener('cosm-change', event => {
        changes.push((event as CustomEvent<SelectChangeDetail>).detail.value);
      });

      for (const action of scenario.actions) {
        if (action.type === 'select') optionOf(element, action.value)?.click();
        else if (action.type === 'clear') {
          element.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]')?.click();
        } else {
          element.valueControlled = true;
          element.value = action.value;
        }
        await element.updateComplete;
      }

      expect(element.value).toBe(scenario.expected.value);
      expect(
        [
          ...(element.shadowRoot?.querySelectorAll<HTMLElement>(
            '[role="option"][aria-selected="true"]'
          ) ?? []),
        ].map(option => option.dataset.value)
      ).toEqual(scenario.expected.value === null ? [] : [scenario.expected.value]);
      expect(changes).toEqual(scenario.expected.changes);
    });
  }
});

describe('cosm-select: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmSelect.properties).sort()).toEqual(
      propNames(selectContract, 'web').sort()
    );
  });

  it('dispatches the contract event as the original composed CustomEvent', async () => {
    const element = await createSelect();
    const listener = vi.fn<(event: CustomEvent<SelectChangeDetail>) => void>();
    element.addEventListener('cosm-change', listener);
    optionOf(element, 'apple')?.click();

    expect(eventNames(selectContract, 'dom')).toEqual(['cosm-change']);
    expect(listener).toHaveBeenCalledOnce();
    const event = listener.mock.calls[0]?.[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event?.bubbles).toBe(true);
    expect(event?.composed).toBe(true);
    expect(event?.detail).toEqual({ value: 'apple' });
  });
});

describe('cosm-select', () => {
  it('renders a labeled combobox, grouped options, descriptions and validation state', async () => {
    const element = await createSelect({
      required: true,
      invalid: true,
      helpText: 'Choose one fruit.',
      errorText: 'A fruit is required.',
      clearable: true,
      clearLabel: 'Clear fruit',
      defaultValue: 'apple',
    });
    const trigger = element.shadowRoot?.querySelector<HTMLButtonElement>('[part="trigger"]');
    const listbox = element.shadowRoot?.querySelector<HTMLElement>('[part="listbox"]');
    const option = optionOf(element, 'apple');

    expect(trigger?.getAttribute('role')).toBe('combobox');
    expect(trigger?.getAttribute('aria-labelledby')).toContain('label');
    expect(trigger?.getAttribute('aria-required')).toBe('true');
    expect(trigger?.getAttribute('aria-invalid')).toBe('true');
    expect(trigger?.getAttribute('aria-describedby')).toContain('help');
    expect(trigger?.getAttribute('aria-describedby')).toContain('error');
    expect(listbox?.getAttribute('role')).toBe('listbox');
    expect(element.shadowRoot?.querySelector('[part="group"]')?.getAttribute('role')).toBe('group');
    expect(option?.getAttribute('aria-selected')).toBe('true');
    expect(option?.getAttribute('aria-describedby')).toContain('description');
    expect(
      element.shadowRoot?.querySelector('[part="clear-button"]')?.getAttribute('aria-label')
    ).toBe('Clear fruit');
  });

  it('opens with keyboard, navigates options without selection, commits, then restores focus', async () => {
    const element = await createSelect();
    const trigger = element.shadowRoot?.querySelector<HTMLButtonElement>('[part="trigger"]');
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await element.updateComplete;
    await Promise.resolve();

    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(element.shadowRoot?.querySelector('[part="popup"]')?.getAttribute('data-open')).toBe(
      'true'
    );
    expect(element.value).toBeNull();
    const first = optionOf(element, 'apple');
    first?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await element.updateComplete;
    expect(
      element.shadowRoot?.querySelector('[data-active="true"]')?.getAttribute('data-value')
    ).toBe('cherry');
    optionOf(element, 'cherry')?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    await element.updateComplete;
    expect(element.value).toBe('cherry');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the popup when the control becomes disabled and cannot reopen', async () => {
    const element = await createSelect();
    const trigger = element.shadowRoot?.querySelector<HTMLButtonElement>('[part="trigger"]');
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await element.updateComplete;
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    element.disabled = true;
    await element.updateComplete;
    await element.updateComplete;
    expect(trigger?.disabled).toBe(true);
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(element.shadowRoot?.querySelector('[part="popup"]')?.getAttribute('data-open')).toBe(
      'false'
    );

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await element.updateComplete;
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('resets autonomous values, proposes controlled resets, and honors form-disabled state', async () => {
    const form = document.createElement('form');
    const element = await createSelect({ name: 'fruit', defaultValue: 'apple' });
    form.append(element);
    document.body.append(form);
    expect(element.form).toBe(form);

    optionOf(element, 'cherry')?.click();
    await element.updateComplete;
    expect(element.value).toBe('cherry');
    element.formResetCallback();
    await element.updateComplete;
    expect(element.value).toBe('apple');

    element.value = null;
    element.valueControlled = true;
    await element.updateComplete;
    const changes: (string | null)[] = [];
    element.addEventListener('cosm-change', event => {
      changes.push((event as CustomEvent<SelectChangeDetail>).detail.value);
    });
    element.formResetCallback();
    expect(element.value).toBeNull();
    expect(changes).toEqual(['apple']);

    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('[part="trigger"]')?.hasAttribute('disabled')).toBe(
      true
    );
    form.remove();
  });

  it('rejects duplicate option values', async () => {
    const element = await createSelect();
    element.items = [
      { value: 'same', label: 'One' },
      { value: 'same', label: 'Two' },
    ];
    await expect(element.updateComplete).rejects.toThrow(/must be unique/);
  });

  it('rejects values outside the option collection', async () => {
    const element = await createSelect();
    element.value = 'missing';
    await expect(element.updateComplete).rejects.toThrow(/must be null or match/);
  });
});
