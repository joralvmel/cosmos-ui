import {
  type ButtonPressDetail,
  eventNames,
  type IconButtonPressedChangeDetail,
  iconButtonContract,
  iconButtonScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import { heart } from '@joralvmel/cosmos-icons/heart';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Platform, Pressable } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CosmosThemeProvider,
  Icon,
  IconButton,
  type IconButtonProps,
  iconButtonPropNames,
} from '../src/index.js';

const runtime = vi.hoisted(() => ({ nativeWeb: false }));

// Observe platform props, and optionally render the installed RN Web Pressable.
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

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container.querySelector('button') as HTMLButtonElement;
}

async function rerender(node: ReactNode) {
  await act(async () => root?.render(node));
  return container?.querySelector('button') as HTMLButtonElement;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  runtime.nativeWeb = false;
  Object.assign(Platform, { OS: 'web' });
  vi.restoreAllMocks();
});

const styleOf = (element: Element) => JSON.parse(element.getAttribute('data-style') ?? '{}');
const lastAccessibility = () =>
  vi.mocked(Pressable).mock.lastCall?.[0] as
    | (Parameters<typeof Pressable>[0] & { 'aria-pressed'?: boolean })
    | undefined;

describe('IconButton (native): shared scenarios', () => {
  it('retains a custom larger target without allowing targets below 44 points', async () => {
    let button = await render(<IconButton label="Next" style={{ minHeight: 64, minWidth: 56 }} />);
    expect(styleOf(button).minHeight).toBe(64);
    expect(styleOf(button).minWidth).toBe(56);
    button = await rerender(<IconButton label="Next" style={{ minHeight: 12, minWidth: 8 }} />);
    expect(styleOf(button).minHeight).toBe(44);
    expect(styleOf(button).minWidth).toBe(44);
  });
  for (const scenario of iconButtonScenariosFor('native')) {
    it(scenario.name, async () => {
      const onPress = vi.fn<(detail: ButtonPressDetail) => void>();
      const onPressedChange = vi.fn<(detail: IconButtonPressedChangeDetail) => void>();
      let button = await render(
        <IconButton {...scenario.props} onPress={onPress} onPressedChange={onPressedChange}>
          <span aria-hidden="true">icon</span>
        </IconButton>
      );

      for (const action of scenario.actions) {
        if (action.type === 'press') {
          await act(async () => button.click());
        } else if (action.type === 'sync') {
          button = await rerender(
            <IconButton
              {...scenario.props}
              pressed={action.pressed}
              onPress={onPress}
              onPressedChange={onPressedChange}
            >
              <span aria-hidden="true">icon</span>
            </IconButton>
          );
        }
      }

      expect(onPress).toHaveBeenCalledTimes(scenario.expected.presses);
      expect(onPress.mock.calls.map(([detail]) => detail.source)).toEqual(
        scenario.expected.sources ?? []
      );
      expect(onPressedChange.mock.calls.map(([detail]) => detail.pressed)).toEqual(
        scenario.expected.changes
      );
      expect(button.getAttribute('aria-disabled') === 'true').toBe(scenario.expected.disabled);
      expect(button.getAttribute('aria-label')).toBe(scenario.props.label);
      expect(button.getAttribute('data-role')).toBe('button');
      expect(lastAccessibility()?.['aria-pressed'] ?? null).toBe(scenario.expected.pressed);
      expect(lastAccessibility()?.accessibilityState?.checked).toBeUndefined();
    });
  }
});

describe('IconButton (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...iconButtonPropNames].sort()).toEqual(propNames(iconButtonContract, 'native').sort());
  });

  it('uses the contract callback names', () => {
    const callbacks: (keyof IconButtonProps)[] = ['onPress', 'onPressedChange'];
    expect(callbacks).toEqual(eventNames(iconButtonContract, 'native'));
  });
});

