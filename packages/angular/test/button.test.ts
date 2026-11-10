import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type ButtonPressDetail,
  buttonContract,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmButton } from '@joralvmel/cosmos-elements';
import { afterEach, describe, expect, it } from 'vitest';
import { COSMOS_COMPONENTS, CosmButtonComponent } from '../src/index.js';

@Component({
  imports: [CosmButtonComponent],
  template: `<cosm-button
    [variant]="variant()"
    tone="danger"
    size="lg"
    [disabled]="disabled()"
    loading
    fullWidth
    type="submit"
    label="Delete"
    (press)="presses.push($event.detail)"
    >Delete</cosm-button
  >`,
})
class HostComponent {
  readonly variant = signal<'solid' | 'outline'>('outline');
  readonly disabled = signal(false);
  readonly presses: ButtonPressDetail[] = [];
}

afterEach(() => TestBed.resetTestingModule());

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('cosm-button') as CosmButton;
  await el.updateComplete;
  return { fixture, el };
}

describe('CosmButtonComponent', () => {
  it('forwards inputs as element properties', async () => {
    const { fixture, el } = await setup();
    expect(el.variant).toBe('outline');
    expect(el.tone).toBe('danger');
    expect(el.size).toBe('lg');
    expect(el.loading).toBe(true);
    expect(el.fullWidth).toBe(true);
    expect(el.type).toBe('submit');
    expect(el.label).toBe('Delete');

    fixture.componentInstance.variant.set('solid');
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(el.variant).toBe('solid');
    expect(el.disabled).toBe(true);
  });

  it('re-emits cosm-press as (press) with the original detail', async () => {
    const { fixture, el } = await setup();
    el.loading = false;
    await el.updateComplete;
    el.click();
    expect(fixture.componentInstance.presses).toEqual([{ source: 'programmatic' }]);
  });
});

describe('CosmButtonComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmButtonComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(buttonContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(buttonContract, 'angular'));
  });

  it('is part of COSMOS_COMPONENTS', () => {
    expect(COSMOS_COMPONENTS).toContain(CosmButtonComponent);
  });
});
