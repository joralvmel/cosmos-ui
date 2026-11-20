import {
  eventNames,
  propNames,
  type SelectChangeDetail,
  selectContract,
  selectScenarioItems,
  selectScenariosFor,
} from '@joralvmel/cosmos-core';
import type { CosmSelect } from '@joralvmel/cosmos-elements/select';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Select, type SelectProps, selectEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

const baseProps: Pick<SelectProps, 'label' | 'items' | 'placeholder'> = {
  label: 'Fruit',
  items: selectScenarioItems,
  placeholder: 'Choose a fruit',
};

async function render(props: SelectProps) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<Select {...props} />));
  return getElement();
}

async function rerender(props: SelectProps) {
  await act(async () => root?.render(<Select {...props} />));
  return getElement();
}

function getElement(): CosmSelect {
  const element = container?.querySelector('cosm-select');
  if (!(element instanceof HTMLElement)) throw new Error('Select element was not rendered.');
  return element as CosmSelect;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

const optionOf = (element: CosmSelect, value: string) =>
  [...(element.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])].find(
    option => option.dataset.value === value
  );

describe('Select: shared scenarios', () => {
  for (const scenario of selectScenariosFor('react')) {
    it(scenario.name, async () => {
      let props = { ...baseProps, ...scenario.props } as SelectProps;
      const onChange = vi.fn<(event: CustomEvent<SelectChangeDetail>) => void>();
      props = { ...props, onChange };
      let element = await render(props);

      for (const action of scenario.actions) {
        if (action.type === 'select') optionOf(element, action.value)?.click();
        else if (action.type === 'clear') {
          element.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]')?.click();
        } else {
          props = { ...props, value: action.value };
          element = await rerender(props);
        }
        await act(async () => element.updateComplete);
      }

      expect(element.value).toBe(scenario.expected.value);
      expect(onChange.mock.calls.map(([event]) => event.detail.value)).toEqual(
        scenario.expected.changes
      );
    });
  }
});

describe('Select: contract drift', () => {
  it('maps every contract event to its React name and DOM event', () => {
    expect(Object.keys(selectEvents)).toEqual(eventNames(selectContract, 'react'));
    expect(Object.values(selectEvents)).toEqual(eventNames(selectContract, 'dom'));
  });

  it('forwards every contract prop to the element', async () => {
    const element = await render(baseProps);
    for (const name of propNames(selectContract, 'react')) {
      expect(name in element, name).toBe(true);
    }
  });

  it('forwards the original DOM CustomEvent to onChange', async () => {
    const onChange = vi.fn<(event: CustomEvent<SelectChangeDetail>) => void>();
    const element = await render({ ...baseProps, onChange });
    optionOf(element, 'apple')?.click();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect(onChange.mock.calls[0]?.[0].detail).toEqual({ value: 'apple' });
  });
});
