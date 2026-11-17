import { describe, expect, it } from 'vitest';
import {
  defaults,
  eventNames,
  getTextFieldState,
  propNames,
  textFieldContract,
  textFieldScenarios,
  textFieldScenariosFor,
} from '../src/index.js';

describe('text-field contract', () => {
  it('requires an accessible label and declares value ownership and the input type scope', () => {
    expect(textFieldContract.props.label.required).toBe(true);
    expect(textFieldContract.states).toEqual([
      { prop: 'value', event: 'change', defaultProp: 'defaultValue' },
    ]);
    expect(textFieldContract.props.type).toMatchObject({
      type: 'enum',
      default: 'text',
      values: ['text', 'email', 'password', 'tel', 'url', 'search'],
    });
    expect(textFieldContract.props.size).toMatchObject({
      type: 'union',
      default: 'md',
      variants: [{ type: 'enum', values: ['sm', 'md', 'lg'] }, { type: 'number' }],
    });
  });

  it('maps proposals and submit requests to each platform', () => {
    expect(eventNames(textFieldContract, 'dom')).toEqual(['cosm-change', 'cosm-submit']);
    expect(eventNames(textFieldContract, 'react')).toEqual(['onChange', 'onSubmit']);
    expect(eventNames(textFieldContract, 'angular')).toEqual(['valueChange', 'submit']);
    expect(eventNames(textFieldContract, 'native')).toEqual(['onValueChange', 'onSubmitEditing']);
  });

  it('limits HTML-only props to web wrappers and exposes defaults', () => {
    expect(propNames(textFieldContract, 'native')).not.toContain('pattern');
    expect(propNames(textFieldContract, 'native')).not.toContain('name');
    expect(propNames(textFieldContract, 'web')).toContain('pattern');
    expect(propNames(textFieldContract, 'web')).toContain('name');
    expect(defaults(textFieldContract, 'native')).toMatchObject({
      defaultValue: '',
      type: 'text',
      variant: 'outlined',
      size: 'md',
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
      clearable: false,
      passwordReveal: false,
    });
  });
});

describe('getTextFieldState', () => {
  it('keeps disabled and read-only distinct while suppressing edit actions for both', () => {
    expect(getTextFieldState({ value: 'draft', disabled: true, clearable: true })).toEqual({
      editable: false,
      disabled: true,
      invalid: false,
      showClearAction: false,
      showPasswordReveal: false,
    });
    expect(getTextFieldState({ value: 'draft', readOnly: true, clearable: true })).toEqual({
      editable: false,
      disabled: false,
      invalid: false,
      showClearAction: false,
      showPasswordReveal: false,
    });
  });

  it('shows clear only for non-empty editable values and reveal only for opted-in passwords', () => {
    expect(getTextFieldState({ value: 'draft', clearable: true }).showClearAction).toBe(true);
    expect(getTextFieldState({ value: '', clearable: true }).showClearAction).toBe(false);
    expect(getTextFieldState({ type: 'password', passwordReveal: true }).showPasswordReveal).toBe(
      true
    );
    expect(getTextFieldState({ type: 'email', passwordReveal: true }).showPasswordReveal).toBe(
      false
    );
  });

  it('treats external invalid state and error text as invalid', () => {
    expect(getTextFieldState({ error: 'Required' }).invalid).toBe(true);
    expect(getTextFieldState({ invalid: true }).invalid).toBe(true);
    expect(getTextFieldState({ error: '' }).invalid).toBe(false);
  });
});

describe('text-field shared scenarios', () => {
  it('have unique names and cover accepted and refused controlled updates', () => {
    const names = textFieldScenarios.map(scenario => scenario.name);
    expect(new Set(names).size).toBe(names.length);

    const accepted = textFieldScenarios.find(scenario =>
      scenario.name.startsWith('controlled edits wait')
    );
    expect(accepted?.actions).toEqual([
      { type: 'edit', value: 'after' },
      { type: 'sync', value: 'after' },
    ]);
    const refused = textFieldScenarios.find(scenario =>
      scenario.name.startsWith('an empty controlled value')
    );
    expect(refused?.props).toHaveProperty('value', '');
    expect(refused?.expected).toMatchObject({ value: '', changes: ['draft'] });
  });

  it('covers clear, password presentation, and platform-specific form reset behavior', () => {
    expect(
      textFieldScenarios.some(scenario => scenario.actions.some(a => a.type === 'clear'))
    ).toBe(true);
    expect(
      textFieldScenarios.some(scenario =>
        scenario.actions.some(action => action.type === 'reveal' || action.type === 'hide')
      )
    ).toBe(true);
    expect(
      textFieldScenariosFor('web').some(scenario => scenario.actions[0]?.type === 'reset')
    ).toBe(true);
    expect(
      textFieldScenariosFor('native').some(scenario =>
        scenario.actions.some(action => action.type === 'reset')
      )
    ).toBe(false);
  });
});
