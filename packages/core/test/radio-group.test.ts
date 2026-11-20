import { describe, expect, it } from 'vitest';
import {
  getRadioGroupInitialActive,
  moveRadioGroupActive,
  radioGroupScenarioOptions,
  radioGroupScenarios,
  validateRadioGroupOptions,
  validateRadioGroupValue,
} from '../src/index.js';

describe('radio group helpers', () => {
  it('validates required option content and unique values', () => {
    expect(() => validateRadioGroupOptions(radioGroupScenarioOptions)).not.toThrow();
    expect(() =>
      validateRadioGroupOptions([
        { value: 'email', label: 'Email' },
        { value: 'email', label: 'Other' },
      ])
    ).toThrow(/must be unique/);
    expect(() => validateRadioGroupOptions([{ value: ' ', label: 'Blank value' }])).toThrow(
      /non-empty value/
    );
    expect(() => validateRadioGroupOptions([{ value: 'email', label: ' ' }])).toThrow(
      /non-empty label/
    );
  });

  it('chooses the selected enabled option or the first enabled option for entry', () => {
    expect(getRadioGroupInitialActive(radioGroupScenarioOptions, 'phone')).toBe('phone');
    expect(getRadioGroupInitialActive(radioGroupScenarioOptions, 'mail')).toBe('email');
    expect(getRadioGroupInitialActive(radioGroupScenarioOptions, null)).toBe('email');
    expect(
      getRadioGroupInitialActive([{ value: 'mail', label: 'Mail', disabled: true }], null)
    ).toBe(null);
  });

  it('wraps directional navigation and skips disabled options', () => {
    expect(moveRadioGroupActive(radioGroupScenarioOptions, 'email', 1)).toBe('phone');
    expect(moveRadioGroupActive(radioGroupScenarioOptions, 'phone', 1)).toBe('email');
    expect(moveRadioGroupActive(radioGroupScenarioOptions, 'email', -1)).toBe('phone');
    expect(moveRadioGroupActive(radioGroupScenarioOptions, 'unknown', 1)).toBe('email');
  });

  it('accepts null or an existing option value', () => {
    expect(() => validateRadioGroupValue(null, radioGroupScenarioOptions, 'value')).not.toThrow();
    expect(() =>
      validateRadioGroupValue('phone', radioGroupScenarioOptions, 'value')
    ).not.toThrow();
    expect(() => validateRadioGroupValue('', radioGroupScenarioOptions, 'value')).toThrow(
      /match an option/
    );
  });

  it('defines unique shared scenarios for every platform', () => {
    expect(new Set(radioGroupScenarios.map(scenario => scenario.name)).size).toBe(
      radioGroupScenarios.length
    );
    expect(radioGroupScenarios.length).toBeGreaterThan(0);
  });
});
