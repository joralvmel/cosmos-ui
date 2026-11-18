import {
  eventNames,
  propNames,
  type SwitchCheckedChangeDetail,
  switchContract,
  switchScenariosFor,
} from '@joralvmel/cosmos-core';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmosThemeProvider, Switch, type SwitchProps, switchPropNames } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

const node = (props: SwitchProps) => <Switch {...props} testID="subject" />;

async function render(element: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(element));
  return container.querySelector<HTMLElement>('[data-testid="subject"]');
}

async function rerender(element: ReactNode) {
  await act(async () => root?.render(element));
  return container?.querySelector<HTMLElement>('[data-testid="subject"]');
}

const nativeControl = () =>
  container?.querySelector<HTMLInputElement>('[data-testid="subject-control"]');
const styleOf = (element: Element) => JSON.parse(element.getAttribute('data-style') ?? '{}');

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe('Switch (native): shared scenarios', () => {
  for (const scenario of switchScenariosFor('native')) {
    it(scenario.name, async () => {
      const onCheckedChange = vi.fn<(detail: SwitchCheckedChangeDetail) => void>();
      const props: SwitchProps = { ...scenario.props, onCheckedChange };
      await render(node(props));

      for (const action of scenario.actions) {
        if (action.type === 'activate') {
          await act(async () => nativeControl()?.click());
        } else {
          props.checked = action.checked;
          await rerender(node(props));
        }
      }

      expect(nativeControl()?.checked).toBe(scenario.expected.checked);
      expect(onCheckedChange.mock.calls.map(([detail]) => detail.checked)).toEqual(
        scenario.expected.changes
      );
    });
  }
});

describe('Switch (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...switchPropNames].sort()).toEqual(propNames(switchContract, 'native').sort());
    for (const prop of ['size', 'name', 'value']) {
      expect(switchPropNames).not.toContain(prop);
    }
  });

  it('uses the contract callback name', () => {
    const callbacks: (keyof SwitchProps)[] = ['onCheckedChange'];
    expect(callbacks).toEqual(eventNames(switchContract, 'native'));
  });
});

describe('Switch (native)', () => {
  it('uses the built-in switch role, stable accessible name and help hint', async () => {
    await render(
      <Switch
        label="Enable notifications"
        defaultChecked
        helpText="Change this setting at any time."
        hideLabel
        testID="subject"
      />
    );
    const control = nativeControl();
    expect(control?.getAttribute('role')).toBe('switch');
    expect(control?.getAttribute('aria-label')).toBe('Enable notifications');
    expect(control?.getAttribute('aria-description')).toBe('Change this setting at any time.');
    expect(control?.checked).toBe(true);
    expect(container?.textContent).toContain('Change this setting at any time.');
    expect(container?.textContent).not.toContain('Enable notifications');
  });

  it('keeps the 44pt target and preserves theme-provided system switch colors', async () => {
    const theme = getNativeTheme('nebula', 'dark');
    const subject = await render(
      <CosmosThemeProvider theme="nebula" mode="dark">
        <Switch
          label="Enable notifications"
          style={{ width: 280, minHeight: 12 }}
          testID="subject"
        />
      </CosmosThemeProvider>
    );
    const control = nativeControl();
    expect(styleOf(subject as Element).width).toBe(280);
    expect(styleOf(subject as Element).minHeight).toBe(44);
    expect(styleOf(control as Element).minHeight).toBe(44);
    expect(styleOf(control as Element).minWidth).toBe(44);
    expect(control?.getAttribute('data-track-color')).toContain(theme.colors.primary);
    expect(control?.getAttribute('data-active-thumb-color')).toBe(theme.colors['primary-fg']);
  });

  it('preserves a controlled value when the built-in switch proposes a rejected value', async () => {
    const onCheckedChange = vi.fn();
    await render(
      <Switch
        label="Enable notifications"
        checked={false}
        onCheckedChange={onCheckedChange}
        testID="subject"
      />
    );
    await act(async () => nativeControl()?.click());
    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(nativeControl()?.checked).toBe(false);
  });
});
