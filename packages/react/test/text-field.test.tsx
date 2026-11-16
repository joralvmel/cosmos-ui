import {
  eventNames,
  propNames,
  type TextFieldChangeDetail,
  type TextFieldSubmitDetail,
  textFieldContract,
  textFieldScenariosFor,
} from '@joralvmel/cosmos-core';
import type { CosmTextField } from '@joralvmel/cosmos-elements/text-field';
import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextField, type TextFieldProps, textFieldEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(props: Partial<TextFieldProps> = {}) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<TextField label="Text field" {...props} />));
  const el = container.querySelector('cosm-text-field') as CosmTextField;
  await el.updateComplete;
  return el;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
});

const input = (el: CosmTextField) =>
  el.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

function ControlledFieldHost({ acceptImmediately }: { acceptImmediately: boolean }) {
  const [value, setValue] = React.useState('initial');
  const [proposal, setProposal] = React.useState<string | undefined>();
  return (
    <>
      <TextField
        label="Account"
        value={value}
        clearable
        clearLabel="Clear account"
        onChange={event => {
          setProposal(event.detail.value);
          if (acceptImmediately) setValue(event.detail.value);
        }}
      />
      <button
        type="button"
        aria-label="Accept proposal"
        data-accept
        onClick={() => {
          if (proposal !== undefined) setValue(proposal);
        }}
      />
      <button
        type="button"
        aria-label="Reject proposal"
        data-reject
        onClick={() => setProposal(undefined)}
      />
      <output data-controlled-value>{value}</output>
    </>
  );
}

describe('TextField: shared scenarios', () => {
  for (const scenario of textFieldScenariosFor('react')) {
    it(scenario.name, async () => {
      const onChange = vi.fn<(event: CustomEvent<TextFieldChangeDetail>) => void>();
      const onSubmit = vi.fn<(event: CustomEvent<TextFieldSubmitDetail>) => void>();
      const el = await render({
        ...scenario.props,
        ...(scenario.props.clearable ? { clearLabel: 'Clear' } : {}),
        ...(scenario.props.passwordReveal
          ? { revealPasswordLabel: 'Show password', hidePasswordLabel: 'Hide password' }
          : {}),
        onChange,
        onSubmit,
      });
      for (const action of scenario.actions) {
        if (action.type === 'edit') {
          input(el).value = action.value;
          if (action.selectionStart !== undefined)
            input(el).setSelectionRange(action.selectionStart, action.selectionStart);
          if (action.composing)
            input(el).dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
          input(el).dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          if (action.composing)
            input(el).dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
        } else if (action.type === 'sync') {
          await act(async () =>
            root?.render(
              <TextField
                label="Text field"
                {...scenario.props}
                value={action.value}
                onChange={onChange}
                onSubmit={onSubmit}
              />
            )
          );
        } else if (action.type === 'clear') {
          await act(async () =>
            el.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]')?.click()
          );
        } else if (action.type === 'reveal' || action.type === 'hide') {
          await act(async () =>
            el.shadowRoot?.querySelector<HTMLButtonElement>('[part="reveal-button"]')?.click()
          );
        } else if (action.type === 'submit') {
          input(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        } else if (action.type === 'reset') {
          el.formResetCallback();
        }
        await act(async () => {
          await el.updateComplete;
          await Promise.resolve();
        });
      }

      if (scenario.props.value !== undefined) {
        await act(async () => {
          await nextFrame();
          await el.updateComplete;
        });
      }
      expect(el.value).toBe(scenario.expected.value);
      expect(input(el).value).toBe(scenario.expected.value);
      expect(onChange.mock.calls.map(([event]) => event.detail.value)).toEqual(
        scenario.expected.changes
      );
      if (scenario.expected.submits)
        expect(onSubmit.mock.calls.map(([event]) => event.detail.value)).toEqual(
          scenario.expected.submits
        );
      if (scenario.expected.selectionStart !== undefined)
        expect(input(el).selectionStart).toBe(scenario.expected.selectionStart);
      if (scenario.expected.passwordVisible !== undefined)
        expect(input(el).type).toBe(scenario.expected.passwordVisible ? 'text' : 'password');
    });
  }
});

