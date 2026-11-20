import {
  eventNames,
  getListboxOptions,
  propNames,
  type SelectChangeDetail,
  selectContract,
  selectScenarioItems,
  selectScenariosFor,
} from '@joralvmel/cosmos-core';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Platform } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CosmosThemeProvider,
  PopoverProvider,
  Select,
  type SelectProps,
  selectPropNames,
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
let container: HTMLDivElement | undefined;

const baseProps: Pick<SelectProps, 'label' | 'items' | 'placeholder'> = {
  label: 'Fruit',
  items: selectScenarioItems,
  placeholder: 'Choose a fruit',
};

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container;
}

async function renderSelect(props: SelectProps) {
  await render(
    <CosmosThemeProvider>
      <PopoverProvider>
        <Select {...props} testID="subject" />
      </PopoverProvider>
    </CosmosThemeProvider>
  );
  return container;
}

async function rerenderSelect(props: SelectProps) {
  await act(async () =>
    root?.render(
      <CosmosThemeProvider>
        <PopoverProvider>
          <Select {...props} testID="subject" />
        </PopoverProvider>
      </CosmosThemeProvider>
    )
  );
  return container;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
  runtime.nativeWeb = false;
  Object.assign(Platform, { OS: 'web' });
});

const trigger = () =>
  container?.querySelector<HTMLButtonElement>('[data-testid="subject-trigger"]');
const option = (value: string) =>
  container?.querySelector<HTMLButtonElement>(`[data-testid="subject-listbox-option-${value}"]`);
const clearButton = () =>
  container?.querySelector<HTMLButtonElement>('[data-testid="subject-clear"]');
const openSelect = async () => {
  const control = trigger();
  if (!control) throw new Error('Missing Select trigger.');
  await act(async () => control.click());
};
const styleOf = (element: Element) => JSON.parse(element.getAttribute('data-style') ?? '{}');

describe('Select (native): shared scenarios', () => {
  for (const scenario of selectScenariosFor('native')) {
    it(scenario.name, async () => {
      runtime.nativeWeb = true;
      let props = { ...baseProps, ...scenario.props } as SelectProps;
      const onValueChange = vi.fn<(detail: SelectChangeDetail) => void>();
      props = { ...props, onValueChange };
      await renderSelect(props);

      for (const action of scenario.actions) {
        if (action.type === 'select') {
          if (props.disabled) {
            await act(async () => trigger()?.click());
            continue;
          }
          await openSelect();
          const item = option(action.value);
          if (!item) throw new Error(`Missing option "${action.value}".`);
          await act(async () => item.click());
        } else if (action.type === 'clear') {
          const clear = clearButton();
          if (!clear) throw new Error('Missing clear action.');
          await act(async () => clear.click());
        } else {
          props = { ...props, value: action.value };
          await rerenderSelect(props);
        }
      }

      const expectedLabel =
        scenario.expected.value === null
          ? (scenario.props.placeholder ?? baseProps.placeholder)
          : getListboxOptions(selectScenarioItems).find(
              item => item.value === scenario.expected.value
            )?.label;
      expect(trigger()?.textContent).toContain(expectedLabel);
      expect(onValueChange.mock.calls.map(([detail]) => detail.value)).toEqual(
        scenario.expected.changes
      );
    });
  }
});

describe('Select (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...selectPropNames].sort()).toEqual(propNames(selectContract, 'native').sort());
  });

  it('uses the contract callback name', () => {
    const callbacks: (keyof SelectProps)[] = ['onValueChange'];
    expect(callbacks).toEqual(eventNames(selectContract, 'native'));
  });
});

describe('Select (native)', () => {
  it('exposes an accessible combobox with required and disabled state and a 44-point target', async () => {
    runtime.nativeWeb = false;
    await renderSelect({
      ...baseProps,
      required: true,
      helpText: 'Choose one fruit.',
    });
    const control = trigger();
    const colors = getNativeTheme('cosmos', 'light').colors;

    expect(control?.getAttribute('data-role')).toBe('combobox');
    expect(control?.getAttribute('aria-label')).toBe('Fruit, Choose a fruit');
    expect(control?.getAttribute('aria-required')).toBe('true');
    expect(styleOf(control as Element).minHeight).toBe(44);
    expect(colors['fg-muted']).toBeTruthy();

    await rerenderSelect({ ...baseProps, disabled: true });
    expect(trigger()?.getAttribute('aria-disabled')).toBe('true');
  });

  it('keeps controlled values with the owner and clears only when enabled', async () => {
    runtime.nativeWeb = true;
    const onValueChange = vi.fn<(detail: SelectChangeDetail) => void>();
    await renderSelect({
      ...baseProps,
      value: 'apple',
      clearable: true,
      clearLabel: 'Clear fruit',
      onValueChange,
    });
    const clear = clearButton();
    if (!clear) throw new Error('Missing clear action.');
    await act(async () => clear.click());
    expect(onValueChange.mock.calls.map(([detail]) => detail.value)).toEqual([null]);
    expect(trigger()?.textContent).toContain('Apple');
  });
});
