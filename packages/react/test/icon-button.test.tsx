import {
  eventNames,
  iconButtonContract,
  iconButtonScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmIconButton } from '@joralvmel/cosmos-elements/icon-button';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { IconButton, type IconButtonProps, iconButtonEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: IconButtonProps) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await update(props);
  const el = container.querySelector('cosm-icon-button') as CosmIconButton;
  await el.updateComplete;
  return el;
}
async function update(props: IconButtonProps) {
  await act(async () =>
    root?.render(
      <IconButton {...props}>
        <span />
      </IconButton>
    )
  );
}
afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe('IconButton: shared scenarios', () => {
  for (const scenario of iconButtonScenariosFor('react')) {
    it(scenario.name, async () => {
      const sources: string[] = [];
      const changes: boolean[] = [];
      let props: IconButtonProps = {
        ...scenario.props,
        onPress: event => sources.push(event.detail.source),
        onPressedChange: event => changes.push(event.detail.pressed),
      };
      const el = await render(props);
      for (const action of scenario.actions) {
        if (action.type === 'sync') {
          props = { ...props, pressed: action.pressed };
          await update(props);
        } else {
          const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
          if (action.type === 'key')
            button.dispatchEvent(new KeyboardEvent('keydown', { key: action.key, bubbles: true }));
          else button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
          if (!button.disabled) {
            await act(async () =>
              button.dispatchEvent(
                new MouseEvent('click', {
                  bubbles: true,
                  composed: true,
                  detail: action.type === 'key' ? 0 : 1,
                })
              )
            );
          }
        }
        await el.updateComplete;
      }
      const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
      expect(sources).toEqual(scenario.expected.sources);
      expect(changes).toEqual(scenario.expected.changes);
      expect(button.disabled).toBe(scenario.expected.disabled);
      expect(button.getAttribute('aria-pressed')).toBe(
        scenario.expected.pressed === null ? null : String(scenario.expected.pressed)
      );
    });
  }
});

describe('IconButton: contract drift', () => {
  it('maps every event to the DOM event', () => {
    expect(Object.keys(iconButtonEvents)).toEqual(eventNames(iconButtonContract, 'react'));
    expect(Object.values(iconButtonEvents)).toEqual(eventNames(iconButtonContract, 'dom'));
  });
  it('forwards every contract prop', async () => {
    const values: IconButtonProps = {
      label: 'Favorite',
      mode: 'toggle',
      variant: 'outline',
      tone: 'danger',
      size: 'lg',
      disabled: true,
      type: 'submit',
      pressed: false,
      defaultPressed: true,
    };
    expect(Object.keys(values).sort()).toEqual(propNames(iconButtonContract, 'react').sort());
    const el = await render(values);
    for (const [name, value] of Object.entries(values)) {
      expect(el[name as keyof CosmIconButton], name).toBe(value);
    }
  });
});