describe('TextField: contract drift', () => {
  it('maps every contract event to its React name and DOM event', () => {
    expect(Object.keys(textFieldEvents)).toEqual(eventNames(textFieldContract, 'react'));
    expect(Object.values(textFieldEvents)).toEqual(eventNames(textFieldContract, 'dom'));
  });

  it('forwards every contract prop to the element', async () => {
    const values: Record<string, unknown> = {
      label: 'Account',
      labelHidden: true,
      value: '',
      defaultValue: 'default',
      type: 'email',
      variant: 'filled',
      size: 52,
      placeholder: 'name@example.com',
      helpText: 'Help',
      error: 'Error',
      invalid: true,
      required: true,
      disabled: true,
      readOnly: true,
      minLength: 2,
      maxLength: 20,
      pattern: '.+',
      name: 'account',
      autoComplete: 'email',
      inputMode: 'email',
      startIcon: { name: 'search', viewBox: '0 0 24 24', nodes: [] },
      endIcon: { name: 'house', viewBox: '0 0 24 24', nodes: [] },
      iconFocusScope: 'input',
      prefix: '$',
      suffix: 'USD',
      clearable: true,
      clearLabel: 'Clear',
      passwordReveal: true,
      revealPasswordLabel: 'Show',
      hidePasswordLabel: 'Hide',
    };
    expect(Object.keys(values).sort()).toEqual(propNames(textFieldContract, 'react').sort());
    const el = await render(values as TextFieldProps);
    for (const [name, value] of Object.entries(values))
      expect(el[name as keyof CosmTextField], name).toBe(value);
    expect(el.valueControlled).toBe(true);
  });

  it('forwards the original CustomEvents and handles accepted and rejected controlled updates', async () => {
    const accepted = vi.fn<(event: CustomEvent<TextFieldChangeDetail>) => void>();
    let el = await render({ value: 'stable', onChange: accepted });
    const refusedEvent = new Event('input', { bubbles: true, composed: true });
    input(el).value = 'refused';
    input(el).dispatchEvent(refusedEvent);
    await act(async () => {
      await nextFrame();
      await el.updateComplete;
    });
    expect(accepted.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect(accepted.mock.calls[0]?.[0].detail.value).toBe('refused');
    expect(el.value).toBe('stable');
    expect(input(el).value).toBe('stable');

    await act(async () =>
      root?.render(<TextField label="Text field" value="accepted" onChange={accepted} />)
    );
    el = container?.querySelector('cosm-text-field') as CosmTextField;
    await el.updateComplete;
    expect(el.value).toBe('accepted');
    expect(input(el).value).toBe('accepted');
  });
});

describe('TextField: stateful controlled integration', () => {
  it('keeps every rapidly accepted character and restores a genuinely rejected proposal', async () => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root?.render(<ControlledFieldHost acceptImmediately />));
    const el = container.querySelector('cosm-text-field') as CosmTextField;
    await el.updateComplete;

    await act(async () => {
      for (const character of '123456789') {
        const field = input(el);
        const nextValue = `${field.value}${character}`;
        field.value = nextValue;
        field.setSelectionRange(nextValue.length, nextValue.length);
        field.dispatchEvent(
          new InputEvent('input', {
            bubbles: true,
            composed: true,
            inputType: 'insertText',
            data: character,
          })
        );
        expect(el.value).toBe(nextValue);
        await nextFrame();
      }
    });

    expect(container.querySelector('[data-controlled-value]')?.textContent).toBe(
      'initial123456789'
    );
    expect(el.value).toBe('initial123456789');
    expect(input(el).value).toBe('initial123456789');
    await act(async () => root?.render(<ControlledFieldHost acceptImmediately={false} />));
    await el.updateComplete;
    await act(async () => {
      const field = input(el);
      field.value = `${field.value}X`;
      field.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: 'X' }));
      await nextFrame();
      await el.updateComplete;
    });
    expect(container.querySelector('[data-controlled-value]')?.textContent).toBe(
      'initial123456789'
    );
    expect(input(el).value).toBe('initial123456789');
  });

  it('accepts a delayed proposal on demand and keeps a refused clear focused on the input', async () => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root?.render(<ControlledFieldHost acceptImmediately={false} />));
    const el = container.querySelector('cosm-text-field') as CosmTextField;
    await el.updateComplete;
    const field = input(el);
    await act(async () => {
      field.value = 'initial draft';
      field.dispatchEvent(
        new InputEvent('input', { bubbles: true, composed: true, data: ' draft' })
      );
    });
    await act(async () => {
      await nextFrame();
      await el.updateComplete;
    });
    expect(input(el).value).toBe('initial');

    await act(async () => container?.querySelector<HTMLButtonElement>('[data-accept]')?.click());
    await el.updateComplete;
    expect(el.value).toBe('initial draft');
    expect(input(el).value).toBe('initial draft');

    const clear = el.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]');
    await act(async () => clear?.click());
    expect(document.activeElement).toBe(el);
    expect(el.shadowRoot?.activeElement).toBe(field);
    await act(async () => {
      await nextFrame();
      await el.updateComplete;
    });
    expect(el.value).toBe('initial draft');
    expect(input(el).value).toBe('initial draft');
  });
});