describe('IconButton (native)', () => {
  it('rejects a missing or whitespace-only accessible label', () => {
    expect(() => IconButton({ label: '   ' })).toThrow(/non-empty "label"/);
    expect(() => IconButton({} as IconButtonProps)).toThrow(/non-empty "label"/);
  });

  it('reserves a 44pt square touch target for the smallest visual size', async () => {
    const button = await render(
      <IconButton label="Favorite" size="sm" style={{ margin: 8 }}>
        icon
      </IconButton>
    );
    expect(styleOf(button).minWidth).toBe(44);
    expect(styleOf(button).minHeight).toBe(44);
    expect(styleOf(button).margin).toBe(8);
    expect(styleOf(button.querySelector('div') as HTMLDivElement).width).toBe(
      getNativeTheme('cosmos', 'light').control.sm
    );
  });

  it('renders every variant and tone with theme colors', async () => {
    const theme = getNativeTheme('nebula', 'dark');
    const expected = [
      ['solid', 'primary', theme.colors.primary],
      ['solid', 'neutral', theme.colors.fg],
      ['solid', 'danger', theme.colors.danger],
      ['soft', 'danger', theme.colors['danger-subtle']],
      ['outline', 'primary', 'transparent'],
      ['ghost', 'neutral', 'transparent'],
    ] as const;
    for (const [variant, tone, background] of expected) {
      const button = await render(
        <CosmosThemeProvider theme="nebula" mode="dark">
          <IconButton label={`${tone} ${variant}`} variant={variant} tone={tone}>
            icon
          </IconButton>
        </CosmosThemeProvider>
      );
      expect(styleOf(button.querySelector('div') as HTMLDivElement).backgroundColor).toBe(
        background
      );
      await act(async () => root?.render(null));
      container?.remove();
    }
  });

  it('passes the surface foreground to a decorative Cosmos Icon', async () => {
    const theme = getNativeTheme('nebula', 'dark');
    const button = await render(
      <CosmosThemeProvider theme="nebula" mode="dark">
        <IconButton label="Favorite" variant="solid" tone="danger">
          <Icon icon={heart} />
        </IconButton>
      </CosmosThemeProvider>
    );
    const svg = button.querySelector('svg');
    expect(svg?.getAttribute('color')).toBe(theme.colors['danger-fg']);
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Favorite');
  });

  it('does not expose pressed state or emit a proposal in action mode', async () => {
    const onPressedChange = vi.fn();
    const button = await render(
      <IconButton label="Favorite" pressed onPressedChange={onPressedChange}>
        icon
      </IconButton>
    );
    await act(async () => button.click());
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(vi.mocked(Pressable).mock.lastCall?.[0].accessibilityState?.checked).toBeUndefined();
    expect(lastAccessibility()?.['aria-pressed']).toBeUndefined();
    expect(styleOf(button.querySelector('div') as HTMLDivElement).borderWidth).toBe(1);
  });

  it.each(['solid', 'soft', 'outline', 'ghost'] as const)(
    'keeps a visible selected border after release for %s toggles',
    async variant => {
      const button = await render(
        <IconButton label="Favorite" mode="toggle" variant={variant}>
          <Icon icon={heart} />
        </IconButton>
      );
      const surface = button.querySelector('div') as HTMLDivElement;
      const initialStyle = styleOf(surface);
      expect(initialStyle.borderWidth).toBe(1);
      await act(async () => button.click());
      const selectedStyle = styleOf(surface);
      expect(selectedStyle.borderWidth).toBe(2);
      expect(selectedStyle.borderColor).toBe(button.querySelector('svg')?.getAttribute('color'));
      expect(styleOf(button).opacity).toBe(1);
      await act(async () => button.click());
      expect(styleOf(surface)).toEqual(initialStyle);
    }
  );

  it('does not show a refused controlled proposal as selected', async () => {
    const node = (pressed: boolean) => (
      <IconButton label="Favorite" mode="toggle" pressed={pressed}>
        <Icon icon={heart} />
      </IconButton>
    );
    const button = await render(node(false));
    const surface = button.querySelector('div') as HTMLDivElement;
    await act(async () => button.click());
    expect(styleOf(surface).borderWidth).toBe(1);
    await rerender(node(true));
    expect(styleOf(surface).borderWidth).toBe(2);
  });

  it('hides the entire decorative subtree even when the child has an accessible label', async () => {
    const button = await render(
      <IconButton label="Favorite">
        <Icon icon={heart} decorative={false} label="Child icon name" />
      </IconButton>
    );
    const surface = button.querySelector('div');
    expect(button.getAttribute('aria-label')).toBe('Favorite');
    expect(button.querySelector('svg')?.getAttribute('aria-label')).toBe('Child icon name');
    expect(surface?.getAttribute('aria-hidden')).toBe('true');
    expect(surface?.getAttribute('data-hidden-ios')).toBe('true');
    expect(surface?.getAttribute('data-hidden-android')).toBe('no-hide-descendants');
  });

  it.each(['android', 'ios'] as const)(
    'preserves native togglebutton and checked state on %s',
    async platform => {
      Object.assign(Platform, { OS: platform });
      const button = await render(<IconButton label="Favorite" mode="toggle" />);
      expect(lastAccessibility()?.accessibilityRole).toBe('togglebutton');
      expect(lastAccessibility()?.accessibilityState?.checked).toBe(false);
      expect(lastAccessibility()?.['aria-pressed']).toBeUndefined();
      await act(async () => button.click());
      expect(lastAccessibility()?.accessibilityState?.checked).toBe(true);
      expect(lastAccessibility()?.accessibilityLabel).toBe('Favorite');
    }
  );

  it('renders RN Web toggles as buttons with stable names and aria-pressed, never aria-checked', async () => {
    runtime.nativeWeb = true;
    await render(<IconButton label="Favorite" mode="toggle" />);
    const button = container?.querySelector<HTMLElement>('[role="button"]');
    expect(button).toBeInstanceOf(HTMLElement);
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.hasAttribute('aria-checked')).toBe(false);
    await act(async () => button?.click());
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(button?.getAttribute('aria-label')).toBe('Favorite');
    await act(async () => button?.click());
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.getAttribute('aria-label')).toBe('Favorite');
  });

  it('exposes expanded state on RN Web for composed controls', async () => {
    runtime.nativeWeb = true;
    await render(<IconButton label="Move" accessibilityState={{ expanded: false }} />);
    const button = container?.querySelector<HTMLElement>('[role="button"]');
    expect(vi.mocked(Pressable).mock.lastCall?.[0]['aria-expanded']).toBe(false);
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    await rerender(<IconButton label="Move" accessibilityState={{ expanded: true }} />);
    expect(vi.mocked(Pressable).mock.lastCall?.[0]['aria-expanded']).toBe(true);
    expect(button?.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps RN Web controlled false unchanged until its owner accepts, and omits pressed in action mode', async () => {
    runtime.nativeWeb = true;
    const onPressedChange = vi.fn();
    const node = (pressed: boolean, mode: 'toggle' | 'action' = 'toggle') => (
      <IconButton
        label="Favorite"
        mode={mode}
        pressed={pressed}
        onPressedChange={onPressedChange}
      />
    );
    await render(node(false));
    const button = container?.querySelector<HTMLElement>('[role="button"]');
    expect(button).toBeInstanceOf(HTMLElement);
    await act(async () => button?.click());
    expect(onPressedChange).toHaveBeenCalledWith({ pressed: true });
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    await rerender(node(true));
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    await rerender(node(true, 'action'));
    expect(button?.hasAttribute('aria-pressed')).toBe(false);
    expect(button?.hasAttribute('aria-checked')).toBe(false);
  });
});
