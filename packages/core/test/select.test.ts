import { describe, expect, it } from 'vitest';
import {
  getListboxOptions,
  selectScenarioItems,
  selectScenarios,
  validateSelectValue,
} from '../src/index.js';

describe('select helpers', () => {
  it('accepts null or an existing option value', () => {
    const options = getListboxOptions(selectScenarioItems);
    expect(() => validateSelectValue(null, options, 'value')).not.toThrow();
    expect(() => validateSelectValue('cherry', options, 'value')).not.toThrow();
    expect(() => validateSelectValue('missing', options, 'value')).toThrow(/must be null or match/);
    expect(() => validateSelectValue('', options, 'defaultValue')).toThrow(/must be null or match/);
  });

  it('defines unique shared scenarios for every platform', () => {
    expect(new Set(selectScenarios.map(scenario => scenario.name)).size).toBe(
      selectScenarios.length
    );
    expect(selectScenarios.length).toBeGreaterThan(0);
  });
});
