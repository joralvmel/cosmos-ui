import {
  eventNames,
  type ListboxItem,
  type ListboxScenario,
  type ListboxSelectionChangeDetail,
  listboxContract,
  listboxScenarioItems,
  listboxScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmListbox } from '@joralvmel/cosmos-elements/listbox';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Listbox, type ListboxProps, listboxEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const typedScenarioItems: readonly ListboxItem<IconDefinition>[] = listboxScenarioItems.map(item =>
  'options' in item
    ? {
        label: item.label,
        options: item.options.map(({ icon: _icon, ...option }) => option),
      }
    : (({ icon: _icon, ...option }) => option)(item)
);

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: Partial<ListboxProps> = {}) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await update(props);
  return getElement();
}

async function update(props: Partial<ListboxProps>) {
  await act(async () =>
    root?.render(<Listbox label="Choose fruit" items={typedScenarioItems} {...props} />)
  );
  await getElement().updateComplete;
}

function getElement(): CosmListbox {
  const element = container?.querySelector('cosm-listbox');
  if (!(element instanceof HTMLElement)) throw new Error('Listbox element was not rendered.');
  return element as CosmListbox;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

const options = (element: CosmListbox) => [
  ...(element.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]') ?? []),
];

const key = (element: CosmListbox, pressed: string) => {
  const active = options(element).find(option => option.dataset.active === 'true');
  active?.dispatchEvent(new KeyboardEvent('keydown', { key: pressed, bubbles: true }));
};

function typedProps(props: ListboxScenario['props']): Partial<ListboxProps> {
  const { items: _items, ...otherProps } = props;
  return { ...otherProps, items: typedScenarioItems };
}

describe('Listbox: shared scenarios', () => {
  for (const scenario of listboxScenariosFor('react')) {
    it(scenario.name, async () => {
      const element = await render(typedProps(scenario.props));
      if (
        scenario.actions.some(
          action =>
            action.type === 'key' || (action.type === 'activate' && action.source === 'keyboard')
        )
      ) {
        element.focus();
      }
      const changes: string[][] = [];
      const listener = (event: CustomEvent<ListboxSelectionChangeDetail>) => {
        changes.push([...event.detail.selectedValues]);
      };
      element.addEventListener('cosm-selection-change', listener);

      for (const action of scenario.actions) {
        if (action.type === 'activate') {
          await act(async () => {
            if (action.source === 'pointer') {
              options(element)
                .find(option => option.dataset.value === action.value)
                ?.click();
            } else {
              options(element)
                .find(option => option.dataset.value === action.value)
                ?.focus();
              key(element, 'Enter');
            }
          });
        } else if (action.type === 'sync') {
          await update({ ...typedProps(scenario.props), selectedValues: action.selectedValues });
        } else {
          await act(async () => key(element, action.key));
        }
        await act(async () => element.updateComplete);
      }

      expect(element.currentSelectedValues).toEqual(scenario.expected.selectedValues);
      expect(changes).toEqual(scenario.expected.changes);
      if (scenario.expected.activeValue !== undefined) {
        expect(element.activeValue).toBe(scenario.expected.activeValue);
        expect(
          options(element).find(option => option.dataset.active === 'true')?.dataset.value
        ).toBe(scenario.expected.activeValue);
      }
    });
  }
});

describe('Listbox: contract drift', () => {
  it('maps every contract event to its React name and DOM event', () => {
    expect(Object.keys(listboxEvents)).toEqual(eventNames(listboxContract, 'react'));
    expect(Object.values(listboxEvents)).toEqual(eventNames(listboxContract, 'dom'));
  });

  it('forwards every contract prop and detects an empty controlled array', async () => {
    const values: ListboxProps = {
      label: 'Choices',
      labelHidden: true,
      items: typedScenarioItems,
      selectionMode: 'multiple',
      selectedValues: [],
      defaultSelectedValues: ['apple'],
      variant: 'outlined',
      size: 48,
      disabled: true,
      readOnly: true,
      locale: 'en',
    };
    expect(Object.keys(values).sort()).toEqual(propNames(listboxContract, 'react').sort());
    const element = await render(values);
    for (const name of propNames(listboxContract, 'react')) {
      expect(Reflect.get(element, name), name).toBe(Reflect.get(values, name));
    }
    expect(element.selectedValuesControlled).toBe(true);
    expect(element.currentSelectedValues).toEqual([]);
  });
});

describe('Listbox', () => {
  it('forwards the original CustomEvent and waits for controlled owner acceptance', async () => {
    const handler = vi.fn<(event: CustomEvent<ListboxSelectionChangeDetail>) => void>();
    let element = await render({ selectedValues: [], onSelectionChange: handler });
    const option = options(element).find(item => item.dataset.value === 'apple');
    await act(async () => option?.click());
    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect(handler.mock.calls[0]?.[0].detail.selectedValues).toEqual(['apple']);
    expect(element.currentSelectedValues).toEqual([]);

    await update({ selectedValues: ['apple'], onSelectionChange: handler });
    element = getElement();
    expect(element.currentSelectedValues).toEqual(['apple']);
    await act(async () =>
      options(element)
        .find(item => item.dataset.value === 'apple')
        ?.click()
    );
    expect(handler).toHaveBeenCalledOnce();
  });

  it('keeps focus navigation independent of selection and renders accessible groups', async () => {
    const element = await render({ defaultSelectedValues: ['apple'] });
    expect(options(element).filter(option => option.tabIndex === 0)).toHaveLength(1);
    await act(async () => {
      element.focus();
      key(element, 'ArrowDown');
      key(element, 'End');
      key(element, 'c');
    });
    await element.updateComplete;
    expect(element.currentSelectedValues).toEqual(['apple']);
    expect(element.activeValue).toBe('cherry');
    expect(element.shadowRoot?.querySelector('[part="group"]')?.getAttribute('role')).toBe('group');
    expect(element.shadowRoot?.querySelector('[part="group-label"]')?.textContent).toBe('Fruit');
    expect(
      element.shadowRoot?.querySelector('[role="listbox"]')?.getAttribute('aria-labelledby')
    ).toBeTruthy();
  });

  it('preserves actual values when imperative ownership metadata switches to autonomous', async () => {
    const element = await render({ selectedValues: [] });
    expect(element.selectedValuesControlled).toBe(true);
    element.selectedValuesControlled = false;
    await element.updateComplete;
    expect(element.currentSelectedValues).toEqual([]);
  });

  it('rejects invalid option data forwarded through the wrapper', async () => {
    const element = await render();
    Reflect.set(element, 'items', [{ value: '', label: 'Invalid' }]);
    await expect(element.updateComplete).rejects.toThrow('nonempty value and label strings');
  });
});
