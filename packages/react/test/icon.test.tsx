import { iconContract, iconScenariosFor, propNames } from '@joralvmel/cosmos-core';
import type { CosmIcon } from '@joralvmel/cosmos-elements/icon';
import { house } from '@joralvmel/cosmos-icons/house';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Icon, type IconProps, iconEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: IconProps) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<Icon {...props} />));
  const el = container.querySelector('cosm-icon') as CosmIcon;
  await el.updateComplete;
  return el;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe('Icon: shared scenarios', () => {
  for (const scenario of iconScenariosFor('react')) {
    it(scenario.name, async () => {
      const el = await render({ icon: house, ...scenario.props });
      expect(el.size).toBe(scenario.expected.size);
      expect(el.decorative).toBe(scenario.expected.decorative);
      expect(el.label).toBe(scenario.expected.label);
    });
  }
});

describe('Icon: contract drift', () => {
  it('has no event props and forwards every contract prop', async () => {
    expect(Object.keys(iconEvents)).toEqual([]);
    const el = await render({ icon: house });
    for (const name of propNames(iconContract, 'react')) expect(name in el, name).toBe(true);
  });
});

describe('Icon', () => {
  it('forwards the structured definition and false decorative value unchanged', async () => {
    const el = await render({ icon: house, decorative: false, label: 'Home' });
    expect(el.icon).toBe(house);
    expect(el.decorative).toBe(false);
    expect(el.shadowRoot?.querySelector('svg')?.getAttribute('aria-label')).toBe('Home');
  });

  it('forwards numeric size and independent paints', async () => {
    const el = await render({ icon: house, size: 32, stroke: 'red', fill: 'blue', strokeWidth: 0 });
    expect(el.size).toBe(32);
    expect(el.shadowRoot?.querySelector('svg')?.getAttribute('stroke-width')).toBe('0');
    expect(el.fill).toBe('blue');
  });
});
