import {
  type ButtonAction,
  type ButtonPressDetail,
  buttonContract,
  buttonScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmButton } from '../src/components/button/cosm-button.js';
import { cleanup, fixture } from './fixture.js';

afterEach(cleanup);

const inner = (el: CosmButton) => el.shadowRoot?.querySelector('button') as HTMLButtonElement;

/** Simulates what a browser does for each scenario action. */
function act(el: CosmButton, action: ButtonAction) {
  const button = inner(el);
  if (action.type === 'press') {
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    if (!button.disabled)
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
    return;
  }
  button.dispatchEvent(
    new KeyboardEvent('keydown', { key: action.key, bubbles: true, composed: true })
  );
  if (!button.disabled)
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 0 }));
}

describe('cosm-button: shared scenarios', () => {
  for (const scenario of buttonScenariosFor('web')) {
    it(scenario.name, async () => {
      const el = await fixture<CosmButton>('<cosm-button>Save</cosm-button>');
      Object.assign(el, scenario.props);
      await el.updateComplete;
      const onPress = vi.fn((event: CustomEvent<ButtonPressDetail>) => event.detail.source);
      el.addEventListener('cosm-press', onPress);
      for (const action of scenario.actions) act(el, action);

      expect(onPress).toHaveBeenCalledTimes(scenario.expected.presses);
      if (scenario.expected.sources) {
        expect(onPress.mock.results.map(result => result.value)).toEqual(scenario.expected.sources);
      }
      expect(inner(el).getAttribute('aria-busy') === 'true').toBe(scenario.expected.busy);
      expect(inner(el).disabled).toBe(scenario.expected.disabled);
    });
  }
});

describe('cosm-button: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmButton.properties).sort()).toEqual(
      propNames(buttonContract, 'web').sort()
    );
  });

  it('dispatches the DOM events of the contract', async () => {
    const el = await fixture<CosmButton>('<cosm-button>Save</cosm-button>');
    const seen: string[] = [];
    for (const name of eventNames(buttonContract, 'dom'))
      el.addEventListener(name, () => seen.push(name));
    el.click();
    expect(seen).toEqual(eventNames(buttonContract, 'dom'));
  });
});

describe('cosm-button', () => {
  it('applies contract defaults and reflects styling props', async () => {
    const el = await fixture<CosmButton>('<cosm-button>Save</cosm-button>');
    expect(el.getAttribute('variant')).toBe('solid');
    expect(el.getAttribute('tone')).toBe('primary');
    expect(el.getAttribute('size')).toBe('md');
    el.fullWidth = true;
    await el.updateComplete;
    expect(el.hasAttribute('full-width')).toBe(true);
  });

  it('reports programmatic clicks', async () => {
    const el = await fixture<CosmButton>('<cosm-button>Save</cosm-button>');
    const onPress = vi.fn();
    el.addEventListener('cosm-press', onPress);
    el.click();
    expect(onPress.mock.calls[0]?.[0].detail).toEqual({ source: 'programmatic' });
  });

  it('does not let clicks escape while loading', async () => {
    const el = await fixture<CosmButton>('<cosm-button loading>Save</cosm-button>');
    const onClick = vi.fn();
    el.addEventListener('click', onClick);
    act(el, { type: 'press', source: 'pointer' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('uses label as accessible name', async () => {
    const el = await fixture<CosmButton>('<cosm-button label="Close dialog">×</cosm-button>');
    expect(inner(el).getAttribute('aria-label')).toBe('Close dialog');
  });

  it('renders a spinner only while loading', async () => {
    const el = await fixture<CosmButton>('<cosm-button>Save</cosm-button>');
    expect(el.shadowRoot?.querySelector('[part="spinner"]')).toBeNull();
    el.loading = true;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="spinner"]')).not.toBeNull();
  });

  it('submits and resets its form', async () => {
    const form = (await fixture<never>(
      '<form><input name="q" value="a"><cosm-button type="submit">Go</cosm-button><cosm-button type="reset">Reset</cosm-button></form>'
    )) as unknown as HTMLFormElement;
    const [submit, reset] = form.querySelectorAll('cosm-button');
    await submit?.updateComplete;
    await reset?.updateComplete;
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', onSubmit);
    submit?.click();
    expect(onSubmit).toHaveBeenCalledTimes(1);

    const input = form.querySelector('input') as HTMLInputElement;
    input.value = 'changed';
    reset?.click();
    expect(input.value).toBe('a');
  });
});
