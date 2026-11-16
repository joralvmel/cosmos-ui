import {
  eventNames,
  propNames,
  type TextFieldChangeDetail,
  type TextFieldSubmitDetail,
  textFieldContract,
  textFieldScenariosFor,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmTextField } from '../src/components/text-field/cosm-text-field.js';
import { cleanup, fixture } from './fixture.js';

afterEach(cleanup);

const input = (el: CosmTextField) =>
  el.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

describe('cosm-text-field: shared scenarios', () => {
  for (const scenario of textFieldScenariosFor('web')) {
    it(scenario.name, async () => {
      const el = await fixture<CosmTextField>(
        '<cosm-text-field label="Scenario"></cosm-text-field>'
      );
      Object.assign(el, {
        ...scenario.props,
        ...(scenario.props.clearable ? { clearLabel: 'Clear' } : {}),
        ...(scenario.props.passwordReveal
          ? { revealPasswordLabel: 'Show password', hidePasswordLabel: 'Hide password' }
          : {}),
      });
      el.valueControlled = scenario.props.value !== undefined;
      await el.updateComplete;
      const changes: string[] = [];
      const submits: string[] = [];
      el.addEventListener('cosm-change', event => {
        changes.push((event as CustomEvent<TextFieldChangeDetail>).detail.value);
      });
      el.addEventListener('cosm-submit', event => {
        submits.push((event as CustomEvent<TextFieldSubmitDetail>).detail.value);
      });

      for (const action of scenario.actions) {
        if (action.type === 'edit') {
          const field = input(el);
          field.value = action.value;
          if (action.selectionStart !== undefined)
            field.setSelectionRange(action.selectionStart, action.selectionStart);
          if (action.composing)
            field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
          field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          if (action.composing)
            field.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
        } else if (action.type === 'sync') {
          el.value = action.value;
        } else if (action.type === 'clear') {
          el.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]')?.click();
        } else if (action.type === 'reveal' || action.type === 'hide') {
          const button = el.shadowRoot?.querySelector<HTMLButtonElement>('[part="reveal-button"]');
          button?.click();
        } else if (action.type === 'submit') {
          input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        } else if (action.type === 'reset') {
          el.formResetCallback();
        }
        await el.updateComplete;
      }

      if (el.valueControlled) await nextFrame();
      await Promise.resolve();
      await el.updateComplete;
      expect(el.value).toBe(scenario.expected.value);
      expect(input(el).value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      expect(el.disabled).toBe(scenario.expected.disabled);
      if (scenario.expected.submits) expect(submits).toEqual(scenario.expected.submits);
      if (scenario.expected.selectionStart !== undefined)
        expect(input(el).selectionStart).toBe(scenario.expected.selectionStart);
      if (scenario.expected.focused)
        expect(el.shadowRoot?.activeElement ?? document.activeElement).toBe(input(el));
      if (scenario.expected.passwordVisible !== undefined)
        expect(input(el).type).toBe(scenario.expected.passwordVisible ? 'text' : 'password');
    });
  }
});

describe('cosm-text-field: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmTextField.properties).sort()).toEqual(
      propNames(textFieldContract, 'web').sort()
    );
  });

  it('dispatches only the DOM events of the contract', () => {
    expect(eventNames(textFieldContract, 'dom')).toEqual(['cosm-change', 'cosm-submit']);
  });
});

