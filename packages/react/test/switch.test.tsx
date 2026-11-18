import {
  eventNames,
  propNames,
  type SwitchCheckedChangeDetail,
  switchContract,
  switchScenariosFor,
} from '@joralvmel/cosmos-core';
import type { CosmSwitch } from '@joralvmel/cosmos-elements/switch';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Switch, type SwitchProps, switchEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

const node = (props: Partial<SwitchProps>) => <Switch label="Enable notifications" {...props} />;

async function render(props: Partial<SwitchProps> = {}) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node(props)));
  const element = container.querySelector('cosm-switch') as CosmSwitch;
  await element.updateComplete;
  return element;
}

async function rerender(props: Partial<SwitchProps>) {
  await act(async () => root?.render(node(props)));
  const element = container?.querySelector('cosm-switch') as CosmSwitch;
  await element.updateComplete;
  return element;
}

const inputOf = (element: CosmSwitch) =>
  element.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe('Switch: shared scenarios', () => {
  for (const scenario of switchScenariosFor('react')) {
    it(scenario.name, async () => {
      const props = { ...scenario.props };
      const onCheckedChange = vi.fn<(event: CustomEvent<SwitchCheckedChangeDetail>) => void>();
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
    });
  }
});

describe('Switch: contract drift', () => {
  it('forwards invalid updates without changing the autonomous checked value', async () => {
    const onCheckedChange = vi.fn();
    const element = await render({ invalid: true, defaultChecked: true, onCheckedChange });
    expect(element.invalid).toBe(true);
    expect(inputOf(element).getAttribute('aria-invalid')).toBe('true');
    await rerender({ invalid: false, defaultChecked: true, onCheckedChange });
    expect(inputOf(element).hasAttribute('aria-invalid')).toBe(false);
    expect(element.checked).toBe(true);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('maps every contract event to its React name', () => {
    expect(Object.keys(switchEvents)).toEqual(eventNames(switchContract, 'react'));
  });

  it('forwards every React contract prop to the element', async () => {
    const element = await render();
    for (const name of propNames(switchContract, 'react')) {
      expect(name in element, name).toBe(true);
    }
  });

  it('forwards the original event and holds controlled false until the owner accepts', async () => {
    const onCheckedChange = vi.fn<(event: CustomEvent<SwitchCheckedChangeDetail>) => void>();
    const element = await render({ checked: false, onCheckedChange });
    await act(async () => inputOf(element).click());
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect(onCheckedChange.mock.calls[0]?.[0].detail).toEqual({ checked: true });
    expect(inputOf(element).checked).toBe(false);

    await rerender({ checked: true, onCheckedChange });
    expect(inputOf(element).checked).toBe(true);
  });
});
