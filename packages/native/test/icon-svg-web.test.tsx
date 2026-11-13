import { brainCircuit } from '@joralvmel/cosmos-icons/brain-circuit';
import { house } from '@joralvmel/cosmos-icons/house';
import { defaultThemeName, getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Exercise the actual react-native-svg web renderer instead of the SVG test stand-in.
vi.mock('react-native-svg', async () => {
  // @ts-expect-error The package does not publish declarations for its internal web entry.
  return import('../node_modules/react-native-svg/lib/module/elements.web.js');
});

import { Icon } from '../src/components/icon.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('Icon with react-native-svg web', () => {
  it('hides decorative SVG and names informative SVG without native-only DOM props or warnings', async () => {
    const errors = vi.spyOn(console, 'error');
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<Icon icon={house} />));
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(svg?.hasAttribute('role')).toBe(false);
    expect(svg?.hasAttribute('accessible')).toBe(false);
    expect(svg?.hasAttribute('accessibilityElementsHidden')).toBe(false);
    expect(svg?.hasAttribute('importantForAccessibility')).toBe(false);
    await act(async () => root.render(<Icon icon={house} decorative={false} label="Home" />));
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Home');
    expect(svg?.hasAttribute('aria-hidden')).toBe(false);
    expect(errors).not.toHaveBeenCalled();
    await act(async () => root.unmount());
  });

  it('gives currentColor node fills the theme foreground instead of the default black', async () => {
    const errors = vi.spyOn(console, 'error');
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<Icon icon={brainCircuit} stroke="red" />));
    const svg = container.querySelector('svg');
    const fg = getNativeTheme(defaultThemeName, 'light').colors.fg;
    const color = svg?.getAttribute('color') ?? svg?.style.color;
    expect(color?.toLowerCase()).toBe(fg.toLowerCase());
    expect(svg?.querySelector('[fill="currentColor"]')).not.toBeNull();
    expect(errors).not.toHaveBeenCalled();
    await act(async () => root.unmount());
  });
});
