import {
  eventNames,
  type ListboxItem,
  type ListboxSelectionChangeDetail,
  listboxContract,
  listboxScenarioItems,
  listboxScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { check } from '@joralvmel/cosmos-icons/check';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmListbox } from '../src/components/listbox/cosm-listbox.js';

const typedScenarioItems: readonly ListboxItem<IconDefinition>[] = listboxScenarioItems.map(item =>
  'options' in item
    ? {
        label: item.label,
        options: item.options.map(({ icon: _icon, ...option }) => option),
      }
    : (({ icon: _icon, ...option }) => option)(item)
);

const mounted: CosmListbox[] = [];

async function createListbox(props: Partial<CosmListbox> = {}): Promise<CosmListbox> {
  const element = document.createElement('cosm-listbox');
  Object.assign(element, { label: 'Choose fruit', items: typedScenarioItems }, props);
  document.body.append(element);
  mounted.push(element);
  await element.updateComplete;
  return element;
}

afterEach(() => {
  for (const element of mounted.splice(0)) element.remove();
});

const options = (element: CosmListbox) => [
  ...(element.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]') ?? []),
];

const key = (element: CosmListbox, value: string, pressed: string) => {
  const option = options(element).find(item => item.dataset.value === value);
  option?.dispatchEvent(new KeyboardEvent('keydown', { key: pressed, bubbles: true }));
};

describe('cosm-listbox: shared scenarios', () => {
  for (const scenario of listboxScenariosFor('web')) {
    it(scenario.name, async () => {
      const { items: _items, ...scenarioProps } = scenario.props;
      const element = await createListbox({
        ...scenarioProps,
        items: typedScenarioItems,
      });
      element.selectedValuesControlled = scenario.props.selectedValues !== undefined;
      if (
        scenario.actions.some(
          action =>
            action.type === 'key' || (action.type === 'activate' && action.source === 'keyboard')
        )
      ) {
        element.focus();
      }
      const recorded: string[][] = [];
      element.addEventListener('cosm-selection-change', event => {
        recorded.push([
          ...(event as CustomEvent<ListboxSelectionChangeDetail>).detail.selectedValues,
        ]);
      });

      for (const action of scenario.actions) {
        if (action.type === 'activate') {
          if (action.source === 'pointer') {
            options(element)
              .find(item => item.dataset.value === action.value)
              ?.click();
          } else {
            element.focus();
            key(element, action.value, 'Enter');
          }
        } else if (action.type === 'sync') {
          element.selectedValues = action.selectedValues;
        } else {
          key(element, element.activeValue ?? '', action.key);
        }
        await element.updateComplete;
      }

      expect(element.currentSelectedValues).toEqual(scenario.expected.selectedValues);
      expect(recorded).toEqual(scenario.expected.changes);
      if (scenario.expected.activeValue !== undefined) {
        expect(element.activeValue).toBe(scenario.expected.activeValue);
        expect(options(element).find(item => item.dataset.active === 'true')?.dataset.value).toBe(
          scenario.expected.activeValue
        );
      }
    });
  }
});

describe('cosm-listbox: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmListbox.properties).sort()).toEqual(
      propNames(listboxContract, 'web').sort()
    );
  });

  it('dispatches the contract event as the original composed CustomEvent', async () => {
    const element = await createListbox();
    const listener = vi.fn<(event: CustomEvent<ListboxSelectionChangeDetail>) => void>();
    element.addEventListener('cosm-selection-change', listener);
    options(element)
      .find(option => option.dataset.value === 'apple')
      ?.click();
    expect(eventNames(listboxContract, 'dom')).toEqual(['cosm-selection-change']);
    expect(listener).toHaveBeenCalledOnce();
    const event = listener.mock.calls[0]?.[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event?.bubbles).toBe(true);
    expect(event?.composed).toBe(true);
    expect(event?.detail).toEqual({
      selectedValues: ['apple'],
      value: 'apple',
      source: 'pointer',
    });
  });
});

