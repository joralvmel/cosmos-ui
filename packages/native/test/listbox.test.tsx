import {
  eventNames,
  type ListboxItem,
  type ListboxSelectionChangeDetail,
  listboxContract,
  listboxScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import { check } from '@joralvmel/cosmos-icons/check';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Platform } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmosThemeProvider, Listbox, type ListboxProps, listboxPropNames } from '../src/index.js';

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
    ScrollView: vi.fn((props: Parameters<typeof native.ScrollView>[0]) =>
      createElement(runtime.nativeWeb ? nativeWeb.ScrollView : native.ScrollView, props)
    ),
  };
});

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const items = [
  {
    label: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple', description: 'Crisp and sweet', icon: check },
      { value: 'apricot', label: 'Apricot' },
      { value: 'banana', label: 'Banana', disabled: true },
      { value: 'cherry', label: 'Cherry', description: 'Seasonal' },
    ],
  },
] as const satisfies readonly ListboxItem[];

const reentryItems = [
  {
    label: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'apricot', label: 'Apricot' },
      { value: 'banana', label: 'Banana', disabled: true },
      { value: 'pepper', label: 'Pepper' },
    ],
  },
] as const satisfies readonly ListboxItem[];

let root: Root | undefined;
let container: HTMLDivElement | undefined;

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container;
}

async function rerender(node: ReactNode) {
  await act(async () => root?.render(node));
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

const subjectOption = (value: string) =>
  container?.querySelector<HTMLButtonElement>(`[data-testid="subject-option-${value}"]`);
const selectedValues = () =>
  [...(container?.querySelectorAll<HTMLElement>('[role="option"][aria-selected="true"]') ?? [])]
    .map(option => option.getAttribute('data-testid')?.replace('subject-option-', ''))
    .filter((value): value is string => Boolean(value));
const styleOf = (element: Element) => JSON.parse(element.getAttribute('data-style') ?? '{}');
const listboxNode = () => container?.querySelector<HTMLElement>('[role="listbox"]');
const keyDown = async (target: HTMLElement | null | undefined, key: string) => {
  if (!target) throw new Error('Expected a keyboard target.');
  await act(async () => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
};

describe('Listbox (native): shared scenarios', () => {
  for (const scenario of listboxScenariosFor('native')) {
    it(scenario.name, async () => {
      const onSelectionChange = vi.fn<(detail: ListboxSelectionChangeDetail) => void>();
      const props = { ...scenario.props };
      const node = (values?: readonly string[]) => (
        <Listbox
          {...props}
          {...(values === undefined ? {} : { selectedValues: values })}
          onSelectionChange={onSelectionChange}
          testID="subject"
        />
      );
      await render(node());

      for (const action of scenario.actions) {
        if (action.type === 'activate') {
          const option = subjectOption(action.value);
          if (!option) throw new Error(`Missing option ${action.value}.`);
          await act(async () => option.click());
        } else if (action.type === 'key') {
          await keyDown(listboxNode(), action.key);
        } else {
          await rerender(node(action.selectedValues));
        }
      }

      expect(selectedValues()).toEqual(scenario.expected.selectedValues);
      expect(onSelectionChange.mock.calls.map(([detail]) => detail.selectedValues)).toEqual(
        scenario.expected.changes
      );
      if (scenario.expected.activeValue) {
        expect(document.activeElement?.getAttribute('data-testid')).toBe(
          `subject-option-${scenario.expected.activeValue}`
        );
      }
    });
  }
});

describe('Listbox (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...listboxPropNames].sort()).toEqual(propNames(listboxContract, 'native').sort());
  });

  it('uses the contract callback name', () => {
    const callbacks: (keyof ListboxProps)[] = ['onSelectionChange'];
    expect(callbacks).toEqual(eventNames(listboxContract, 'native'));
  });
});

