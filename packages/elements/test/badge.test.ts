import { badgeContract, badgeScenariosFor, eventNames, propNames } from '@joralvmel/cosmos-core';
import { heart } from '@joralvmel/cosmos-icons/heart';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmBadge } from '../src/components/badge/cosm-badge.js';
import { cleanup, fixture } from './fixture.js';

afterEach(cleanup);

describe('cosm-badge: shared scenarios', () => {
  for (const scenario of badgeScenariosFor('web')) {
    it(scenario.name, async () => {
      const el = await fixture<CosmBadge>(`<cosm-badge>${scenario.text}</cosm-badge>`);
      Object.assign(el, scenario.props);
      await el.updateComplete;
      const base = el.shadowRoot?.querySelector('[part="base"]');
      expect(el.variant).toBe(scenario.expected.variant);
      expect(el.tone).toBe(scenario.expected.tone);
      expect(el.size).toBe(scenario.expected.size);
      expect(el.textContent?.trim()).toBe(scenario.expected.text);
      expect(base).not.toBeNull();
    });
  }
});

describe('cosm-badge: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmBadge.properties).sort()).toEqual(
      propNames(badgeContract, 'web').sort()
    );
  });

  it('dispatches only the DOM events of the contract', async () => {
    const el = await fixture<CosmBadge>('<cosm-badge>Ready</cosm-badge>');
    const listener = vi.fn();
    for (const name of eventNames(badgeContract, 'dom')) el.addEventListener(name, listener);
    expect(eventNames(badgeContract, 'dom')).toEqual([]);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('cosm-badge', () => {
  it('uses the default slot and exposes the documented parts without interactive semantics', async () => {
    const el = await fixture<CosmBadge>('<cosm-badge>Available</cosm-badge>');
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="label"] slot')).not.toBeNull();
    expect(el.textContent).toBe('Available');
    expect(el.shadowRoot?.querySelector('[part="icon"]')).toBeNull();
    expect(el.getAttribute('role')).toBeNull();
    expect(el.hasAttribute('tabindex')).toBe(false);
    expect(el.shadowRoot?.querySelector('[aria-live]')).toBeNull();
    for (const part of ['base', 'label']) {
      expect(el.shadowRoot?.querySelector(`[part~="${part}"]`)).not.toBeNull();
    }
  });

  it('renders an optional structured decorative icon without reflecting it as an attribute', async () => {
    const el = await fixture<CosmBadge>('<cosm-badge>Favorite</cosm-badge>');
    el.startIcon = heart;
    await el.updateComplete;
    const wrapper = el.shadowRoot?.querySelector<HTMLElement>('[part="icon"]');
    const icon = wrapper?.querySelector<HTMLElementTagNameMap['cosm-icon']>('cosm-icon');
    await icon?.updateComplete;
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.icon).toBe(heart);
    expect(el.hasAttribute('start-icon')).toBe(false);
    expect(el.textContent?.trim()).toBe('Favorite');
    el.startIcon = undefined;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="icon"]')).toBeNull();
    expect(el.textContent?.trim()).toBe('Favorite');
  });

  it('reflects visual variants and accepts consumer CSS custom-property overrides', async () => {
    const el = await fixture<CosmBadge>('<cosm-badge>Review</cosm-badge>');
    el.variant = 'outline';
    el.tone = 'warning';
    el.size = 'lg';
    el.style.setProperty('--cosm-badge-radius', '3px');
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('outline');
    expect(el.getAttribute('tone')).toBe('warning');
    expect(el.getAttribute('size')).toBe('lg');
    expect(el.style.getPropertyValue('--cosm-badge-radius')).toBe('3px');
    expect(el.textContent).toContain('Review');
  });

  it('keeps long labels intact for wrapping rather than truncating', async () => {
    const text = 'An unusually long status label '.repeat(5);
    const el = await fixture<CosmBadge>(`<cosm-badge>${text}</cosm-badge>`);
    await el.updateComplete;
    expect(el.textContent).toBe(text);
    expect(el.textContent).toContain(text);
  });
});
