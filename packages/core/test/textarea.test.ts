import { describe, expect, it } from 'vitest';
import {
  defaults,
  eventNames,
  propNames,
  textareaContract,
  textareaScenarios,
  textareaScenariosFor,
} from '../src/index.js';

describe('textarea contract', () => {
  it('requires an accessible label and declares value ownership', () => {
    expect(textareaContract.props.label.required).toBe(true);
    expect(textareaContract.states).toEqual([
      { prop: 'value', event: 'change', defaultProp: 'defaultValue' },
    ]);
  });

  it('keeps visual size independent from the number of visible rows', () => {
    expect(textareaContract.props.rows).toMatchObject({ type: 'number', default: 4 });
    expect(textareaContract.props.size).toMatchObject({
      type: 'enum',
      default: 'md',
      values: ['sm', 'md', 'lg'],
    });
  });

  it('maps value proposals and exposes web-only form names', () => {
    expect(eventNames(textareaContract, 'dom')).toEqual(['cosm-change']);
    expect(eventNames(textareaContract, 'react')).toEqual(['onChange']);
    expect(eventNames(textareaContract, 'angular')).toEqual(['valueChange']);
    expect(eventNames(textareaContract, 'native')).toEqual(['onValueChange']);
    expect(propNames(textareaContract, 'native')).not.toContain('name');
    expect(propNames(textareaContract, 'web')).toContain('name');
  });

  it('declares ownership defaults consistently on all platforms', () => {
    expect(defaults(textareaContract, 'native')).toMatchObject({
      defaultValue: '',
      rows: 4,
      variant: 'outlined',
      size: 'md',
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    });
  });
});

describe('textarea shared scenarios', () => {
  it('have unique names and cover accepted and refused controlled updates', () => {
    const names = textareaScenarios.map(scenario => scenario.name);
    expect(new Set(names).size).toBe(names.length);

    const accepted = textareaScenarios.find(scenario =>
      scenario.name.startsWith('controlled edits wait')
    );
    expect(accepted?.actions).toEqual([
      { type: 'edit', value: 'after' },
      { type: 'sync', value: 'after' },
    ]);

    const ignored = textareaScenarios.find(scenario =>
      scenario.name.startsWith('an ignored controlled edit')
    );
    expect(ignored?.props).toHaveProperty('value', 'stable');
    expect(ignored?.expected).toMatchObject({ value: 'stable', changes: ['unaccepted'] });
  });

  it('preserves newlines and keeps reset scenarios on web wrappers only', () => {
    expect(textareaScenarios.some(scenario => scenario.expected.value.includes('\n'))).toBe(true);
    expect(
      textareaScenariosFor('web').some(scenario =>
        scenario.actions.some(action => action.type === 'reset')
      )
    ).toBe(true);
    expect(
      textareaScenariosFor('native').some(scenario =>
        scenario.actions.some(action => action.type === 'reset')
      )
    ).toBe(false);
  });
});
