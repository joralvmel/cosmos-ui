import {
  eventNames,
  propNames,
  type RadioGroupChangeDetail,
  radioGroupContract,
  radioGroupScenarioOptions,
  radioGroupScenariosFor,
} from '@joralvmel/cosmos-core';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Platform } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CosmosThemeProvider,
  RadioGroup,
  type RadioGroupProps,
  radioGroupPropNames,
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

const optionNode = (value: string) =>
  container?.querySelector<HTMLButtonElement>(`[data-testid="subject-option-${value}"]`);
const optionsNode = () => [
  ...(container?.querySelectorAll<HTMLButtonElement>('[data-testid^="subject-option-"]') ?? []),
];
const selectedValue = () =>
  optionsNode()
    .find(option => option.getAttribute('aria-checked') === 'true')
    ?.dataset.testid?.replace('subject-option-', '') ?? null;
const styleOf = (element: Element) => JSON.parse(element.getAttribute('data-style') ?? '{}');
const keyDown = async (target: HTMLElement | null | undefined, key: string) => {
  if (!target) throw new Error('Expected a keyboard target.');
  await act(async () => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
};

describe('RadioGroup (native): shared scenarios', () => {
  for (const scenario of radioGroupScenariosFor('native')) {
    it(scenario.name, async () => {
      let props: RadioGroupProps = {
        label: 'Contact method',
        options: radioGroupScenarioOptions,
        ...scenario.props,
      };
      const onValueChange = vi.fn<(detail: RadioGroupChangeDetail) => void>();
      props = { ...props, onValueChange, testID: 'subject' };
      const node = () => <RadioGroup {...props} />;
      await render(node());

      for (const action of scenario.actions) {
        if (action.type === 'select') {
          const option = optionNode(action.value);
          if (!option) throw new Error(`Missing option "${action.value}".`);
          await act(async () => option.click());
        } else {
          props = { ...props, value: action.value };
          await rerender(node());
        }
      }

      expect(selectedValue()).toBe(scenario.expected.value);
      expect(onValueChange.mock.calls.map(([detail]) => detail.value)).toEqual(
        scenario.expected.changes
      );
    });
  }
});

describe('RadioGroup (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...radioGroupPropNames].sort()).toEqual(propNames(radioGroupContract, 'native').sort());
  });

  it('uses the contract callback name', () => {
    const callbacks: (keyof RadioGroupProps)[] = ['onValueChange'];
    expect(callbacks).toEqual(eventNames(radioGroupContract, 'native'));
  });
});

describe('RadioGroup (native)', () => {
  it('exposes radiogroup/radio semantics and 44-point option targets', async () => {
    const subject = await render(
      <RadioGroup
        label="Contact method"
        options={radioGroupScenarioOptions}
        required
        helpText="Choose one contact method."
        testID="subject"
      />
    );
    const group = subject.querySelector('[data-testid="subject"]');
    expect(group?.getAttribute('data-role')).toBe('radiogroup');
    expect(group?.getAttribute('aria-label')).toBe('Contact method');
    expect(group?.getAttribute('aria-required')).toBe('true');
    expect(optionNode('email')?.getAttribute('data-role')).toBe('radio');
    expect(optionNode('email')?.getAttribute('aria-label')).toBe('Email');
    expect(optionNode('email')?.getAttribute('aria-checked')).toBe('false');
    expect(styleOf(optionNode('email') as Element).minHeight).toBe(44);
  });

  it('updates hover boundaries without changing selection and respects priority and overrides', async () => {
    const colors = getNativeTheme('cosmos', 'light').colors;
    const onValueChange = vi.fn();
    const props: RadioGroupProps = {
      label: 'Contact method',
      options: radioGroupScenarioOptions,
      onValueChange,
      testID: 'subject',
    };
    await render(<RadioGroup {...props} />);
    const email = optionNode('email');
    const control = email?.querySelector('[aria-hidden="true"]');
    if (!email || !control) throw new Error('Missing option control.');

    await act(async () => {
      email.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
    });
    expect(styleOf(control).borderColor).toBe(colors.primary);
    expect(selectedValue()).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();

    await act(async () => email.click());
    await act(async () => {
      email.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
    });
    expect(styleOf(control).borderColor).toBe(colors['primary-hover']);

    await rerender(<RadioGroup {...props} invalid testID="subject" />);
    expect(
      styleOf(optionNode('email')?.querySelector('[aria-hidden="true"]') as Element).borderColor
    ).toBe(colors.danger);
    await rerender(<RadioGroup {...props} disabled testID="subject" />);
    expect(
      styleOf(optionNode('phone')?.querySelector('[aria-hidden="true"]') as Element).borderColor
    ).toBe(colors['border-strong']);
    await rerender(
      <RadioGroup {...props} controlStyle={{ borderColor: 'orange' }} testID="subject" />
    );
    expect(
      styleOf(optionNode('email')?.querySelector('[aria-hidden="true"]') as Element).borderColor
    ).toBe('orange');
    expect(selectedValue()).toBe('email');
    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it('supports keyboard selection and a single React Native Web tab stop', async () => {
    runtime.nativeWeb = true;
    const onValueChange = vi.fn();
    await render(
      <CosmosThemeProvider>
        <RadioGroup
          label="Contact method"
          options={radioGroupScenarioOptions}
          onValueChange={onValueChange}
          testID="subject"
        />
      </CosmosThemeProvider>
    );
    const email = optionNode('email');
    const phone = optionNode('phone');
    expect(email?.tabIndex).toBe(0);
    expect(phone?.tabIndex).toBe(-1);
    await keyDown(email, 'ArrowDown');
    expect(document.activeElement).toBe(phone);
    expect(onValueChange).toHaveBeenCalledWith({ value: 'phone' });
    expect(selectedValue()).toBe('phone');
    expect(phone?.tabIndex).toBe(0);
    await keyDown(phone, ' ');
    expect(onValueChange).toHaveBeenCalledOnce();
  });
});
