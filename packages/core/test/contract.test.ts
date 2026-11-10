import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  buttonContract,
  buttonScenarios,
  buttonScenariosFor,
  type ContractProps,
  contracts,
  defaults,
  eventNames,
  getPressableState,
  propNames,
  supports,
} from '../src/index.js';

describe('contract helpers', () => {
  it('lists props per platform', () => {
    expect(propNames(buttonContract, 'web')).toContain('type');
    expect(propNames(buttonContract, 'native')).not.toContain('type');
  });

  it('maps events to platform names', () => {
    expect(eventNames(buttonContract, 'dom')).toEqual(['cosm-press']);
    expect(eventNames(buttonContract, 'react')).toEqual(['onPress']);
    expect(eventNames(buttonContract, 'angular')).toEqual(['press']);
    expect(eventNames(buttonContract, 'native')).toEqual(['onPress']);
  });

  it('reports supported platforms', () => {
    expect(supports(buttonContract, 'web')).toBe(true);
    const nativeOnly = { ...buttonContract, platforms: ['native'] as const };
    expect(supports(nativeOnly, 'web')).toBe(false);
    expect(supports(nativeOnly, 'native')).toBe(true);
  });

  it('exposes defaults', () => {
    expect(defaults(buttonContract, 'native')).toEqual({
      variant: 'solid',
      tone: 'primary',
      size: 'md',
      disabled: false,
      loading: false,
      fullWidth: false,
    });
  });

  it('derives typed props from the contract', () => {
    type NativeProps = ContractProps<typeof buttonContract, 'native'>;
    expectTypeOf<NativeProps['variant']>().toEqualTypeOf<
      'solid' | 'soft' | 'outline' | 'ghost' | undefined
    >();
    expectTypeOf<NativeProps>().not.toHaveProperty('type');
  });
});

describe('contracts registry', () => {
  it('keeps names, tags and DOM events consistent', () => {
    for (const [key, contract] of Object.entries(contracts)) {
      expect(contract.name).toBe(key);
      expect(contract.tag).toBe(`cosm-${key}`);
      for (const event of Object.values(contract.events)) {
        expect(event.names.dom).toMatch(/^cosm-[a-z-]+$/);
        expect(event.names.react).toMatch(/^on[A-Z]/);
        expect(event.names.native).toMatch(/^on[A-Z]/);
      }
      for (const [name, spec] of Object.entries(contract.props)) {
        if (spec.type === 'enum') expect(spec.values, name).toContain(spec.default);
      }
    }
  });
});

describe('getPressableState', () => {
  it.each([
    [{}, { interactive: true, disabled: false, busy: false }],
    [{ disabled: true }, { interactive: false, disabled: true, busy: false }],
    [{ loading: true }, { interactive: false, disabled: false, busy: true }],
    [
      { disabled: true, loading: true },
      { interactive: false, disabled: true, busy: false },
    ],
  ])('%j', (input, expected) => {
    expect(getPressableState(input)).toEqual(expected);
  });
});

describe('button scenarios', () => {
  it('have unique names and filter by platform', () => {
    const names = buttonScenarios.map(scenario => scenario.name);
    expect(new Set(names).size).toBe(names.length);
    expect(buttonScenariosFor('native').length).toBeLessThan(buttonScenariosFor('web').length);
  });

  it('agree with the headless state', () => {
    for (const scenario of buttonScenarios) {
      const state = getPressableState(scenario.props);
      expect(state.busy, scenario.name).toBe(scenario.expected.busy);
      expect(state.disabled, scenario.name).toBe(scenario.expected.disabled);
      if (!state.interactive) expect(scenario.expected.presses, scenario.name).toBe(0);
    }
  });
});
