import { brainCircuit } from '@joralvmel/cosmos-icons/brain-circuit';
import { heart } from '@joralvmel/cosmos-icons/heart';
import { search } from '@joralvmel/cosmos-icons/search';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

// Use the installed React Native Web input implementation, not the native DOM stand-in.
vi.mock('react-native', async () => {
  // @ts-expect-error React Native Web does not publish declarations in this workspace.
  const nativeWeb = await import('react-native-web');
  return { ...nativeWeb, Platform: { OS: 'web' }, processColor: (value: string) => value };
});
vi.mock('react-native-svg', async () => {
  const { createRequire } = await import('node:module');
  return import(
    createRequire(import.meta.url).resolve('react-native-svg/lib/module/elements.web.js')
  );
});

import { TextField } from '../src/components/text-field.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe('TextField with React Native Web', () => {
  it.each(['control', 'input'] as const)(
    'applies independent icon colors within %s focus without recoloring affixes or actions',
    async iconFocusScope => {
      const container = document.createElement('div');
      document.body.append(container);
      const root = createRoot(container);
      const props = {
        label: 'Colors',
        type: 'password',
        defaultValue: 'Secret',
        startIcon: brainCircuit,
        endIcon: heart,
        prefix: '$',
        clearable: true,
        clearLabel: 'Clear',
        passwordReveal: true,
        revealPasswordLabel: 'Show',
        hidePasswordLabel: 'Hide',
        iconFocusScope,
        appearance: {
          startIconColor: 'red',
          startIconFocusColor: 'blue',
          endIconColor: 'green',
        },
      } as const;
      try {
        await act(async () => root.render(<TextField {...props} />));
        const input = container.querySelector('input');
        const icons = container.querySelectorAll('svg');
        const actions = container.querySelectorAll<HTMLElement>('[role="button"]');
        if (!input || !actions[0] || !actions[1]) throw new Error('Controls are missing');
        const expectColors = (start: string) => {
          expect(icons[0]?.getAttribute('stroke')).toBe(start);
          expect(icons[0]?.getAttribute('color')).toBe(start);
          expect(icons[0]?.querySelector('[fill="currentColor"]')).not.toBeNull();
          expect(icons[1]?.getAttribute('stroke')).toBe('green');
        };
        const actionColor = icons[2]?.getAttribute('stroke');
        expectColors('red');
        await act(async () => input.focus());
        expectColors('blue');
        expect(icons[2]?.getAttribute('stroke')).toBe(actionColor);
        await act(async () => actions[0]?.focus());
        expectColors(iconFocusScope === 'control' ? 'blue' : 'red');
        await act(async () => actions[1]?.focus());
        expectColors(iconFocusScope === 'control' ? 'blue' : 'red');
        await act(async () => actions[1]?.blur());
        expectColors('red');
        await act(async () => input.focus());
        await act(async () =>
          root.render(
            <TextField {...props} appearance={{ startIconColor: 'red', endIconColor: 'green' }} />
          )
        );
        expectColors('red');
        await act(async () => root.render(<TextField {...props} />));
        await act(async () => actions[1]?.focus());
        await act(async () => root.render(<TextField {...props} readOnly />));
        expectColors('red');
        await act(async () => root.render(<TextField {...props} />));
        expectColors('red');
        await act(async () => input.focus());
        await act(async () => root.render(<TextField {...props} disabled />));
        expectColors('red');
      } finally {
        await act(async () => root.unmount());
        container.remove();
      }
    }
  );

  it('keeps artwork passive and reserves editing space with all adornments and actions', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () =>
        root.render(
          <TextField
            label="Password"
            type="password"
            defaultValue="Secret"
            startIcon={search}
            endIcon={heart}
            prefix={'Long prefix'.repeat(20)}
            suffix={'Long suffix'.repeat(20)}
            clearable
            clearLabel="Clear password"
            passwordReveal
            revealPasswordLabel="Show password"
            hidePasswordLabel="Hide password"
          />
        )
      );
      const artwork = container.querySelectorAll('svg');
      expect(artwork).toHaveLength(4);
      for (const svg of artwork) {
        expect(svg.hasAttribute('tabindex')).toBe(false);
        expect(svg.getAttribute('aria-hidden')).toBe('true');
      }
      const actions = container.querySelectorAll('[role="button"]');
      expect(actions).toHaveLength(2);
      for (const action of actions) expect(action.getAttribute('tabindex')).toBe('0');
      const input = container.querySelector('input');
      if (!input) throw new Error('Text field input is missing');
      expect(Number.parseFloat(getComputedStyle(input).minWidth)).toBeGreaterThanOrEqual(44);
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });

  it.each(['md', 80] as const)(
    'keeps one themed focus boundary for size %s without an inner browser outline',
    async size => {
      const container = document.createElement('div');
      document.body.append(container);
      const root = createRoot(container);
      try {
        await act(async () =>
          root.render(
            <TextField
              label="Focus"
              size={size}
              appearance={{ border: '#334155', focus: '#2563eb' }}
            />
          )
        );
        const input = container.querySelector('input');
        if (!input?.parentElement) throw new Error('Text field control is missing');
        const control = input.parentElement;
        const restingBorder = getComputedStyle(control).borderColor;
        await act(async () => input.focus());
        expect(document.activeElement).toBe(input);
        expect(getComputedStyle(input).outlineWidth).toBe('0px');
        expect(getComputedStyle(input).outlineStyle).toBe('solid');
        expect(getComputedStyle(control).borderColor).toBe('rgba(37, 99, 235, 1.00)');
        expect(getComputedStyle(control).outlineWidth).toBe('2px');
        expect(getComputedStyle(control).outlineOffset).toBe('-2px');
        await act(async () => input.blur());
        expect(getComputedStyle(control).borderColor).toBe(restingBorder);
        expect(getComputedStyle(control).outlineWidth).toBe('0px');
      } finally {
        await act(async () => root.unmount());
        container.remove();
      }
    }
  );

  it('keeps normal fields editable, applies readonly only when requested and hides decoration', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<TextField label="Field" startIcon={search} />));
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.readOnly).toBe(false);
    expect(input.required).toBe(false);
    expect(input.hasAttribute('aria-readonly')).toBe(false);
    expect(input.hasAttribute('aria-required')).toBe(false);
    expect(container.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull();
    await act(async () => root.render(<TextField label="Field" required readOnly />));
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.getAttribute('aria-readonly')).toBe('true');
    await act(async () => root.unmount());
    container.remove();
  });
});