describe('cosm-text-field', () => {
  it('associates the label and supporting/error content with the editable control', async () => {
    const el = await fixture<CosmTextField>(
      '<cosm-text-field label="Email" help-text="Use a work address" error="Not valid" invalid></cosm-text-field>'
    );
    const field = input(el);
    const label = el.shadowRoot?.querySelector<HTMLLabelElement>('[part="label"]');
    expect(label?.htmlFor).toBe(field.id);
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(field.getAttribute('aria-describedby')).toContain('help');
    expect(field.getAttribute('aria-describedby')).toContain('error');
    expect(label?.classList.contains('label-hidden')).toBe(false);
  });

  it('keeps a visually hidden label available to the input', async () => {
    const el = await fixture<CosmTextField>(
      '<cosm-text-field label="Search" label-hidden></cosm-text-field>'
    );
    expect(el.shadowRoot?.querySelector('[part="label"]')?.classList.contains('label-hidden')).toBe(
      true
    );
    expect(input(el).labels?.[0]?.textContent).toBe('Search');
  });

  it('renders every supported input type and native constraints', async () => {
    const types = ['text', 'email', 'password', 'tel', 'url', 'search'] as const;
    for (const type of types) {
      const el = await fixture<CosmTextField>(
        `<cosm-text-field label="Type" type="${type}" required pattern=".+"></cosm-text-field>`
      );
      expect(input(el).type).toBe(type);
      expect(input(el).required).toBe(true);
      expect(input(el).pattern).toBe('.+');
      el.remove();
    }
  });

  it('renders consumer icons and plain prefix/suffix decorations', async () => {
    const el = await fixture<CosmTextField>(
      '<cosm-text-field label="Search" prefix="USD" suffix="per month"></cosm-text-field>'
    );
    const icon = {
      name: 'search',
      viewBox: '0 0 24 24',
      nodes: [['circle', { cx: 10, cy: 10, r: 6 }]] as const,
    };
    el.startIcon = icon;
    el.endIcon = icon;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="start"]')?.textContent).toContain('USD');
    expect(el.shadowRoot?.querySelector('[part="end"]')?.textContent).toContain('per month');
    expect(
      [...(el.shadowRoot?.querySelectorAll('cosm-icon') ?? [])].map(item => item.icon.name)
    ).toEqual(['search', 'search']);
  });

  it('uses the requested numeric minimum height without changing semantic size', async () => {
    const el = await fixture<CosmTextField>(
      '<cosm-text-field label="Custom size"></cosm-text-field>'
    );
    el.size = 56;
    await el.updateComplete;
    expect(el.size).toBe(56);
    expect(el.style.getPropertyValue('--_minimum-height')).toBe('56px');
  });

  it('exposes native validity and associated constraint errors', async () => {
    const el = await fixture<CosmTextField>(
      '<cosm-text-field label="Email" type="email" required></cosm-text-field>'
    );
    expect(el.checkValidity()).toBe(false);
    el.value = 'not-an-email';
    await el.updateComplete;
    expect(el.validity?.typeMismatch).toBe(true);
    expect(el.reportValidity()).toBe(false);
    await el.updateComplete;
    expect(input(el).getAttribute('aria-invalid')).toBe('true');
    expect(el.shadowRoot?.querySelector('[part="error"]')?.textContent).toBeTruthy();
  });

  it('follows form-disabled state and excludes the field while disabled', async () => {
    const el = await fixture<CosmTextField>(
      '<cosm-text-field label="Account" name="account" value="value"></cosm-text-field>'
    );
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(input(el).disabled).toBe(true);
    el.formDisabledCallback(false);
    await el.updateComplete;
    expect(input(el).disabled).toBe(false);
  });

  it('does not expose clear or reveal actions when disabled or read-only', async () => {
    const el = await fixture<CosmTextField>(
      '<cosm-text-field label="Secret" value="hidden" type="password" clearable clear-label="Clear" password-reveal reveal-password-label="Show" hide-password-label="Hide" disabled></cosm-text-field>'
    );
    expect(el.shadowRoot?.querySelector('[part="clear-button"]')).toBeNull();
    expect(el.shadowRoot?.querySelector('[part="reveal-button"]')).toBeNull();
    el.disabled = false;
    el.readOnly = true;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="clear-button"]')).toBeNull();
    expect(el.shadowRoot?.querySelector('[part="reveal-button"]')).toBeNull();
  });

  it('toggles password presentation without dispatching a value change', async () => {
    const el = await fixture<CosmTextField>(
      '<cosm-text-field label="Password" value="secret" type="password" password-reveal reveal-password-label="Show password" hide-password-label="Hide password"></cosm-text-field>'
    );
    const change = vi.fn();
    el.addEventListener('cosm-change', change);
    const toggle = el.shadowRoot?.querySelector<HTMLButtonElement>('[part="reveal-button"]');
    expect(input(el).type).toBe('password');
    expect(toggle?.getAttribute('aria-label')).toBe('Show password');
    toggle?.click();
    await el.updateComplete;
    expect(input(el).type).toBe('text');
    expect(toggle?.getAttribute('aria-label')).toBe('Hide password');
    expect(el.value).toBe('secret');
    expect(change).not.toHaveBeenCalled();
  });

  it.each(['disabled', 'readOnly', 'passwordReveal', 'type', 'fieldset'] as const)(
    'does not preserve revealed password state after changing %s',
    async state => {
      const el = await fixture<CosmTextField>(
        '<cosm-text-field label="Password" value="secret" type="password" password-reveal reveal-password-label="Show" hide-password-label="Hide"></cosm-text-field>'
      );
      const change = vi.fn();
      el.addEventListener('cosm-change', change);
      el.shadowRoot?.querySelector<HTMLButtonElement>('[part="reveal-button"]')?.click();
      await el.updateComplete;
      expect(input(el).type).toBe('text');
      if (state === 'fieldset') el.formDisabledCallback(true);
      else if (state === 'type') el.type = 'text';
      else if (state === 'passwordReveal') el.passwordReveal = false;
      else el[state] = true;
      await el.updateComplete;
      if (state !== 'type') expect(input(el).type).toBe('password');
      if (state === 'fieldset') el.formDisabledCallback(false);
      else if (state === 'type') el.type = 'password';
      else if (state === 'passwordReveal') el.passwordReveal = true;
      else el[state] = false;
      await el.updateComplete;
      expect(input(el).type).toBe('password');
      expect(
        el.shadowRoot?.querySelector('[part="reveal-button"]')?.getAttribute('aria-label')
      ).toBe('Show');
      expect(el.value).toBe('secret');
      expect(change).not.toHaveBeenCalled();
    }
  );

  it('uses the FACE host name and value for form submission', async () => {
    const form = document.createElement('form');
    const el = document.createElement('cosm-text-field') as CosmTextField;
    el.label = 'Account';
    el.name = 'account';
    el.value = 'cosmos';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(el.getAttribute('name')).toBe('account');
    expect(el.form).toBe(form);
    form.remove();
  });
});
