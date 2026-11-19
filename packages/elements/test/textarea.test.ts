import {
  eventNames,
  propNames,
  type TextareaChangeDetail,
  textareaContract,
  textareaScenariosFor,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmTextarea } from '../src/components/textarea/cosm-textarea.js';
import { cleanup, fixture } from './fixture.js';

afterEach(cleanup);

const editor = (el: CosmTextarea) =>
  el.shadowRoot?.querySelector<HTMLTextAreaElement>('textarea') as HTMLTextAreaElement;
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

describe('cosm-textarea: shared scenarios', () => {
  for (const scenario of textareaScenariosFor('web')) {
    it(scenario.name, async () => {
      const el = await fixture<CosmTextarea>('<cosm-textarea label="Scenario"></cosm-textarea>');
      Object.assign(el, scenario.props);
      el.valueControlled = scenario.props.value !== undefined;
      await el.updateComplete;
      const changes: string[] = [];
      el.addEventListener('cosm-change', event => {
        changes.push((event as CustomEvent<TextareaChangeDetail>).detail.value);
      });

      for (const action of scenario.actions) {
        if (action.type === 'edit') {
          editor(el).value = action.value;
          editor(el).dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        } else if (action.type === 'sync') {
          el.value = action.value;
        } else if (action.type === 'reset') {
          el.formResetCallback();
        }
        await el.updateComplete;
      }

      if (el.valueControlled) await nextFrame();
      await Promise.resolve();
      await el.updateComplete;
      expect(el.value).toBe(scenario.expected.value);
      expect(editor(el).value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      expect(el.disabled).toBe(scenario.expected.disabled);
    });
  }
});

describe('cosm-textarea: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmTextarea.properties).sort()).toEqual(
      propNames(textareaContract, 'web').sort()
    );
  });

  it('dispatches only the DOM events of the contract', () => {
    expect(eventNames(textareaContract, 'dom')).toEqual(['cosm-change']);
  });
});

describe('cosm-textarea', () => {
  it('renders the native multiline editor with defaults and native constraints', async () => {
    const el = await fixture<CosmTextarea>(
      '<cosm-textarea label="Message" name="message" required max-length="20"></cosm-textarea>'
    );
    expect(Number(editor(el).rows)).toBe(4);
    expect(editor(el).required).toBe(true);
    expect(editor(el).maxLength).toBe(20);
    expect(el.getAttribute('name')).toBe('message');
    expect(editor(el).hasAttribute('name')).toBe(false);
    expect(el.getAttribute('variant')).toBe('outlined');
    expect(el.getAttribute('size')).toBe('md');
  });

  it('associates the accessible label, help and error with the editor', async () => {
    const el = await fixture<CosmTextarea>(
      '<cosm-textarea label="Message" help-text="Use plain text" error="Too short"></cosm-textarea>'
    );
    const textarea = editor(el);
    const label = el.shadowRoot?.querySelector<HTMLLabelElement>('[part="label"]');
    expect(label?.htmlFor).toBe(textarea.id);
    expect(textarea.labels?.[0]?.textContent).toBe('Message');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.getAttribute('aria-describedby')).toContain('help');
    expect(textarea.getAttribute('aria-describedby')).toContain('error');
    expect(el.shadowRoot?.querySelector('[part="error"]')?.textContent).toBe('Too short');
  });

  it('keeps visually hidden labels available to assistive technology', async () => {
    const el = await fixture<CosmTextarea>(
      '<cosm-textarea label="Private message" label-hidden></cosm-textarea>'
    );
    expect(el.shadowRoot?.querySelector('[part="label"]')?.classList.contains('label-hidden')).toBe(
      true
    );
    expect(editor(el).labels?.[0]?.textContent).toBe('Private message');
  });

  it('keeps visual variant and size independent from rows', async () => {
    const el = await fixture<CosmTextarea>(
      '<cosm-textarea label="Details" rows="7" size="sm" variant="filled"></cosm-textarea>'
    );
    expect(Number(editor(el).rows)).toBe(7);
    expect(el.size).toBe('sm');
    expect(el.variant).toBe('filled');
  });

  it('uses native disabled and read-only semantics and excludes form-disabled values', async () => {
    const el = await fixture<CosmTextarea>(
      '<cosm-textarea label="Message" name="message" value="draft"></cosm-textarea>'
    );
    el.disabled = true;
    await el.updateComplete;
    expect(editor(el).disabled).toBe(true);
    el.disabled = false;
    el.readOnly = true;
    await el.updateComplete;
    expect(editor(el).readOnly).toBe(true);
    expect(editor(el).disabled).toBe(false);
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(editor(el).disabled).toBe(true);
    el.formDisabledCallback(false);
  });

  it('uses the element as the form-associated control and resets autonomous values', async () => {
    const form = document.createElement('form');
    const el = document.createElement('cosm-textarea') as CosmTextarea;
    el.label = 'Message';
    el.name = 'message';
    el.defaultValue = 'initial';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(CosmTextarea.formAssociated).toBe(true);
    expect(el.form).toBe(form);
    expect(el.value).toBe('initial');
    el.value = 'changed';
    el.formResetCallback();
    await el.updateComplete;
    expect(el.value).toBe('initial');
    form.remove();
  });

  it('proposes controlled reset without self-committing', async () => {
    const el = await fixture<CosmTextarea>(
      '<cosm-textarea label="Message" value="current" default-value="initial"></cosm-textarea>'
    );
    el.valueControlled = true;
    await el.updateComplete;
    const change = vi.fn();
    el.addEventListener('cosm-change', change);
    el.formResetCallback();
    expect(change).toHaveBeenCalledOnce();
    expect(change.mock.calls[0]?.[0]).toMatchObject({
      detail: { value: 'initial' },
      bubbles: true,
      composed: true,
    });
    expect(el.value).toBe('current');
  });

  it('does not turn Enter into a submit request', async () => {
    const el = await fixture<CosmTextarea>('<cosm-textarea label="Message"></cosm-textarea>');
    const change = vi.fn();
    el.addEventListener('cosm-change', change);
    editor(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(change).not.toHaveBeenCalled();
    editor(el).value = 'first\nsecond';
    editor(el).dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(change.mock.calls[0]?.[0]).toMatchObject({
      detail: { value: 'first\nsecond' },
    });
  });

  it('rejects nonpositive or fractional rows', async () => {
    const el = await fixture<CosmTextarea>('<cosm-textarea label="Message"></cosm-textarea>');
    el.rows = 0;
    await expect(el.updateComplete).rejects.toThrow('rows must be a positive integer');
  });

  it('rejects negative or fractional maxLength values', async () => {
    const el = await fixture<CosmTextarea>('<cosm-textarea label="Message"></cosm-textarea>');
    el.maxLength = -1;
    await expect(el.updateComplete).rejects.toThrow('maxLength must be a nonnegative integer');
  });

  it('rejects missing accessible labels', async () => {
    const el = document.createElement('cosm-textarea') as CosmTextarea;
    document.body.append(el);
    await expect(el.updateComplete).rejects.toThrow('requires a non-empty label');
    el.remove();
  });

  it('focuses the native editor', async () => {
    const el = await fixture<CosmTextarea>('<cosm-textarea label="Message"></cosm-textarea>');
    el.focus();
    expect(el.shadowRoot?.activeElement ?? document.activeElement).toBe(editor(el));
  });
});
