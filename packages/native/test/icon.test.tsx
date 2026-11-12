import { iconContract, iconScenariosFor, propNames } from '@joralvmel/cosmos-core';
import { brainCircuit } from '@joralvmel/cosmos-icons/brain-circuit';
import { house } from '@joralvmel/cosmos-icons/house';
import { defaultThemeName, getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Platform } from 'react-native';
import { afterEach, describe, expect, it } from 'vitest';
import { Icon, iconPropNames } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container.querySelector('svg');
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  Platform.OS = 'web';
});

describe('Icon (native): shared scenarios', () => {
  for (const scenario of iconScenariosFor('native')) {
    it(scenario.name, async () => {
      const svg = await render(<Icon icon={house} {...scenario.props} />);
      expect(svg?.getAttribute('width')).toBe(
        String(
          typeof scenario.expected.size === 'number'
            ? scenario.expected.size
            : { sm: 16, md: 20, lg: 24 }[scenario.expected.size]
        )
      );
      expect(svg?.getAttribute('aria-label')).toBe(scenario.expected.label ?? null);
    });
  }
});

describe('Icon (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...iconPropNames].sort()).toEqual(propNames(iconContract, 'native').sort());
  });
});

describe('Icon (native)', () => {
  it('marks informative artwork with a single image name', async () => {
    const svg = await render(<Icon icon={house} decorative={false} label="Home" />);
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Home');
    expect(svg?.getAttribute('stroke')).toBeTruthy();
  });

  it('throws when informative artwork has no label', async () => {
    await expect(render(<Icon icon={house} decorative={false} />)).rejects.toThrow(
      /non-empty "label"/
    );
  });

  it('sends native accessibility props for decorative and informative icons', async () => {
    Platform.OS = 'ios';
    const decorative = await render(<Icon icon={house} />);
    expect(decorative?.getAttribute('data-accessible')).toBe('false');
    expect(decorative?.getAttribute('data-hidden-ios')).toBe('true');
    expect(decorative?.getAttribute('data-hidden-android')).toBe('no-hide-descendants');
    await act(async () => root?.unmount());
    Platform.OS = 'android';
    const meaningful = await render(<Icon icon={house} decorative={false} label="Home" />);
    expect(meaningful?.getAttribute('data-accessible')).toBe('true');
    expect(meaningful?.getAttribute('data-hidden-ios')).toBe('false');
    expect(meaningful?.getAttribute('data-hidden-android')).toBe('yes');
    expect(meaningful?.getAttribute('role')).toBe('img');
  });

  it('supports independent paints, width and numeric size', async () => {
    const svg = await render(
      <Icon icon={house} size={32} stroke="red" fill="blue" strokeWidth={0} />
    );
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('stroke')).toBe('red');
    expect(svg?.getAttribute('fill')).toBe('blue');
    expect(svg?.getAttribute('stroke-width')).toBe('0');
  });

  it('resolves node currentColor fills to the theme foreground', async () => {
    const svg = await render(<Icon icon={brainCircuit} stroke="red" />);
    const fg = getNativeTheme(defaultThemeName, 'light').colors.fg;
    expect(svg?.getAttribute('color')).toBe(fg);
    expect(svg?.getAttribute('stroke')).toBe('red');
    expect(svg?.querySelector('[fill="currentColor"]')).not.toBeNull();
  });

  it('rejects unsafe paints and invalid dimensions', async () => {
    await expect(render(<Icon icon={house} stroke="url(https://example.com/x)" />)).rejects.toThrow(
      /paint/
    );
    await expect(render(<Icon icon={house} size={0} />)).rejects.toThrow(/size/);
    await expect(render(<Icon icon={house} strokeWidth={-1} />)).rejects.toThrow(/strokeWidth/);
  });
});
