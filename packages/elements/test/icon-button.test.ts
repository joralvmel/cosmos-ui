import {
  eventNames,
  iconButtonContract,
  iconButtonScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmIconButton } from '../src/components/icon-button/cosm-icon-button.js';
import { cleanup, fixture } from './fixture.js';

afterEach(cleanup);
const inner = (el: CosmIconButton) => el.shadowRoot?.querySelector('button') as HTMLButtonElement;

describe('cosm-icon-button: shared scenarios', () => {
  for (const scenario of iconButtonScenariosFor('web')) {
    it(scenario.name, async () => {
      const el = await fixture<CosmIconButton>(
        '<cosm-icon-button label="Favorite"></cosm-icon-button>'
      );
      Object.assign(el, scenario.props);
      await el.updateComplete;
      const presses: string[] = [];
      const changes: boolean[] = [];
      el.addEventListener('cosm-press', event => presses.push(event.detail.source));
      el.addEventListener('cosm-pressed-change', event => changes.push(event.detail.pressed));
      for (const action of scenario.actions) {
        if (action.type === 'sync') el.pressed = action.pressed;
        else {
          const button = inner(el);
          if (action.type === 'key') {
            button.dispatchEvent(new KeyboardEvent('keydown', { key: action.key, bubbles: true }));
          } else {
            button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
          }
          if (!button.disabled)
            button.dispatchEvent(
              new MouseEvent('click', {
                bubbles: true,
                composed: true,
                detail: action.type === 'key' ? 0 : 1,
              })
            );
        }
        await el.updateComplete;
      }
      expect(presses).toEqual(scenario.expected.sources);
      expect(changes).toEqual(scenario.expected.changes);
      expect(inner(el).disabled).toBe(scenario.expected.disabled);
      expect(inner(el).getAttribute('aria-pressed')).toBe(
        scenario.expected.pressed === null ? null : String(scenario.expected.pressed)
      );
    });
  }
});

describe('cosm-icon-button: contract drift', () => {
  it('exposes contract props and dispatches contract events', async () => {
    expect(Object.keys(CosmIconButton.properties).sort()).toEqual(
      propNames(iconButtonContract, 'web').sort()
    );
    const el = await fixture<CosmIconButton>(
      '<cosm-icon-button label="Favorite" mode="toggle"></cosm-icon-button>'
    );
    const events: string[] = [];
    for (const name of eventNames(iconButtonContract, 'dom'))
      el.addEventListener(name, () => events.push(name));
    el.click();
    expect(events.sort()).toEqual(eventNames(iconButtonContract, 'dom').sort());
  });
});

describe('cosm-icon-button', () => {
  it('returns to autonomous mode when the pressed attribute is removed', async () => {
    const el = await fixture<CosmIconButton>(
      '<cosm-icon-button label="Favorite" mode="toggle" pressed></cosm-icon-button>'
    );
    el.removeAttribute('pressed');
    await el.updateComplete;
    el.click();
    await el.updateComplete;
    expect(el.pressed).toBe(true);
  });

  it('names the button and hides the decorative icon', async () => {
    const el = await fixture<CosmIconButton>(
      '<cosm-icon-button label="Delete"><span>icon</span></cosm-icon-button>'
    );
    expect(inner(el).getAttribute('aria-label')).toBe('Delete');
    expect(inner(el).querySelector('[aria-hidden="true"] slot')).not.toBeNull();
    expect(inner(el).getAttribute('aria-pressed')).toBeNull();
  });
  it('rejects a missing or blank label', async () => {
    const el = document.createElement('cosm-icon-button');
    el.label = ' ';
    document.body.append(el);
    await expect(el.updateComplete).rejects.toThrow('requires a non-empty label');
    el.remove();
  });
  it('submits and resets forms only when requested', async () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.defaultValue = 'initial';
    const el = document.createElement('cosm-icon-button');
    el.label = 'Go';
    form.append(input, el);
    document.body.append(form);
    await el.updateComplete;
    const submit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', submit);
    el.click();
    expect(submit).not.toHaveBeenCalled();
    el.type = 'submit';
    el.click();
    expect(submit).toHaveBeenCalledTimes(1);
    input.value = 'changed';
    el.type = 'reset';
    el.click();
    expect(input.value).toBe('initial');
    form.remove();
  });
  it('respects disabled fieldset state without changing the public prop', async () => {
    const el = await fixture<CosmIconButton>(
      '<cosm-icon-button label="Favorite"></cosm-icon-button>'
    );
    const listener = vi.fn();
    el.addEventListener('cosm-press', listener);
    el.formDisabledCallback(true);
    await el.updateComplete;
    el.click();
    expect(inner(el).disabled).toBe(true);
    expect(el.disabled).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });
});
