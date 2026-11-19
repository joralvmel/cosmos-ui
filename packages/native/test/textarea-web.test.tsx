import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async () => {
  // @ts-expect-error React Native Web does not publish declarations in this workspace.
  const nativeWeb = await import('react-native-web');
  return { ...nativeWeb, Platform: { OS: 'web' }, processColor: (value: string) => value };
});

import { Textarea } from '../src/components/textarea.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function setNativeValue(field: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(field, value);
}

describe('Textarea with React Native Web', () => {
  it('renders a multiline textarea with accessible state and newline behavior', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    const onValueChange = vi.fn();
    try {
      await act(async () =>
        root.render(
          <Textarea
            label="Message"
            rows={5}
            maxLength={60}
            required
            helpText="Use plain text"
            error="Review the message"
            invalid
            onValueChange={onValueChange}
          />
        )
      );
      const field = container.querySelector('textarea');
      if (!field) throw new Error('React Native Web textarea was not rendered.');
      expect(Number(field.rows)).toBe(5);
      expect(field.maxLength).toBe(60);
      expect(field.getAttribute('aria-label')).toBe('Message');
      expect(field.getAttribute('aria-required')).toBe('true');
      expect(field.getAttribute('aria-invalid')).toBe('true');
      expect(field.getAttribute('aria-describedby')).toContain('help');
      expect(field.getAttribute('aria-describedby')).toContain('error');

      await act(async () => {
        field.focus();
        setNativeValue(field, 'first\nsecond');
        field.dispatchEvent(new Event('input', { bubbles: true }));
      });
      expect(onValueChange).toHaveBeenCalledWith({ value: 'first\nsecond' });
      expect(field.value).toBe('first\nsecond');
      await act(async () =>
        field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
      );
      expect(onValueChange).toHaveBeenCalledOnce();
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });

  it('restores ignored controlled proposals and accepts an updated owner value', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () => root.render(<Textarea label="Message" value="before" />));
      const field = container.querySelector('textarea');
      if (!field) throw new Error('React Native Web textarea was not rendered.');
      await act(async () => {
        setNativeValue(field, 'ignored');
        field.dispatchEvent(new Event('input', { bubbles: true }));
      });
      expect(field.value).toBe('before');
      await act(async () => root.render(<Textarea label="Message" value="accepted" />));
      expect(field.value).toBe('accepted');
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });
});
