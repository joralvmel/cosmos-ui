import { badgeContract, badgeScenariosFor, propNames } from '@joralvmel/cosmos-core';
import { heart } from '@joralvmel/cosmos-icons/heart';
import { defaultThemeName, getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Platform } from 'react-native';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge, badgePropNames } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container.querySelector<HTMLElement>('[data-testid="subject"]');
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  Platform.OS = 'web';
});

describe('Badge (native): shared scenarios', () => {
  for (const scenario of badgeScenariosFor('native')) {
    it(scenario.name, async () => {
      const subject = await render(
        <Badge {...scenario.props} testID="subject">
          {scenario.text}
        </Badge>
      );
      expect(subject?.textContent).toBe(scenario.expected.text);
      expect(subject?.getAttribute('role')).toBeNull();
      expect(subject?.hasAttribute('tabindex')).toBe(false);
      const label = subject?.querySelector('span');
      const style = JSON.parse(label?.getAttribute('data-style') ?? '{}') as Record<
        string,
        unknown
      >;
      const containerStyle = JSON.parse(subject?.getAttribute('data-style') ?? '{}') as Record<
        string,
        unknown
      >;
      const theme = getNativeTheme(defaultThemeName, 'light');
      const colors =
        scenario.expected.tone === 'neutral'
          ? {
              soft: theme.colors['surface-raised'],
              text: theme.colors.fg,
              solid: theme.colors.fg,
              solidText: theme.colors.bg,
              border: theme.colors['border-strong'],
            }
          : {
              soft: theme.colors[`${scenario.expected.tone}-subtle`],
              text: theme.colors[`${scenario.expected.tone}-text`],
              solid: theme.colors[scenario.expected.tone],
              solidText: theme.colors[`${scenario.expected.tone}-fg`],
              border: theme.colors[`${scenario.expected.tone}-text`],
            };
      expect(style.fontSize).toBe(
        theme.text[
          scenario.expected.size === 'sm' ? 'xs' : scenario.expected.size === 'lg' ? 'md' : 'sm'
        ]
      );
      expect(containerStyle.backgroundColor).toBe(
        scenario.expected.variant === 'solid'
          ? colors.solid
          : scenario.expected.variant === 'soft'
            ? colors.soft
            : 'transparent'
      );
      expect(containerStyle.borderColor).toBe(
        scenario.expected.variant === 'outline' ? colors.border : 'transparent'
      );
      expect(style.color).toBe(
        scenario.expected.variant === 'solid' ? colors.solidText : colors.text
      );
    });
  }
});

describe('Badge (native): contract drift', () => {
  it('handles exactly the native contract props', () => {
    expect([...badgePropNames].sort()).toEqual(propNames(badgeContract, 'native').sort());
  });
});

describe('Badge (native)', () => {
  it('uses theme colors, spacing and medium radius for the default neutral treatment', async () => {
    const subject = await render(<Badge testID="subject">Ready</Badge>);
    const theme = getNativeTheme(defaultThemeName, 'light');
    const containerStyle = JSON.parse(subject?.getAttribute('data-style') ?? '{}') as Record<
      string,
      unknown
    >;
    expect(containerStyle.backgroundColor).toBe(theme.colors['surface-raised']);
    expect(containerStyle.borderRadius).toBe(theme.radius.md);
    expect(containerStyle.paddingHorizontal).toBe(theme.space.sm);
    expect(subject?.querySelector('span')?.textContent).toBe('Ready');
  });

  it('renders the optional icon as decorative and follows the final text color override', async () => {
    Platform.OS = 'ios';
    const subject = await render(
      <Badge testID="subject" startIcon={heart} textStyle={{ color: 'purple' }}>
        Favorite
      </Badge>
    );
    const icon = subject?.querySelector('svg');
    expect(subject?.textContent).toBe('Favorite');
    expect(icon?.getAttribute('stroke')).toBe('purple');
    expect(icon?.getAttribute('data-hidden-ios')).toBe('true');
    expect(icon?.getAttribute('data-hidden-android')).toBe('no-hide-descendants');
  });

  it('applies native container and text overrides after themed defaults', async () => {
    const subject = await render(
      <Badge
        testID="subject"
        style={{ borderRadius: 2, paddingHorizontal: 24 }}
        textStyle={{ color: 'rebeccapurple', fontSize: 31 }}
      >
        Custom
      </Badge>
    );
    const containerStyle = JSON.parse(subject?.getAttribute('data-style') ?? '{}') as Record<
      string,
      unknown
    >;
    const labelStyle = JSON.parse(
      subject?.querySelector('span')?.getAttribute('data-style') ?? '{}'
    ) as Record<string, unknown>;
    expect(containerStyle.borderRadius).toBe(2);
    expect(containerStyle.paddingHorizontal).toBe(24);
    expect(labelStyle.color).toBe('rebeccapurple');
    expect(labelStyle.fontSize).toBe(31);
  });

  it('wraps long labels and leaves native font scaling enabled', async () => {
    const text = 'A long status label '.repeat(5);
    const subject = await render(<Badge testID="subject">{text}</Badge>);
    const label = subject?.querySelector('span');
    expect(label?.textContent).toBe(text);
    expect(label?.hasAttribute('numberOfLines')).toBe(false);
    expect(label?.getAttribute('data-style')).not.toContain('allowFontScaling');
  });
});
