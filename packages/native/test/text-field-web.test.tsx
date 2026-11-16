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
  // @ts-expect-error The package does not publish declarations for its internal web entry.
  return import('../node_modules/react-native-svg/lib/module/elements.web.js');
});

import { TextField } from '../src/components/text-field.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe('TextField with React Native Web', () => {
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
