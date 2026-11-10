import {
  type ButtonPressDetail,
  buttonContract,
  buttonScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmButton } from '@joralvmel/cosmos-elements';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, type ButtonProps, buttonEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: ButtonProps) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<Button {...props}>Save</Button>));
  const el = container.querySelector('cosm-button') as CosmButton;
  await el.updateComplete;
  return el;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

const inner = (el: CosmButton) => el.shadowRoot?.querySelector('button') as HTMLButtonElement;

describe('Button: shared scenarios', () => {
  for (const scenario of buttonScenariosFor('react')) {
    it(scenario.name, async () => {
      const sources: string[] = [];
      const onPress = vi.fn((event: CustomEvent<ButtonPressDetail>) => {
        sources.push(event.detail.source);
      });
      const el = await render({ ...scenario.props, onPress });
      for (const action of scenario.actions) {
        const button = inner(el);
        if (action.type === 'key') {
          button.dispatchEvent(new KeyboardEvent('keydown', { key: action.key, bubbles: true }));
        } else {
          button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        }
        if (!button.disabled) {
          button.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              composed: true,
              detail: action.type === 'key' ? 0 : 1,
            })
          );
        }
      }
      expect(onPress).toHaveBeenCalledTimes(scenario.expected.presses);
      if (scenario.expected.sources) expect(sources).toEqual(scenario.expected.sources);
      expect(inner(el).getAttribute('aria-busy') === 'true').toBe(scenario.expected.busy);
    });
  }
});

describe('Button: contract drift', () => {
  it('maps every contract event to its React name and DOM event', () => {
    expect(Object.keys(buttonEvents)).toEqual(eventNames(buttonContract, 'react'));
    expect(Object.values(buttonEvents)).toEqual(eventNames(buttonContract, 'dom'));
  });

  it('forwards every contract prop to the element', async () => {
    const values: Record<string, unknown> = {
      variant: 'outline',
      tone: 'danger',
      size: 'lg',
      disabled: true,
      loading: true,
      fullWidth: true,
      type: 'submit',
      label: 'Delete',
    };
    expect(Object.keys(values).sort()).toEqual(propNames(buttonContract, 'react').sort());
    const el = await render(values as ButtonProps);
    for (const [name, value] of Object.entries(values)) {
      expect(el[name as keyof CosmButton], name).toBe(value);
    }
  });
});
