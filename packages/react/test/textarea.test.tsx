import {
  eventNames,
  propNames,
  type TextareaChangeDetail,
  textareaContract,
  textareaScenariosFor,
} from '@joralvmel/cosmos-core';
import type { CosmTextarea } from '@joralvmel/cosmos-elements/textarea';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Textarea, type TextareaProps, textareaEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: TextareaProps) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<Textarea {...props} />));
  const el = container.querySelector('cosm-textarea') as CosmTextarea;
  await el.updateComplete;
  return el;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

describe('Textarea: shared scenarios', () => {
  for (const scenario of textareaScenariosFor('react')) {
    it(scenario.name, async () => {
      const changes: string[] = [];
      const props = {
        label: 'Scenario',
        ...scenario.props,
        onChange: (event: CustomEvent<TextareaChangeDetail>) => changes.push(event.detail.value),
      };
      const el = await render(props);

      for (const action of scenario.actions) {
        if (action.type === 'edit') {
          const field = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
          field.value = action.value;
          await act(async () =>
            field.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
          );
        } else if (action.type === 'sync') {
          await act(async () => root?.render(<Textarea {...props} value={action.value} />));
        } else if (action.type === 'reset') {
          await act(async () => el.formResetCallback());
        }
        await el.updateComplete;
      }

      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      await el.updateComplete;
      expect(el.value).toBe(scenario.expected.value);
      expect(el.shadowRoot?.querySelector('textarea')?.value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      expect(el.disabled).toBe(scenario.expected.disabled);
    });
  }
});

describe('Textarea: contract drift', () => {
  it('maps every contract event to its React name', () => {
    expect(Object.keys(textareaEvents)).toEqual(eventNames(textareaContract, 'react'));
  });

  it('forwards every contract prop to the element', async () => {
    const el = await render({ label: 'Message' });
    for (const name of propNames(textareaContract, 'react')) expect(name in el, name).toBe(true);
  });
});

describe('Textarea', () => {
  it('forwards the original DOM CustomEvent and supports a delayed controlled update', async () => {
    const changes: CustomEvent<TextareaChangeDetail>[] = [];
    let resolveAccepted!: () => void;
    const accepted = new Promise<void>(resolve => {
      resolveAccepted = resolve;
    });
    const props: TextareaProps = {
      label: 'Message',
      value: 'before',
      onChange: event => {
        changes.push(event);
        window.setTimeout(() => {
          void (async () => {
            await act(async () => {
              root?.render(
                <Textarea label="Message" value={event.detail.value} onChange={props.onChange} />
              );
            });
            resolveAccepted();
          })();
        }, 40);
      },
    };
    const el = await render(props);
    const textarea = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'after';
    await act(async () =>
      textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    );
    expect(changes[0]).toBeInstanceOf(CustomEvent);
    expect(changes[0]).toMatchObject({
      type: 'cosm-change',
      detail: { value: 'after' },
      bubbles: true,
      composed: true,
    });
    await accepted;
    await el.updateComplete;
    expect(el.value).toBe('after');
  });

  it('forwards disabled, readonly, name, and constraints to the web element', async () => {
    const el = await render({
      label: 'Message',
      name: 'message',
      rows: 6,
      maxLength: 100,
      required: true,
      readOnly: true,
      variant: 'filled',
      size: 'lg',
    });
    const textarea = el.shadowRoot?.querySelector('textarea');
    expect(Number(textarea?.rows)).toBe(6);
    expect(textarea?.maxLength).toBe(100);
    expect(textarea?.required).toBe(true);
    expect(textarea?.readOnly).toBe(true);
    expect(el.name).toBe('message');
    expect(el.variant).toBe('filled');
    expect(el.size).toBe('lg');
  });
});
