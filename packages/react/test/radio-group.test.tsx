import {
  eventNames,
  propNames,
  type RadioGroupChangeDetail,
  radioGroupContract,
  radioGroupScenarioOptions,
  radioGroupScenariosFor,
} from '@joralvmel/cosmos-core';
import type { CosmRadioGroup } from '@joralvmel/cosmos-elements/radio-group';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RadioGroup, type RadioGroupProps, radioGroupEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: RadioGroupProps) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<RadioGroup {...props} />));
  const element = container.querySelector('cosm-radio-group') as CosmRadioGroup;
  await element.updateComplete;
  return element;
}

async function rerender(props: RadioGroupProps) {
  await act(async () => root?.render(<RadioGroup {...props} />));
  const element = container?.querySelector('cosm-radio-group') as CosmRadioGroup | null;
  if (!element) throw new Error('Radio Group element was not rendered.');
  await element.updateComplete;
  return element;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe('RadioGroup: shared scenarios', () => {
  for (const scenario of radioGroupScenariosFor('react')) {
    it(scenario.name, async () => {
      let props: RadioGroupProps = {
        label: 'Contact method',
        options: radioGroupScenarioOptions,
        ...scenario.props,
      };
      const onChange = vi.fn<(event: CustomEvent<RadioGroupChangeDetail>) => void>();
      props = { ...props, onChange };
      let element = await render(props);

      for (const action of scenario.actions) {
        if (action.type === 'select') {
          const input = [
            ...(element.shadowRoot?.querySelectorAll<HTMLInputElement>('input') ?? []),
          ].find(candidate => candidate.value === action.value);
          if (!input) throw new Error(`Missing option "${action.value}".`);
          input.click();
        } else {
          props = { ...props, value: action.value };
          element = await rerender(props);
        }
        await element.updateComplete;
      }

      expect(element.value).toBe(scenario.expected.value);
      expect(
        [...(element.shadowRoot?.querySelectorAll<HTMLInputElement>('input:checked') ?? [])].map(
          input => input.value
        )
      ).toEqual(scenario.expected.value === null ? [] : [scenario.expected.value]);
      expect(onChange.mock.calls.map(([event]) => event.detail.value)).toEqual(
        scenario.expected.changes
      );
    });
  }
});

describe('RadioGroup: contract drift', () => {
  it('maps every contract event to its React name', () => {
    expect(Object.keys(radioGroupEvents)).toEqual(eventNames(radioGroupContract, 'react'));
  });

  it('forwards every contract prop to the element', async () => {
    const element = await render({
      label: 'Contact method',
      options: radioGroupScenarioOptions,
    });
    for (const name of propNames(radioGroupContract, 'react')) {
      expect(name in element, name).toBe(true);
    }
  });

  it('forwards the original DOM CustomEvent to onChange', async () => {
    const onChange = vi.fn<(event: CustomEvent<RadioGroupChangeDetail>) => void>();
    const element = await render({
      label: 'Contact method',
      options: radioGroupScenarioOptions,
      onChange,
    });
    const input = [...(element.shadowRoot?.querySelectorAll<HTMLInputElement>('input') ?? [])][0];
    input?.click();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect(onChange.mock.calls[0]?.[0].detail).toEqual({ value: 'email' });
  });
});