describe('Listbox (native)', () => {
  it('renders the named listbox and visible accessible label', async () => {
    await render(<Listbox label="Choose fruit" items={items} testID="subject" />);
    expect(listboxNode()?.getAttribute('aria-label')).toBe('Choose fruit');
    expect(container?.querySelector('[data-testid="subject-label"]')?.textContent).toBe(
      'Choose fruit'
    );
  });

  it('supports visually hidden labels without removing the list name', async () => {
    await render(<Listbox label="Choose fruit" labelHidden items={items} testID="subject" />);
    expect(listboxNode()?.getAttribute('aria-label')).toBe('Choose fruit');
    expect(
      styleOf(container?.querySelector('[data-testid="subject-label"]') as Element).opacity
    ).toBe(0);
  });

  it('starts on the selected enabled option and exposes option semantics on RN Web', async () => {
    await render(
      <Listbox label="Choose fruit" items={items} selectedValues={['cherry']} testID="subject" />
    );
    expect(subjectOption('cherry')?.tabIndex).toBe(0);
    expect(subjectOption('apple')?.tabIndex).toBe(-1);
    expect(subjectOption('apple')?.getAttribute('aria-describedby')).toBeTruthy();
    expect(subjectOption('banana')?.getAttribute('aria-disabled')).toBe('true');
    expect(subjectOption('apple')?.getAttribute('aria-label')).toBe('Apple');
  });

  it('allows readonly keyboard exploration without selection proposals', async () => {
    const onSelectionChange = vi.fn();
    await render(
      <Listbox
        label="Choose fruit"
        items={items}
        readOnly
        onSelectionChange={onSelectionChange}
        testID="subject"
      />
    );
    await keyDown(listboxNode(), 'End');
    await keyDown(listboxNode(), 'Enter');
    expect(document.activeElement?.getAttribute('data-testid')).toBe('subject-option-cherry');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('uses locale-aware typeahead without filtering options or selecting', async () => {
    const onSelectionChange = vi.fn();
    await render(
      <Listbox
        label="Choose fruit"
        items={items}
        locale="en"
        onSelectionChange={onSelectionChange}
        testID="subject"
      />
    );
    await keyDown(listboxNode(), 'c');
    expect(document.activeElement?.getAttribute('data-testid')).toBe('subject-option-cherry');
    expect(container?.querySelectorAll('[role="option"]')).toHaveLength(4);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('uses RN Web option roles, roving focus and single keyboard activation', async () => {
    runtime.nativeWeb = true;
    const onSelectionChange = vi.fn();
    await render(
      <Listbox
        label="Choose fruit"
        items={items}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
        testID="subject"
      />
    );
    const options = [...(container?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    expect(container?.querySelectorAll('[role="listbox"]')).toHaveLength(1);
    expect(options.filter(option => option.tabIndex === 0)).toHaveLength(1);
    const apple = subjectOption('apple');
    await act(async () => {
      apple?.focus();
      apple?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(document.activeElement?.getAttribute('data-testid')).toBe('subject-option-apricot');
    const apricot = subjectOption('apricot');
    await act(async () => {
      apricot?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      apricot?.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
    });
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.calls[0]?.[0]).toEqual({
      selectedValues: ['apricot'],
      value: 'apricot',
      source: 'keyboard',
    });
  });

  it('resets the RN Web Tab re-entry target to the selected option after focus leaves', async () => {
    runtime.nativeWeb = true;
    await render(
      <>
        <button type="button" data-testid="outside-reset">
          Reset
        </button>
        <Listbox
          label="Choose fruit"
          items={reentryItems}
          selectedValues={['apple']}
          readOnly
          testID="subject"
        />
      </>
    );
    const apple = subjectOption('apple');
    const pepper = subjectOption('pepper');
    await act(async () => apple?.focus());
    await keyDown(apple, 'End');
    expect(document.activeElement).toBe(pepper);

    const outside = container?.querySelector<HTMLButtonElement>('[data-testid="outside-reset"]');
    await act(async () => outside?.focus());
    expect(document.activeElement).toBe(outside);
    expect(apple?.tabIndex).toBe(0);
    expect(pepper?.tabIndex).toBe(-1);

    await act(async () => apple?.focus());
    expect(document.activeElement).toBe(apple);
  });

  it('does not steal focus from external controls', async () => {
    await render(
      <>
        <button type="button" data-testid="outside">
          External action
        </button>
        <Listbox label="Choose fruit" items={items} testID="subject" />
      </>
    );
    const outside = container?.querySelector<HTMLButtonElement>('[data-testid="outside"]');
    outside?.focus();
    await keyDown(outside, 'ArrowDown');
    expect(document.activeElement).toBe(outside);
  });

  it('keeps refused controlled proposals unchanged and emits each retry', async () => {
    const onSelectionChange = vi.fn();
    const node = (values: readonly string[]) => (
      <Listbox
        label="Choose fruit"
        items={items}
        selectedValues={values}
        onSelectionChange={onSelectionChange}
        testID="subject"
      />
    );
    await render(node([]));
    await act(async () => subjectOption('apple')?.click());
    await act(async () => subjectOption('apple')?.click());
    expect(selectedValues()).toEqual([]);
    expect(onSelectionChange.mock.calls.map(([detail]) => detail.selectedValues)).toEqual([
      ['apple'],
      ['apple'],
    ]);
  });

  it('does not emit for activation of the already-selected single value', async () => {
    const onSelectionChange = vi.fn();
    await render(
      <Listbox
        label="Choose fruit"
        items={items}
        defaultSelectedValues={['apple']}
        onSelectionChange={onSelectionChange}
        testID="subject"
      />
    );
    await act(async () => subjectOption('apple')?.click());
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('uses native button, selected, disabled and descriptive accessible-name semantics', async () => {
    Object.assign(Platform, { OS: 'android' });
    await render(
      <Listbox
        label="Choose fruit"
        items={items}
        defaultSelectedValues={['apple']}
        testID="subject"
      />
    );
    expect(subjectOption('apple')?.getAttribute('data-role')).toBe('button');
    expect(subjectOption('apple')?.getAttribute('aria-selected')).toBe('true');
    expect(subjectOption('apple')?.getAttribute('aria-label')).toBe(
      'Fruit, Apple, Crisp and sweet'
    );
    expect(subjectOption('banana')?.getAttribute('aria-disabled')).toBe('true');
  });

  it('keeps touch targets at least 44pt for small and numeric sizes', async () => {
    for (const size of ['sm', 24] as const) {
      await render(<Listbox label="Choose fruit" items={items} size={size} testID="subject" />);
      expect(styleOf(subjectOption('apple') as Element).minHeight).toBe(44);
      await act(async () => root?.render(null));
      container?.remove();
    }
  });

  it('allows content to grow and uses custom styles with the active theme', async () => {
    const theme = getNativeTheme('nebula', 'dark');
    await render(
      <CosmosThemeProvider theme="nebula" mode="dark">
        <Listbox
          label="Choose fruit"
          items={items}
          defaultSelectedValues={['apple']}
          variant="outlined"
          appearance={{ selectedBackground: theme.colors['danger-subtle'], maxHeight: 180 }}
          style={{ width: 280 }}
          optionStyle={{ paddingHorizontal: 16 }}
          selectedStyle={{ borderWidth: 2 }}
          testID="subject"
        />
      </CosmosThemeProvider>
    );
    expect(styleOf(container?.querySelector('[data-testid="subject"]') as Element).width).toBe(280);
    expect(styleOf(listboxNode() as Element).maxHeight).toBe(180);
    expect(styleOf(subjectOption('apple') as Element).minHeight).toBe(44);
    expect(styleOf(subjectOption('apple') as Element).borderWidth).toBe(2);
    expect(styleOf(subjectOption('apple') as Element).backgroundColor).toBe(
      theme.colors['danger-subtle']
    );
  });

  it('validates numeric size, values and collection structure', async () => {
    await expect(render(<Listbox label="Choose fruit" items={items} size={0} />)).rejects.toThrow(
      /size must be/
    );
  });
});
