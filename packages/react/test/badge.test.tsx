import { badgeContract, badgeScenariosFor, eventNames, propNames } from '@joralvmel/cosmos-core';
import { heart } from '@joralvmel/cosmos-icons/heart';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge, type BadgeProps, badgeEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: BadgeProps, text = 'Badge') {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<Badge {...props}>{text}</Badge>));
  const el = container.querySelector(
    'cosm-badge'
  ) as import('@joralvmel/cosmos-elements/badge').CosmBadge;
  await el.updateComplete;
  return el;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe('Badge: shared scenarios', () => {
  for (const scenario of badgeScenariosFor('react')) {
    it(scenario.name, async () => {
      const el = await render(scenario.props, scenario.text);
      expect(el.variant).toBe(scenario.expected.variant);
      expect(el.tone).toBe(scenario.expected.tone);
      expect(el.size).toBe(scenario.expected.size);
      expect(el.textContent).toBe(scenario.expected.text);
    });
  }
});

describe('Badge: contract drift', () => {
  it('maps every contract event to its React name', () => {
    expect(Object.keys(badgeEvents)).toEqual(eventNames(badgeContract, 'react'));
  });

  it('forwards every contract prop to the element', async () => {
    const el = await render({});
    for (const name of propNames(badgeContract, 'react')) expect(name in el, name).toBe(true);
  });
});

describe('Badge', () => {
  it('forwards a structured icon as a property and renders children in the default slot', async () => {
    const el = await render({ startIcon: heart }, 'Ready');
    expect(el.startIcon).toBe(heart);
    expect(el.hasAttribute('start-icon')).toBe(false);
    expect(el.textContent).toBe('Ready');
  });

  it('does not expose events or interactive semantics', async () => {
    const el = await render({});
    expect(badgeEvents).toEqual({});
    expect(el.getAttribute('role')).toBeNull();
    expect(el.shadowRoot?.querySelector('[aria-live]')).toBeNull();
  });
});
