import {
  type ButtonPressDetail,
  buttonContract,
  buttonScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, type ButtonProps, buttonPropNames, CosmosThemeProvider } from '../src/index.js';
import { __setColorScheme } from './react-native.mock.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container.querySelector('button') as HTMLButtonElement;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  __setColorScheme('light');
});

const styleOf = (el: Element) => JSON.parse(el.getAttribute('data-style') ?? '{}');

describe('Button (native): shared scenarios', () => {
  for (const scenario of buttonScenariosFor('native')) {
    it(scenario.name, async () => {
      const onPress = vi.fn((detail: ButtonPressDetail) => detail.source);
      const button = await render(
        <Button {...scenario.props} onPress={onPress}>
          Save
        </Button>
      );
      for (const _action of scenario.actions) await act(async () => button.click());
      expect(onPress).toHaveBeenCalledTimes(scenario.expected.presses);
      if (scenario.expected.sources) {
        expect(onPress.mock.results.map(result => result.value)).toEqual(scenario.expected.sources);
      }
      expect(button.getAttribute('aria-busy') === 'true').toBe(scenario.expected.busy);
      expect(button.getAttribute('aria-disabled') === 'true').toBe(scenario.expected.disabled);
    });
  }
});

describe('Button (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...buttonPropNames].sort()).toEqual(propNames(buttonContract, 'native').sort());
  });

  it('uses the contract callback names', () => {
    const callbacks: (keyof ButtonProps)[] = ['onPress'];
    expect(callbacks).toEqual(eventNames(buttonContract, 'native'));
  });
});

describe('Button (native)', () => {
  it('exposes the button role and accessible label', async () => {
    const button = await render(<Button label="Close">×</Button>);
    expect(button.getAttribute('data-role')).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Close');
  });

  it('extends small buttons to a 44pt touch target', async () => {
    const button = await render(<Button size="sm">Save</Button>);
    expect(Number(button.getAttribute('data-hitslop'))).toBe((44 - 32) / 2);
  });

  it('shows an activity indicator while loading', async () => {
    const button = await render(<Button loading>Save</Button>);
    expect(button.querySelector('[data-testid="activity-indicator"]')).not.toBeNull();
  });

  it('uses theme colors for the selected theme and mode', async () => {
    const nebulaDark = getNativeTheme('nebula', 'dark');
    const button = await render(
      <CosmosThemeProvider theme="nebula" mode="dark">
        <Button>Save</Button>
      </CosmosThemeProvider>
    );
    expect(styleOf(button).backgroundColor).toBe(nebulaDark.colors.primary);
  });

  it('follows the system color scheme', async () => {
    __setColorScheme('dark');
    const button = await render(
      <CosmosThemeProvider>
        <Button variant="soft" tone="danger">
          Delete
        </Button>
      </CosmosThemeProvider>
    );
    expect(styleOf(button).backgroundColor).toBe(
      getNativeTheme('cosmos', 'dark').colors['danger-subtle']
    );
  });
});
