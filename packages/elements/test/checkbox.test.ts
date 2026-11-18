import {
  type CheckboxCheckedChangeDetail,
  checkboxContract,
  checkboxScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmCheckbox } from '../src/components/checkbox/cosm-checkbox.js';
import { cleanup, fixture } from './fixture.js';

const mountedForms: HTMLFormElement[] = [];

afterEach(() => {
  cleanup();
  for (const form of mountedForms.splice(0)) form.remove();
});

async function createCheckbox(props: Partial<CosmCheckbox> = {}): Promise<CosmCheckbox> {
  const element = await fixture<CosmCheckbox>(
    '<cosm-checkbox label="Accept terms">Accept terms</cosm-checkbox>'
  );
  Object.assign(element, props);
  element.checkedControlled = props.checked !== undefined;
  await element.updateComplete;
  return element;
}

const inputOf = (element: CosmCheckbox) =>
  element.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;

describe('cosm-checkbox: shared scenarios', () => {
  for (const scenario of checkboxScenariosFor('web')) {
    it(scenario.name, async () => {
      const element = await createCheckbox(scenario.props);
      const changes: boolean[] = [];
      element.addEventListener('cosm-checked-change', event => {
        changes.push((event as CustomEvent<CheckboxCheckedChangeDetail>).detail.checked);
      });

      for (const action of scenario.actions) {
        if (action.type === 'activate') inputOf(element).click();
        else element.checked = action.checked;
        await element.updateComplete;
      }

      expect(element.checked).toBe(scenario.expected.checked);
      expect(inputOf(element).checked).toBe(scenario.expected.checked);
      expect(changes).toEqual(scenario.expected.changes);
      if (scenario.expected.indeterminate !== undefined) {
        expect(inputOf(element).indeterminate).toBe(scenario.expected.indeterminate);
      }
    });
  }
});

describe('cosm-checkbox: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmCheckbox.properties).sort()).toEqual(
      propNames(checkboxContract, 'web').sort()
    );
  });

  it('dispatches the contract event as the original composed CustomEvent', async () => {
    const element = await createCheckbox();
    const listener = vi.fn<(event: CustomEvent<CheckboxCheckedChangeDetail>) => void>();
    element.addEventListener('cosm-checked-change', listener);
    inputOf(element).click();
    expect(eventNames(checkboxContract, 'dom')).toEqual(['cosm-checked-change']);
    expect(listener).toHaveBeenCalledOnce();
    const event = listener.mock.calls[0]?.[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event?.bubbles).toBe(true);
    expect(event?.composed).toBe(true);
    expect(event?.detail).toEqual({ checked: true });
  });
});

describe('cosm-checkbox', () => {
  it('renders a named native checkbox with hidden-label, required and described error semantics', async () => {
    const element = await createCheckbox({
      hideLabel: true,
      required: true,
      invalid: true,
      helpText: 'Required for enrollment.',
      errorText: 'Choose this option to continue.',
    });
    const input = inputOf(element);
    expect(input.type).toBe('checkbox');
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain('help');
    expect(input.getAttribute('aria-describedby')).toContain('error');
    expect(
      element.shadowRoot?.querySelector('[part="label"]')?.classList.contains('label-hidden')
    ).toBe(true);
    expect(element.shadowRoot?.querySelector('[part="box"]')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  it('uses the visual size hook and rejects invalid custom sizes', async () => {
    const element = await createCheckbox({ size: 23 });
    expect(element.style.getPropertyValue('--_custom-size')).toBe('23px');
    element.size = 0;
    await expect(element.updateComplete).rejects.toThrow(/Checkbox size/);
  });

  it('associates with a form and restores the default on reset', async () => {
    const form = document.createElement('form');
    form.innerHTML =
      '<cosm-checkbox label="Accept terms" name="terms" value="accepted" required></cosm-checkbox>';
    document.body.append(form);
    mountedForms.push(form);
    const element = form.querySelector('cosm-checkbox') as CosmCheckbox;
    await element.updateComplete;
    expect(element.form).toBe(form);
    expect(element.checkValidity()).toBe(false);
    expect(element.name).toBe('terms');
    expect(element.value).toBe('accepted');

    inputOf(element).click();
    await element.updateComplete;
    expect(element.checkValidity()).toBe(true);
    expect(element.value).toBe('accepted');

    element.formResetCallback();
    await element.updateComplete;
    expect(element.checked).toBe(false);
  });

  it('honors form-disabled state without toggling', async () => {
    const element = await createCheckbox({
      name: 'terms',
      value: 'accepted',
      checked: true,
    });
    const form = document.createElement('form');
    form.append(element);
    document.body.append(form);
    mountedForms.push(form);
    await element.updateComplete;
    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(inputOf(element).disabled).toBe(true);
    const checked = element.checked;
    inputOf(element).click();
    await element.updateComplete;
    expect(element.checked).toBe(checked);
  });
});
