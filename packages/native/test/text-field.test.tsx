import {
  eventNames,
  propNames,
  textFieldContract,
  textFieldScenariosFor,
} from '@joralvmel/cosmos-core';
import { brainCircuit } from '@joralvmel/cosmos-icons/brain-circuit';
import { search } from '@joralvmel/cosmos-icons/search';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CosmosThemeProvider,
  TextField,
  type TextFieldProps,
  textFieldPropNames,
} from '../src/index.js';
import { __setColorScheme, Platform } from './react-native.mock.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement;

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await update(node);
}
async function update(node: ReactNode) {
  await act(async () => root?.render(node));
}
const input = () => container.querySelector('input') as HTMLInputElement;
const button = (label: string) =>
  container.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement | null;
const styleOf = (element: Element) => JSON.parse(element.getAttribute('data-style') ?? '{}');
function contrast(first: string, second: string) {
  const luminance = (color: string) => {
    const components = color
      .slice(1)
      .match(/../g)
      ?.map(component => {
        const channel = Number.parseInt(component, 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
    if (components?.length !== 3) throw new Error('Expected hex RGB theme color');
    const [red, green, blue] = components;
    if (red === undefined || green === undefined || blue === undefined)
      throw new Error('Expected hex RGB theme color');
    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
async function edit(value: string) {
  await act(async () => {
    input().value = value;
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
}
afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  __setColorScheme('light');
  Platform.OS = 'web';
});

describe('TextField (native): shared scenarios', () => {
  for (const scenario of textFieldScenariosFor('native')) {
    it(scenario.name, async () => {
      const changes: string[] = [];
      const submits: string[] = [];
      let props = { ...scenario.props };
      const node = () => (
        <TextField
          label="Field"
          {...props}
          clearLabel="Clear"
          revealPasswordLabel="Show"
          hidePasswordLabel="Hide"
          onValueChange={detail => changes.push(detail.value)}
          onSubmitEditing={detail => submits.push(detail.value)}
        />
      );
      await render(node());
      for (const action of scenario.actions) {
        if (action.type === 'edit') {
          if (action.selectionStart !== undefined)
            input().setSelectionRange(action.selectionStart, action.selectionStart);
          if (scenario.props.disabled || scenario.props.readOnly) {
            expect(input().readOnly).toBe(true);
            await act(async () => input().dispatchEvent(new Event('input', { bubbles: true })));
          } else {
            await edit(action.value);
          }
        } else if (action.type === 'sync') {
          props = { ...props, value: action.value };
          await update(node());
        } else if (action.type === 'clear') {
          await act(async () => button('Clear')?.click());
        } else if (action.type === 'reveal' || action.type === 'hide') {
          const label = action.type === 'reveal' ? 'Show' : 'Hide';
          await act(async () => button(label)?.click());
          expect(input().type).toBe(action.type === 'reveal' ? 'text' : 'password');
        } else if (action.type === 'submit') {
          await act(async () =>
            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
          );
        }
      }
      expect(input().value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      expect(input().getAttribute('aria-disabled') === 'true').toBe(scenario.expected.disabled);
      if (scenario.expected.submits) expect(submits).toEqual(scenario.expected.submits);
      if (scenario.expected.focused) expect(document.activeElement).toBe(input());
      if (scenario.expected.passwordVisible !== undefined)
        expect(input().type === 'text').toBe(scenario.expected.passwordVisible);
      // DOM stand-ins cannot establish native IME or cursor behavior; device verification is required.
    });
  }
});

describe('TextField (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...textFieldPropNames].sort()).toEqual(propNames(textFieldContract, 'native').sort());
  });
  it('uses the contract callback names', () => {
    const callbacks: (keyof TextFieldProps)[] = ['onValueChange', 'onSubmitEditing'];
    expect(callbacks).toEqual(eventNames(textFieldContract, 'native'));
  });
});

describe('TextField (native)', () => {
  it.each(['android', 'ios'])('renders configured inherited icon colors on %s', async platform => {
    Platform.OS = platform;
    await render(
      <TextField
        label="Icons"
        startIcon={brainCircuit}
        endIcon={search}
        clearable
        clearLabel="Clear"
        defaultValue="Text"
        appearance={{ startIconColor: 'red', startIconFocusColor: 'blue', endIconColor: 'green' }}
      />
    );
    const icons = container.querySelectorAll('svg');
    const action = icons[2]?.getAttribute('stroke');
    expect(icons[0]?.getAttribute('stroke')).toBe('red');
    expect(icons[0]?.getAttribute('color')).toBe('red');
    await act(async () => input().focus());
    expect(icons[0]?.getAttribute('stroke')).toBe('blue');
    expect(icons[0]?.getAttribute('color')).toBe('blue');
    expect(icons[1]?.getAttribute('stroke')).toBe('green');
    expect(icons[2]?.getAttribute('stroke')).toBe(action);
  });

  for (const theme of ['cosmos', 'nebula']) {
    for (const mode of ['light', 'dark'] as const) {
      for (const variant of ['outlined', 'filled'] as const) {
        it(`${theme} ${mode} ${variant} meets boundary and text contrast`, async () => {
          await render(
            <CosmosThemeProvider theme={theme} mode={mode}>
              <TextField label="Field" variant={variant} placeholder="Hint" />
            </CosmosThemeProvider>
          );
          const colors = getNativeTheme(theme, mode).colors;
          const control = styleOf(input().parentElement as HTMLElement);
          const field = styleOf(input());
          const placeholder = input().getAttribute('data-placeholder-color') as string;
          expect(control.borderColor).toBe(colors['border-strong']);
          expect(contrast(control.borderColor, control.backgroundColor)).toBeGreaterThanOrEqual(3);
          expect(contrast(field.color, control.backgroundColor)).toBeGreaterThanOrEqual(4.5);
          expect(contrast(placeholder, control.backgroundColor)).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
  }
  it('omits false web required and readonly attributes and permits editing', async () => {
    await render(<TextField label="Editable" />);
    expect(input().readOnly).toBe(false);
    expect(input().hasAttribute('aria-readonly')).toBe(false);
    expect(input().hasAttribute('aria-required')).toBe(false);
    await edit('typed');
    expect(input().value).toBe('typed');
  });
  it('names the input and exposes descriptions, required, invalid and read-only independently', async () => {
    await render(
      <TextField
        label="Account"
        labelHidden
        required
        readOnly
        invalid
        helpText="Help"
        error="Error"
      />
    );
    expect(input().getAttribute('aria-label')).toBe('Account');
    expect(input().getAttribute('aria-required')).toBe('true');
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(input().getAttribute('aria-readonly')).toBe('true');
    expect(input().getAttribute('aria-description')).toContain('Help. Error');
    const ids = input().getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(ids.map(id => document.getElementById(id)?.textContent)).toEqual(['Help', 'Error']);
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe('Error');
    expect(container.textContent).not.toContain('Account');
  });
  it('maps types, hints and native length without claiming pattern validation', async () => {
    await render(
      <TextField
        label="Email"
        type="email"
        inputMode="numeric"
        autoComplete="email"
        maxLength={8}
      />
    );
    expect(input().getAttribute('data-keyboard')).toBe('email-address');
    expect(input().getAttribute('data-input-mode')).toBe('numeric');
    expect(input().getAttribute('data-autocomplete')).toBe('email');
    expect(input().maxLength).toBe(8);
    await update(<TextField label="Other" type="tel" />);
    expect(input().getAttribute('data-keyboard')).toBe('phone-pad');
  });
  it('keeps native label consumer supplied and makes descriptions available without inventing states', async () => {
    Platform.OS = 'android';
    await render(<TextField label="Account" required invalid readOnly error="Check account" />);
    expect(input().getAttribute('aria-label')).toBe('Account');
    expect(input().getAttribute('aria-description')).toBe('Check account');
    expect(input().hasAttribute('aria-required')).toBe(false);
    expect(input().hasAttribute('aria-invalid')).toBe(false);
    expect(container.textContent).toContain('Account *');
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe('Check account');
  });
  it('supports independent visual hooks, size floor, decorations and focus', async () => {
    await render(
      <TextField
        label="Search"
        size={20}
        startIcon={search}
        prefix="$"
        suffix="kg"
        appearance={{
          background: 'red',
          text: 'blue',
          placeholder: 'gray',
          border: 'green',
          focus: 'orange',
          radius: 7,
        }}
      />
    );
    const control = input().parentElement as HTMLElement;
    expect(styleOf(control)).toMatchObject({
      minHeight: 44,
      backgroundColor: 'red',
      borderColor: 'green',
      borderRadius: 7,
    });
    expect(styleOf(input()).color).toBe('blue');
    expect(input().getAttribute('data-placeholder-color')).toBe('gray');
    expect(control.querySelector('svg')).not.toBeNull();
    const iconWrapper = control.querySelector('svg')?.parentElement;
    expect(iconWrapper?.getAttribute('aria-hidden')).toBe('true');
    expect(iconWrapper?.getAttribute('data-hidden-ios')).toBe('true');
    expect(iconWrapper?.getAttribute('data-hidden-android')).toBe('no-hide-descendants');
    expect(control.textContent).toContain('$');
    expect(control.textContent).toContain('kg');
    await act(async () => input().focus());
    expect(styleOf(control).borderColor).toBe('orange');
  });
  it('uses the selected theme and follows system mode', async () => {
    __setColorScheme('dark');
    await render(
      <CosmosThemeProvider theme="nebula">
        <TextField label="Themed" variant="filled" size={80} />
      </CosmosThemeProvider>
    );
    expect(styleOf(input().parentElement as HTMLElement)).toMatchObject({
      minHeight: 80,
      backgroundColor: getNativeTheme('nebula', 'dark').colors['surface-raised'],
    });
  });
  it('rejects invalid labels, lengths and unsupported autofill hints', () => {
    const validate = (props: Partial<TextFieldProps>) =>
      renderToStaticMarkup(<TextField label="Field" {...props} />);
    expect(() => validate({ label: ' ' })).toThrow(TypeError);
    expect(() => validate({ clearable: true })).toThrow(TypeError);
    expect(() => validate({ passwordReveal: true })).toThrow(TypeError);
    expect(() => validate({ clearable: true, clearLabel: '  ' })).toThrow(TypeError);
    expect(() => validate({ minLength: -1 })).toThrow(TypeError);
    expect(() => validate({ maxLength: 1.5 })).toThrow(TypeError);
    expect(() => validate({ size: Number.NaN })).toThrow(TypeError);
    expect(() => validate({ autoComplete: 'unsupported-hint' })).toThrow(TypeError);
    Platform.OS = 'android';
    expect(() => validate({ autoComplete: 'url' })).toThrow(TypeError);
    expect(() => validate({ autoComplete: 'email' })).not.toThrow();
    Platform.OS = 'ios';
    expect(() => validate({ autoComplete: 'sms-otp' })).toThrow(TypeError);
    expect(() => validate({ autoComplete: 'url' })).not.toThrow();
  });
  it('uses decorative structured icons and 44pt action targets', async () => {
    await render(
      <TextField
        label="Password"
        type="password"
        defaultValue="secret"
        clearable
        clearLabel="Clear"
        passwordReveal
        revealPasswordLabel="Show"
        hidePasswordLabel="Hide"
      />
    );
    for (const label of ['Clear', 'Show']) {
      const action = button(label) as HTMLButtonElement;
      expect(styleOf(action)).toMatchObject({ minWidth: 44, minHeight: 44 });
      expect(action.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(action.querySelector('svg')?.parentElement?.getAttribute('aria-hidden')).toBe('true');
    }
  });
  it('does not expose actions for read-only fields', async () => {
    await render(
      <TextField
        label="Password"
        type="password"
        value="x"
        readOnly
        clearable
        clearLabel="Clear"
        passwordReveal
        revealPasswordLabel="Show"
        hidePasswordLabel="Hide"
      />
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
  it.each(['type', 'disabled', 'readOnly', 'passwordReveal'] as const)(
    'conceals passwords after changing %s and restoring it',
    async state => {
      const props = {
        label: 'Password',
        value: 'secret',
        passwordReveal: true,
        revealPasswordLabel: 'Show',
        hidePasswordLabel: 'Hide',
      } as const;
      await render(<TextField {...props} type="password" />);
      await act(async () => button('Show')?.click());
      expect(input().type).toBe('text');
      const changed: Partial<TextFieldProps> =
        state === 'type'
          ? { type: 'text' }
          : state === 'passwordReveal'
            ? { passwordReveal: false }
            : { [state]: true };
      await update(<TextField {...props} type="password" {...changed} />);
      if (state !== 'type') expect(input().type).toBe('password');
      await update(<TextField {...props} type="password" />);
      expect(input().type).toBe('password');
      expect(button('Show')).not.toBeNull();
    }
  );
  it('submits the current value without generating changes', async () => {
    const submit = vi.fn();
    const change = vi.fn();
    await render(
      <TextField
        label="Field"
        defaultValue="hello"
        onValueChange={change}
        onSubmitEditing={submit}
      />
    );
    await act(async () =>
      input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    );
    expect(submit).toHaveBeenCalledWith({ value: 'hello' });
    expect(change).not.toHaveBeenCalled();
  });
});
