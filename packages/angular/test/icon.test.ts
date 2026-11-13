import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { eventNames, iconContract, propNames } from '@joralvmel/cosmos-core';
import type { CosmIcon } from '@joralvmel/cosmos-elements/icon';
import { house } from '@joralvmel/cosmos-icons/house';
import { afterEach, describe, expect, it } from 'vitest';
import { COSMOS_COMPONENTS, CosmIconComponent } from '../src/index.js';

@Component({
  imports: [CosmIconComponent],
  template:
    '<cosm-icon [icon]="definition" [size]="32" stroke="red" fill="blue" [strokeWidth]="0" [decorative]="false" label="Home"></cosm-icon>',
})
class HostComponent {
  readonly definition = house;
}

afterEach(() => TestBed.resetTestingModule());

describe('CosmIconComponent', () => {
  it('forwards the definition, enum, label, and false boolean input', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('cosm-icon') as CosmIcon;
    await el.updateComplete;
    expect(el.icon).toBe(house);
    expect(el.size).toBe(32);
    expect(el.stroke).toBe('red');
    expect(el.fill).toBe('blue');
    expect(el.strokeWidth).toBe(0);
    expect(el.decorative).toBe(false);
    expect(el.label).toBe('Home');
    expect(el.shadowRoot?.querySelector('svg')?.getAttribute('aria-label')).toBe('Home');
  });

  it('is part of COSMOS_COMPONENTS', () => {
    expect(COSMOS_COMPONENTS).toContain(CosmIconComponent);
  });
});

describe('CosmIconComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmIconComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(iconContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(iconContract, 'angular'));
  });
});
