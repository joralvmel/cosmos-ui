import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  eventNames,
  propNames,
  type RadioGroupChangeDetail,
  radioGroupContract,
  radioGroupScenarioOptions,
} from '@joralvmel/cosmos-core';
import type { CosmRadioGroup } from '@joralvmel/cosmos-elements/radio-group';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COSMOS_COMPONENTS, CosmRadioGroupComponent } from '../src/index.js';

@Component({
  imports: [CosmRadioGroupComponent],
  template: '<cosm-radio-group label="Contact method" [options]="options"></cosm-radio-group>',
})
class HostComponent {
  options = radioGroupScenarioOptions;
}

@Component({
  imports: [ReactiveFormsModule, CosmRadioGroupComponent],
  template:
    '<cosm-radio-group label="Contact method" [options]="options" [formControl]="control"></cosm-radio-group>',
})
class FormHostComponent {
  options = radioGroupScenarioOptions;
  control = new FormControl<string | null>(null, { validators: Validators.required });
}

@Component({
  imports: [CosmRadioGroupComponent],
  template:
    '<cosm-radio-group label="Contact method" [options]="options" [value]="value()" (valueChange)="handleChange($event)"></cosm-radio-group>',
})
class ControlledHostComponent {
  options = radioGroupScenarioOptions;
  value = signal<string | null>('email');
  changes: CustomEvent<RadioGroupChangeDetail>[] = [];

  handleChange(event: CustomEvent<RadioGroupChangeDetail>) {
    this.changes.push(event);
  }
}

afterEach(() => TestBed.resetTestingModule());

const innerInput = (element: CosmRadioGroup, value: string) =>
  [...(element.shadowRoot?.querySelectorAll<HTMLInputElement>('input') ?? [])].find(
    input => input.value === value
  ) as HTMLInputElement;

function componentOf<T>(fixture: ComponentFixture<T>): CosmRadioGroupComponent {
  const host = fixture.debugElement.children[0];
  if (!host) throw new Error('Radio Group host was not rendered.');
  return host.componentInstance as CosmRadioGroupComponent;
}

describe('CosmRadioGroupComponent', () => {
  it('forwards contract inputs and joins COSMOS_COMPONENTS', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    component.orientation = 'horizontal';
    component.required = true;
    await component.element.updateComplete;
    expect(component.element.orientation).toBe('horizontal');
    expect(component.element.required).toBe(true);
    expect(component.element.options).toEqual(radioGroupScenarioOptions);
    expect(COSMOS_COMPONENTS).toContain(CosmRadioGroupComponent);
  });

  it('re-emits the original CustomEvent', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const valueChange = vi.fn();
    component.valueChange.subscribe(valueChange);
    const event = new CustomEvent<RadioGroupChangeDetail>('cosm-change', {
      detail: { value: 'email' },
      bubbles: true,
      composed: true,
    });
    component.element.dispatchEvent(event);
    expect(valueChange.mock.calls[0]?.[0]).toBe(event);
  });

  it('keeps controlled values with the owner and forwards proposals', async () => {
    await TestBed.configureTestingModule({
      imports: [ControlledHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ControlledHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    innerInput(component.element, 'phone').click();
    expect(fixture.componentInstance.changes.map(event => event.detail.value)).toEqual(['phone']);
    expect(component.element.value).toBe('email');
    fixture.componentInstance.value.set('phone');
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(innerInput(component.element, 'phone').checked).toBe(true);
  });
});

describe('CosmRadioGroupComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (
      CosmRadioGroupComponent as unknown as { ɵcmp: { inputs: object; outputs: object } }
    ).ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(radioGroupContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(radioGroupContract, 'angular'));
  });
});

describe('CosmRadioGroupComponent: ControlValueAccessor', () => {
  it('reads and writes nullable values, validation, touch and disabled state', async () => {
    await TestBed.configureTestingModule({ imports: [FormHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const control = fixture.componentInstance.control;
    expect(control.invalid).toBe(true);
    expect(component.element.value).toBeNull();

    innerInput(component.element, 'phone').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.value).toBe('phone');
    expect(control.valid).toBe(true);

    control.setValue(null);
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(innerInput(component.element, 'phone').checked).toBe(false);

    control.disable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.element.disabled).toBe(true);
    control.enable();
    control.markAsUntouched();
    innerInput(component.element, 'email').dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, composed: true })
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.touched).toBe(true);
  });
});
