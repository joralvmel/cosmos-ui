import { describe, expect, it } from 'vitest';
import {
  eventNames,
  propNames,
  switchContract,
  switchScenarios,
  switchScenariosFor,
} from '../src/index.js';

describe('Switch contract', () => {
  it('defines checked ownership and the platform event mapping', () => {
    expect(switchContract.states).toEqual([
      { prop: 'checked', event: 'checkedChange', defaultProp: 'defaultChecked' },
    ]);
    expect(switchContract.events.checkedChange?.detail).toBe('SwitchCheckedChangeDetail');
    expect(eventNames(switchContract, 'dom')).toEqual(['cosm-checked-change']);
    expect(eventNames(switchContract, 'react')).toEqual(['onCheckedChange']);
    expect(eventNames(switchContract, 'angular')).toEqual(['checkedChange']);
    expect(eventNames(switchContract, 'native')).toEqual(['onCheckedChange']);
  });

  it('keeps form properties and visual sizing off native', () => {
    expect(propNames(switchContract, 'web')).toContain('size');
    expect(propNames(switchContract, 'react')).toContain('name');
    expect(propNames(switchContract, 'angular')).toContain('value');
    for (const prop of ['size', 'name', 'value']) {
      expect(propNames(switchContract, 'native')).not.toContain(prop);
    }
  });

  it('covers initial, autonomous, disabled, refused and accepted proposals', () => {
    expect(switchScenarios).toHaveLength(6);
    expect(switchScenariosFor('web')).toHaveLength(switchScenarios.length);
    expect(switchScenariosFor('react')).toHaveLength(switchScenarios.length);
    expect(switchScenariosFor('angular')).toHaveLength(switchScenarios.length);
    expect(switchScenariosFor('native')).toHaveLength(switchScenarios.length);
    const controlledFalse = switchScenarios.find(scenario =>
      scenario.name.includes('controlled false')
    );
    expect(controlledFalse?.props.checked).toBe(false);
    expect(controlledFalse?.expected).toEqual({ checked: false, changes: [true, true] });
  });
});
