import {
  propNames,
  type TextareaChangeDetail,
  textareaContract,
  textareaScenariosFor,
} from '@joralvmel/cosmos-core';
import { act, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Textarea, textareaPropNames } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: ComponentProps<typeof Textarea>) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<Textarea {...props} testID="subject" />));
  return container;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

const editor = () => container?.querySelector<HTMLTextAreaElement>('[data-testid="subject-input"]');

describe('Textarea (native): shared scenarios', () => {
  for (const scenario of textareaScenariosFor('native')) {
    it(scenario.name, async () => {
      const changes: string[] = [];
      await render({
        label: 'Scenario',
        ...scenario.props,
        onValueChange: detail => changes.push(detail.value),
      });

      for (const action of scenario.actions) {
        if (action.type === 'edit') {
          const field = editor();
          if (!field) throw new Error('Native textarea mock was not rendered.');
          if (scenario.props.disabled || scenario.props.readOnly) continue;
          field.value = action.value;
          await act(async () =>
            field.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
          );
        } else if (action.type === 'sync') {
          await act(async () =>
            root?.render(
              <Textarea
                label="Scenario"
                {...scenario.props}
                value={action.value}
                onValueChange={detail => changes.push(detail.value)}
                testID="subject"
              />
            )
          );
        }
      }

      expect(editor()?.value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      expect(editor()?.disabled).toBe(scenario.expected.disabled);
    });
  }
});

describe('Textarea (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...textareaPropNames].sort()).toEqual(propNames(textareaContract, 'native').sort());
  });
});

describe('Textarea (native)', () => {
  it('uses the native multiline TextInput with rows, newline entry and maxLength', async () => {
    await render({ label: 'Message', rows: 6, maxLength: 80 });
    const field = editor();
    expect(field?.tagName).toBe('TEXTAREA');
    expect(Number(field?.rows)).toBe(6);
    expect(field?.maxLength).toBe(80);
    expect(field?.getAttribute('data-submit-behavior')).toBe('newline');
    expect(field?.getAttribute('aria-label')).toBe('Message');
  });

  it('uses the value change detail and does not add submit-on-enter behavior', async () => {
    const onValueChange = vi.fn<(detail: TextareaChangeDetail) => void>();
    await render({ label: 'Message', defaultValue: 'first', onValueChange });
    const field = editor();
    if (!field) throw new Error('Native textarea mock was not rendered.');
    field.value = 'first\nsecond';
    await act(async () =>
      field.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    );
    expect(onValueChange).toHaveBeenCalledWith({ value: 'first\nsecond' });
    expect(field.value).toBe('first\nsecond');
    await act(async () => field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })));
    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it('exposes accessibility relationships and external invalid state on React Native Web', async () => {
    await render({
      label: 'Message',
      labelHidden: true,
      helpText: 'Plain text only',
      error: 'Check the content',
      invalid: true,
      required: true,
      readOnly: true,
    });
    const field = editor();
    expect(field?.readOnly).toBe(true);
    expect(field?.getAttribute('aria-required')).toBe('true');
    expect(field?.getAttribute('aria-invalid')).toBe('true');
    expect(field?.getAttribute('aria-describedby')).toContain('help');
    expect(field?.getAttribute('aria-describedby')).toContain('error');
    expect(field?.getAttribute('aria-description')).toContain('Required');
    expect(container?.querySelector('[aria-live="polite"]')?.textContent).toBe('Check the content');
  });

  it('keeps focus visible and the editor at least a 44pt target', async () => {
    await render({ label: 'Message', rows: 1, size: 'sm' });
    const field = editor();
    const control = field?.parentElement;
    if (!field || !control) throw new Error('Native textarea control was not rendered.');
    expect(
      Number.parseFloat(JSON.parse(control.getAttribute('data-style') ?? '{}').minHeight)
    ).toBe(44);
    await act(async () => field.focus());
    expect(document.activeElement).toBe(field);
  });

  it('rejects invalid rows', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    await render({ label: 'Message' });
    await expect(
      act(async () => root?.render(<Textarea label="Message" rows={0} />))
    ).rejects.toThrow('rows must be a positive integer');
    consoleError.mockRestore();
  });

  it('rejects invalid maxLength values', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    await render({ label: 'Message' });
    await expect(
      act(async () => root?.render(<Textarea label="Message" maxLength={-1} />))
    ).rejects.toThrow('maxLength must be a nonnegative integer');
    consoleError.mockRestore();
  });
});
