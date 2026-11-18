import {
  type CheckboxCheckedChangeDetail,
  checkboxContract,
  checkboxScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmCheckbox } from '@joralvmel/cosmos-elements/checkbox';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox, type CheckboxProps, checkboxEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

const node = (props: Partial<CheckboxProps>) => (
  <Checkbox label="Accept terms" {...props}>
    <span aria-hidden="true" data-testid="supplemental" />
  </Checkbox>
);

async function render(props: Partial<CheckboxProps> = {}) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node(props)));
  const element = container.querySelector('cosm-checkbox') as CosmCheckbox;
  await element.updateComplete;
  return element;
}

async function rerender(props: Partial<CheckboxProps>) {
  await act(async () => root?.render(node(props)));
  const element = container?.querySelector('cosm-checkbox') as CosmCheckbox;
  await element.updateComplete;
  return element;
}

const inputOf = (element: CosmCheckbox) =>
  element.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe('Checkbox: shared scenarios', () => {
  for (const scenario of checkboxScenariosFor('react')) {
    it(scenario.name, async () => {
      const props = { ...scenario.props };
      const onCheckedChange = vi.fn<(event: CustomEvent<CheckboxCheckedChangeDetail>) => void>();
      const element = await render({ ...props, onCheckedChange });

      for (const action of scenario.actions) {
        if (action.type === 'activate') {
          await act(async () => inputOf(element).click());
        } else {
          Object.assign(props, { checked: action.checked });
          await rerender({ ...props, onCheckedChange });
        }
        await element.updateComplete;
      }

      expect(element.checked).toBe(scenario.expected.checked);
      expect(inputOf(element).checked).toBe(scenario.expected.checked);
      expect(onCheckedChange.mock.calls.map(([event]) => event.detail.checked)).toEqual(
        scenario.expected.changes
      );
      if (scenario.expected.indeterminate !== undefined) {
        expect(inputOf(element).indeterminate).toBe(scenario.expected.indeterminate);
      }
    });
  }
});

describe('Checkbox: contract drift', () => {
  it('maps every contract event to its React name', () => {
    expect(Object.keys(checkboxEvents)).toEqual(eventNames(checkboxContract, 'react'));
  });

  it('forwards every React contract prop to the element', async () => {
    const element = await render();
    for (const name of propNames(checkboxContract, 'react')) {
      expect(name in element, name).toBe(true);
    }
  });

  it('forwards the original event detail and keeps controlled state until accepted', async () => {
    const onCheckedChange = vi.fn<(event: CustomEvent<CheckboxCheckedChangeDetail>) => void>();
    const element = await render({ checked: false, onCheckedChange });
    await act(async () => inputOf(element).click());
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange.mock.calls[0]?.[0].detail).toEqual({ checked: true });
    expect(inputOf(element).checked).toBe(false);

    await rerender({ checked: true, onCheckedChange });
    expect(inputOf(element).checked).toBe(true);
  });
});
