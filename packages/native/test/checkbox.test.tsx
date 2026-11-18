import {
  type CheckboxCheckedChangeDetail,
  checkboxContract,
  checkboxScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Platform } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Checkbox,
  type CheckboxProps,
  CosmosThemeProvider,
  checkboxPropNames,
} from '../src/index.js';

const runtime = vi.hoisted(() => ({ nativeWeb: false }));

vi.mock('react-native', async importOriginal => {
  const native = await importOriginal<typeof import('./react-native.mock.js')>();
  // @ts-expect-error React Native Web does not publish declarations in this workspace.
  const nativeWeb = await import('react-native-web');
  const { createElement } = await import('react');
  return {
    ...native,
    Pressable: vi.fn((props: Parameters<typeof native.Pressable>[0]) =>
      createElement(runtime.nativeWeb ? nativeWeb.Pressable : native.Pressable, props)
    ),
  };
});

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

const node = (props: CheckboxProps) => <Checkbox {...props} testID="subject" />;

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

const checkedState = () =>
  container?.querySelector('[data-testid="subject"]')?.getAttribute('aria-checked');
const styleOf = (element: Element) => JSON.parse(element.getAttribute('data-style') ?? '{}');

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
  runtime.nativeWeb = false;
  Object.assign(Platform, { OS: 'web' });
});

describe('Checkbox (native): shared scenarios', () => {
  for (const scenario of checkboxScenariosFor('native')) {
    it(scenario.name, async () => {
      const onCheckedChange = vi.fn<(detail: CheckboxCheckedChangeDetail) => void>();
      const props: CheckboxProps = { ...scenario.props, onCheckedChange };
      const subject = await render(node(props));

      for (const action of scenario.actions) {
        if (action.type === 'activate') {
          await act(async () => subject?.click());
        } else {
          props.checked = action.checked;
          await rerender(node(props));
        }
      }

      expect(checkedState()).toBe(
        scenario.expected.indeterminate ? 'mixed' : String(scenario.expected.checked)
      );
      expect(onCheckedChange.mock.calls.map(([detail]) => detail.checked)).toEqual(
        scenario.expected.changes
      );
    });
  }
});

describe('Checkbox (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...checkboxPropNames].sort()).toEqual(propNames(checkboxContract, 'native').sort());
  });

  it('uses the contract callback name', () => {
    const callbacks: (keyof CheckboxProps)[] = ['onCheckedChange'];
    expect(callbacks).toEqual(eventNames(checkboxContract, 'native'));
  });
});

describe('Checkbox (native)', () => {
  it('exposes checkbox role, accessible label, mixed state and descriptive text', async () => {
    Object.assign(Platform, { OS: 'android' });
    const subject = await render(
      <Checkbox
        label="Choose option"
        indeterminate
        helpText="Optional information."
        errorText="Selection is required."
        testID="subject"
      />
    );
    expect(subject?.getAttribute('data-role')).toBe('checkbox');
    expect(subject?.getAttribute('aria-label')).toBe('Choose option');
    expect(subject?.getAttribute('aria-checked')).toBe('mixed');
    expect(subject?.getAttribute('aria-description')).toContain('Selection is required');
  });

  it('keeps touch targets at least 44pt for small and numeric sizes', async () => {
    for (const size of ['sm', 12] as const) {
      const subject = await render(<Checkbox label="Accept terms" size={size} testID="subject" />);
      expect(styleOf(subject as Element).minHeight).toBe(44);
      await act(async () => root?.render(null));
      container?.remove();
    }
  });

  it('uses the active theme and retains minimum targets with caller styling', async () => {
    const theme = getNativeTheme('nebula', 'dark');
    const subject = await render(
      <CosmosThemeProvider theme="nebula" mode="dark">
        <Checkbox
          label="Accept terms"
          defaultChecked
          style={{ width: 280 }}
          boxStyle={{ borderWidth: 2 }}
          testID="subject"
        />
      </CosmosThemeProvider>
    );
    expect(styleOf(subject?.parentElement as Element).width).toBe(280);
    expect(styleOf(subject?.querySelector('[aria-hidden="true"]') as Element).borderWidth).toBe(2);
    expect(theme.colors.primary).toBeTruthy();
  });

  it('maps mixed and checked semantics through React Native Web', async () => {
    runtime.nativeWeb = true;
    const onCheckedChange = vi.fn();
    const subject = await render(
      <Checkbox
        label="Accept terms"
        indeterminate
        onCheckedChange={onCheckedChange}
        testID="subject"
      />
    );
    expect(subject?.outerHTML).toContain('role="checkbox"');
    expect(subject?.getAttribute('aria-checked')).toBe('mixed');
    await act(async () => subject?.click());
    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
    expect(subject?.getAttribute('aria-checked')).toBe('true');
    await act(async () => {
      subject?.focus();
      subject?.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
      );
    });
    expect(onCheckedChange.mock.calls.map(([detail]) => detail.checked)).toEqual([true, false]);
    expect(subject?.getAttribute('aria-checked')).toBe('false');
  });

  it('rejects invalid custom sizes', async () => {
    await expect(render(<Checkbox label="Accept terms" size={0} />)).rejects.toThrow(
      /Checkbox size/
    );
  });
});
