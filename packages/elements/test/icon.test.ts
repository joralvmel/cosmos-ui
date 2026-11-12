import { iconContract, iconScenariosFor, propNames } from '@joralvmel/cosmos-core';
import { house } from '@joralvmel/cosmos-icons/house';
import { afterEach, describe, expect, it } from 'vitest';
import { CosmIcon } from '../src/components/icon/cosm-icon.js';
import { cleanup } from './fixture.js';

afterEach(cleanup);
afterEach(() => {
  document.querySelectorAll('cosm-icon').forEach(element => {
    element.remove();
  });
});

async function render(props: Partial<CosmIcon> = {}) {
  const host = document.createElement('cosm-icon') as CosmIcon;
  host.icon = house;
  Object.assign(host, props);
  document.body.append(host);
  await host.updateComplete;
  return host;
}

describe('cosm-icon: shared scenarios', () => {
  for (const scenario of iconScenariosFor('web')) {
    it(scenario.name, async () => {
      const el = await render(scenario.props);
      expect(el.size).toBe(scenario.expected.size);
      expect(el.decorative).toBe(scenario.expected.decorative);
      expect(el.label).toBe(scenario.expected.label);
      expect(el.shadowRoot?.querySelector('[part="icon"]')?.getAttribute('aria-hidden')).toBe(
        scenario.expected.decorative ? 'true' : null
      );
    });
  }
});

describe('cosm-icon: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmIcon.properties).sort()).toEqual(propNames(iconContract, 'web').sort());
  });

  it('has no events or state', () => {
    expect(iconContract.events).toEqual({});
    expect(iconContract.states).toEqual([]);
  });
});

describe('cosm-icon', () => {
  it('renders a structured decorative SVG without focusability', async () => {
    const el = await render();
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.hasAttribute('role')).toBe(false);
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(svg?.querySelectorAll('path').length).toBe(house.nodes.length);
    expect(el.hasAttribute('size')).toBe(true);
    expect(el.getAttribute('size')).toBe('md');
  });

  it('exposes informative icons as one named image', async () => {
    const el = await render({ decorative: false, label: 'Home' });
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Home');
    expect(svg?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('throws an explicit error for informative icons without a label', async () => {
    const el = document.createElement('cosm-icon') as CosmIcon;
    el.icon = house;
    el.decorative = false;
    document.body.append(el);
    await expect(el.updateComplete).rejects.toThrow(/non-empty "label"/);
  });

  it('surfaces a missing icon as an explicit alert instead of a successful empty SVG', async () => {
    const el = document.createElement('cosm-icon') as CosmIcon;
    document.body.append(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[role="alert"]')?.textContent).toContain(
      'requires a valid IconDefinition'
    );
    expect(el.shadowRoot?.querySelector('svg')).toBeNull();
  });

  it('reflects the visual size but does not add interactivity', async () => {
    const el = await render({ size: 'lg' });
    expect(el.getAttribute('size')).toBe('lg');
    expect(el.tabIndex).toBe(-1);
    expect(el.querySelectorAll('button,a,input')).toHaveLength(0);
  });

  it('supports numeric sizes and independent root paints without replacing node fills', async () => {
    const icon = {
      name: 'cutout',
      viewBox: '0 0 24 24',
      nodes: [['circle', { r: 5, fill: 'none' }]],
    } as const;
    const el = await render({ icon, size: 32, stroke: 'red', fill: 'blue', strokeWidth: 0 });
    const svg = el.shadowRoot?.querySelector('svg');
    expect(el.style.getPropertyValue('--_cosm-icon-size')).toBe('32px');
    expect(svg?.getAttribute('stroke')).toBe('red');
    expect(svg?.getAttribute('fill')).toBe('blue');
    expect(svg?.getAttribute('stroke-width')).toBe('0');
    expect(svg?.querySelector('circle')?.getAttribute('fill')).toBe('none');
  });

  it.each([
    { size: 0 },
    { strokeWidth: -1 },
    { fill: 'url(https://example.com/a)' },
    { fill: 'u\\72l(https://example.com/a)' },
  ])('rejects invalid visual inputs', async props => {
    const el = document.createElement('cosm-icon') as CosmIcon;
    el.icon = house;
    Object.assign(el, props);
    document.body.append(el);
    await expect(el.updateComplete).rejects.toThrow();
  });
});