describe('cosm-listbox', () => {
  it('renders named groups, descriptions, decorative icons and required parts', async () => {
    const element = await createListbox({
      items: [
        {
          label: 'Choices',
          options: [
            { value: 'one', label: 'One', description: 'First item', icon: check },
            { value: 'two', label: 'Two' },
          ],
        },
      ],
    });
    const list = element.shadowRoot?.querySelector('[part="list"]');
    const option = options(element)[0];
    expect(list?.getAttribute('role')).toBe('listbox');
    expect(list?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(element.shadowRoot?.querySelector('[part="group"]')?.getAttribute('role')).toBe('group');
    expect(element.shadowRoot?.querySelector('[part="group-label"]')?.getAttribute('role')).toBe(
      null
    );
    expect(option?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(option?.getAttribute('aria-describedby')).toBeTruthy();
    expect(element.shadowRoot?.querySelector('[part="icon"]')?.getAttribute('decorative')).not.toBe(
      null
    );
    expect(element.shadowRoot?.querySelector('[part="indicator"]')).toBeTruthy();
    expect(element.shadowRoot?.querySelector('[part="description"]')?.textContent).toBe(
      'First item'
    );
  });

  it('offers one roving tab stop and moves focus without changing selection', async () => {
    const element = await createListbox({ defaultSelectedValues: ['apple'] });
    expect(options(element).filter(option => option.tabIndex === 0)).toHaveLength(1);
    element.focus();
    key(element, 'apple', 'ArrowDown');
    await element.updateComplete;
    expect(element.activeValue).toBe('apricot');
    expect(element.currentSelectedValues).toEqual(['apple']);
    expect(options(element).find(option => option.dataset.active === 'true')?.dataset.value).toBe(
      'apricot'
    );
    key(element, 'apricot', 'End');
    await element.updateComplete;
    expect(element.activeValue).toBe('cherry');
    key(element, 'cherry', 'ArrowDown');
    expect(element.activeValue).toBe('cherry');
  });

  it('initially makes the selected enabled option the roving focus target', async () => {
    const element = await createListbox({ defaultSelectedValues: ['cherry'] });
    expect(element.activeValue).toBe('cherry');
    expect(options(element).find(option => option.tabIndex === 0)?.dataset.value).toBe('cherry');
  });

  it('resets the Tab entry target on composite exit without moving outside focus', async () => {
    const element = await createListbox({ selectedValues: ['apple'] });
    const external = document.createElement('button');
    document.body.append(external);
    try {
      element.focus();
      key(element, 'apple', 'End');
      await element.updateComplete;
      expect(element.shadowRoot?.activeElement?.getAttribute('data-value')).toBe('cherry');
      external.focus();
      await element.updateComplete;
      expect(document.activeElement).toBe(external);
      expect(element.activeValue).toBe('apple');
      expect(options(element).find(option => option.tabIndex === 0)?.dataset.value).toBe('apple');

      // Focus the actual Tab stop, rather than calling the host's imperative focus helper.
      options(element)
        .find(option => option.tabIndex === 0)
        ?.focus();
      await element.updateComplete;
      expect(element.shadowRoot?.activeElement?.getAttribute('data-value')).toBe('apple');
      expect(element.currentSelectedValues).toEqual(['apple']);
    } finally {
      external.remove();
    }
  });

  it('does not redirect pointer entry to the selected option, including refused proposals', async () => {
    const element = await createListbox({ selectedValues: ['apple'] });
    const external = document.createElement('button');
    document.body.append(external);
    try {
      external.focus();
      const cherry = options(element).find(option => option.dataset.value === 'cherry');
      cherry?.dispatchEvent(
        new PointerEvent('pointerdown', { button: 0, bubbles: true, cancelable: true })
      );
      expect(element.shadowRoot?.activeElement?.getAttribute('data-value')).toBe('cherry');
      cherry?.click();
      await element.updateComplete;
      expect(element.shadowRoot?.activeElement?.getAttribute('data-value')).toBe('cherry');
      expect(element.activeValue).toBe('cherry');
      expect(element.currentSelectedValues).toEqual(['apple']);
      external.focus();
      await element.updateComplete;
      expect(document.activeElement).toBe(external);
      expect(options(element).find(option => option.tabIndex === 0)?.dataset.value).toBe('apple');
    } finally {
      external.remove();
    }
  });

  it('uses a matching selected option on refocus and exposes its actual selection and metadata', async () => {
    const element = await createListbox({ selectedValues: ['cherry'] });
    expect(element.selectedValuesControlled).toBe(true);
    expect(element.currentSelectedValues).toEqual(['cherry']);
    element.focus();
    expect(element.activeValue).toBe('cherry');
    element.selectedValuesControlled = false;
    expect(element.currentSelectedValues).toEqual([]);
    element.defaultSelectedValues = ['apricot'];
    element.requestUpdate();
    await element.updateComplete;
    expect(element.currentSelectedValues).toEqual([]);
    element.focus();
    expect(element.activeValue).toBe('apple');
  });

  it('reconciles a removed focused option without stealing focus from outside the list', async () => {
    const element = await createListbox();
    element.focus();
    expect(element.shadowRoot?.activeElement?.getAttribute('data-value')).toBe('apple');

    element.items = [{ value: 'cherry', label: 'Cherry' }];
    await element.updateComplete;
    expect(element.activeValue).toBe('cherry');
    expect(element.shadowRoot?.activeElement?.getAttribute('data-value')).toBe('cherry');

    const external = document.createElement('button');
    document.body.append(external);
    external.focus();
    element.selectedValues = ['cherry'];
    await element.updateComplete;
    expect(document.activeElement).toBe(external);
    external.remove();
  });

  it('proposes every refused controlled activation and commits only autonomous changes', async () => {
    const controlled = await createListbox({ selectedValues: [] });
    const controlledEvents = vi.fn();
    controlled.addEventListener('cosm-selection-change', controlledEvents);
    options(controlled)
      .find(option => option.dataset.value === 'apple')
      ?.click();
    options(controlled)
      .find(option => option.dataset.value === 'apple')
      ?.click();
    expect(controlledEvents).toHaveBeenCalledTimes(2);
    expect(controlled.currentSelectedValues).toEqual([]);

    const accepted = await createListbox({ selectedValues: ['apple'] });
    const acceptedEvents = vi.fn();
    accepted.addEventListener('cosm-selection-change', acceptedEvents);
    options(accepted)
      .find(option => option.dataset.value === 'apple')
      ?.click();
    expect(acceptedEvents).not.toHaveBeenCalled();

    const autonomous = await createListbox();
    options(autonomous)
      .find(option => option.dataset.value === 'apple')
      ?.click();
    await autonomous.updateComplete;
    expect(autonomous.currentSelectedValues).toEqual(['apple']);
    options(autonomous)
      .find(option => option.dataset.value === 'apple')
      ?.click();
    expect(autonomous.currentSelectedValues).toEqual(['apple']);
  });

  it('supports locale-aware typeahead, read-only exploration and custom minimum height', async () => {
    const element = await createListbox({
      readOnly: true,
      size: 53,
      locale: 'en',
      labelHidden: true,
    });
    expect(element.style.getPropertyValue('--_minimum-height')).toBe('53px');
    expect(element.shadowRoot?.querySelector('[part="label"]')?.className).toContain(
      'label-hidden'
    );
    element.focus();
    key(element, 'apple', 'c');
    await element.updateComplete;
    expect(element.activeValue).toBe('cherry');
    key(element, 'cherry', 'Enter');
    expect(element.currentSelectedValues).toEqual([]);
  });

  it('retains missing selected values and supports mixed mode states and disabled rows', async () => {
    const element = await createListbox({
      selectionMode: 'multiple',
      selectedValues: ['missing'],
      readOnly: true,
    });
    expect(element.currentSelectedValues).toEqual(['missing']);
    expect(
      element.shadowRoot?.querySelector('[role="listbox"]')?.getAttribute('aria-readonly')
    ).toBe('true');
    expect(options(element).find(option => option.dataset.value === 'banana')?.tabIndex).toBe(-1);
    element.disabled = true;
    await element.updateComplete;
    element.focus();
    expect(
      element.shadowRoot?.querySelector('[role="listbox"]')?.getAttribute('aria-disabled')
    ).toBe('true');
    expect(element.shadowRoot?.activeElement?.getAttribute('role')).not.toBe('option');
  });

  it('rejects invalid required labels, collections, selection values, modes, sizes and locales', async () => {
    const invalidLabel = document.createElement('cosm-listbox');
    Object.assign(invalidLabel, { label: ' ', items: typedScenarioItems });
    document.body.append(invalidLabel);
    mounted.push(invalidLabel);
    await expect(invalidLabel.updateComplete).rejects.toThrow('non-empty label');

    const invalidItems = await createListbox();
    Reflect.set(invalidItems, 'items', null);
    await expect(invalidItems.updateComplete).rejects.toThrow('items must be an array');

    const invalidOption = await createListbox();
    Reflect.set(invalidOption, 'items', [{ value: '', label: 'Invalid' }]);
    await expect(invalidOption.updateComplete).rejects.toThrow('nonempty value and label strings');

    const invalidGroup = await createListbox();
    Reflect.set(invalidGroup, 'items', [{ label: 'Empty group', options: [] }]);
    await expect(invalidGroup.updateComplete).rejects.toThrow('nonempty label and options array');

    const invalidIcon = await createListbox();
    Reflect.set(invalidIcon, 'items', [{ value: 'icon', label: 'Bad icon', icon: {} }]);
    await expect(invalidIcon.updateComplete).rejects.toThrow('valid IconDefinition');

    const invalidSelection = await createListbox();
    Reflect.set(invalidSelection, 'selectedValues', ['one', 'one']);
    await expect(invalidSelection.updateComplete).rejects.toThrow('unique nonempty strings');

    const invalidMode = await createListbox();
    Reflect.set(invalidMode, 'selectionMode', 'range');
    await expect(invalidMode.updateComplete).rejects.toThrow('selectionMode must be');

    const invalidSize = await createListbox();
    Reflect.set(invalidSize, 'size', Number.NaN);
    await expect(invalidSize.updateComplete).rejects.toThrow('size must be');

    const invalidLocale = await createListbox();
    invalidLocale.locale = 'not_a_locale';
    await expect(invalidLocale.updateComplete).rejects.toThrow('valid BCP 47 identifier');
  });
});
