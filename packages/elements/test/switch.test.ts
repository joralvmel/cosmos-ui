import {
  eventNames,
  propNames,
  type SwitchCheckedChangeDetail,
  switchContract,
  switchScenariosFor,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmSwitch } from '../src/components/switch/cosm-switch.js';
import { cleanup, fixture } from './fixture.js';

const mountedForms: HTMLFormElement[] = [];

afterEach(() => {
  cleanup();
  for (const form of mountedForms.splice(0)) form.remove();
});

async function createSwitch(props: Partial<CosmSwitch> = {}): Promise<CosmSwitch> {
  const form = document.createElement('form');
  const element = document.createElement('cosm-switch');
  element.label = 'Enable notifications';
  Object.assign(element, props);
  element.checkedControlled = props.checked !== undefined;
  form.append(element);
  document.body.append(form);
  mountedForms.push(form);
  await element.updateComplete;
  return element;
}

const inputOf = (element: CosmSwitch) =>
  element.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;

describe('cosm-switch: shared scenarios', () => {
  for (const scenario of switchScenariosFor('web')) {
    it(scenario.name, async () => {
      const element = await createSwitch(scenario.props);
      const changes: boolean[] = [];
      element.addEventListener('cosm-checked-change', event => {
        changes.push((event as CustomEvent<SwitchCheckedChangeDetail>).detail.checked);
      });

      for (const action of scenario.actions) {
        if (action.type === 'activate') inputOf(element).click();
        else element.checked = action.checked;
        await element.updateComplete;
      }

      expect(element.checked).toBe(scenario.expected.checked);
      expect(inputOf(element).checked).toBe(scenario.expected.checked);
      expect(changes).toEqual(scenario.expected.changes);
    });
  }
});

describe('cosm-switch: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmSwitch.properties).sort()).toEqual(
      propNames(switchContract, 'web').sort()
    );
  });

  it('dispatches the contract event as the original composed CustomEvent', async () => {
    const element = await createSwitch();
    const listener = vi.fn<(event: CustomEvent<SwitchCheckedChangeDetail>) => void>();
    element.addEventListener('cosm-checked-change', listener);
    inputOf(element).click();
    expect(eventNames(switchContract, 'dom')).toEqual(['cosm-checked-change']);
    expect(listener).toHaveBeenCalledOnce();
    const event = listener.mock.calls[0]?.[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event?.bubbles).toBe(true);
    expect(event?.composed).toBe(true);
    expect(event?.detail).toEqual({ checked: true });
  });
});

describe('cosm-switch', () => {
  it('renders checkbox input switch semantics with stable label and described help', async () => {
    const element = await createSwitch({
      hideLabel: true,
      defaultChecked: true,
      helpText: 'You can change this preference at any time.',
    });
    const input = inputOf(element);
    expect(input.type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.checked).toBe(true);
    expect(input.getAttribute('aria-describedby')).toContain('help');
    const label = element.shadowRoot?.querySelector<HTMLElement>('[part="label"]');
    expect(label?.textContent?.trim()).toBe('Enable notifications');
    expect(label?.classList.contains('label-hidden')).toBe(true);
    expect(element.shadowRoot?.querySelector('[part="help-text"]')?.textContent).toBe(
      'You can change this preference at any time.'
    );
    expect(element.shadowRoot?.querySelector('label [part="help-text"]')).toBeNull();
    input.click();
    await element.updateComplete;
    expect(label?.textContent?.trim()).toBe('Enable notifications');
  });

  it('uses defaultChecked only for initialization and form reset, not live updates', async () => {
    const element = await createSwitch();
    element.defaultChecked = true;
    await element.updateComplete;
    expect(element.checked).toBe(false);
    element.formResetCallback();
    await element.updateComplete;
    expect(element.checked).toBe(true);
  });

  it('uses the native Space activation behavior and supports focus()', async () => {
    const element = await createSwitch();
    const input = inputOf(element);
    const changes: boolean[] = [];
    element.addEventListener('cosm-checked-change', event => {
      changes.push((event as CustomEvent<SwitchCheckedChangeDetail>).detail.checked);
    });
    element.focus();
    expect(element.shadowRoot?.activeElement).toBe(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    input.click();
    await element.updateComplete;
    expect(element.checked).toBe(true);
    expect(changes).toEqual([true]);
  });

  it('uses the visual size hook and rejects invalid sizes and empty labels', async () => {
    const element = await createSwitch({ size: 28 });
    expect(element.style.getPropertyValue('--_custom-height')).toBe('28px');
    element.size = 0;
    await expect(element.updateComplete).rejects.toThrow(/Switch size/);
    const unlabeled = document.createElement('cosm-switch') as CosmSwitch;
    document.body.append(unlabeled);
    await expect(unlabeled.updateComplete).rejects.toThrow(/non-empty label/);
  });

  it('associates with a form and restores the autonomous default on reset', async () => {
    const form = document.createElement('form');
    form.innerHTML =
      '<cosm-switch label="Enable notifications" name="notifications" value="enabled" default-checked></cosm-switch>';
    document.body.append(form);
    mountedForms.push(form);
    const element = form.querySelector('cosm-switch') as CosmSwitch;
    await element.updateComplete;
    expect(element.form).toBe(form);
    expect(element.name).toBe('notifications');
    expect(element.value).toBe('enabled');
    expect(element.checked).toBe(true);

    inputOf(element).click();
    await element.updateComplete;
    expect(element.checked).toBe(false);
    element.formResetCallback();
    await element.updateComplete;
    expect(element.checked).toBe(true);
  });

  it('proposes form reset for controlled state and honors disabled fieldsets', async () => {
    const form = document.createElement('form');
    form.innerHTML =
      '<fieldset disabled><cosm-switch label="Enable notifications" name="notifications" checked></cosm-switch></fieldset>';
    document.body.append(form);
    mountedForms.push(form);
    const element = form.querySelector('cosm-switch') as CosmSwitch;
    element.checked = true;
    element.checkedControlled = true;
    element.formDisabledCallback(true);
    await element.updateComplete;
    const listener = vi.fn();
    element.addEventListener('cosm-checked-change', listener);
    inputOf(element).click();
    expect(inputOf(element).disabled).toBe(true);
    expect(element.checked).toBe(true);
    expect(listener).not.toHaveBeenCalled();

    element.defaultChecked = false;
    element.formResetCallback();
    expect(listener.mock.calls[0]?.[0].detail).toEqual({ checked: false });
    expect(element.checked).toBe(true);
  });

  it('does not render consumer child content', async () => {
    const element = await fixture<CosmSwitch>(
      '<cosm-switch label="Enable notifications">ignored</cosm-switch>'
    );
    expect(element.shadowRoot?.textContent).not.toContain('ignored');
  });
});
