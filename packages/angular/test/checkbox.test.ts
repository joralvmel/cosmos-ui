import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  type CheckboxCheckedChangeDetail,
  checkboxContract,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmCheckbox } from '@joralvmel/cosmos-elements/checkbox';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COSMOS_COMPONENTS, CosmCheckboxComponent } from '../src/index.js';

@Component({
  imports: [CosmCheckboxComponent],
  template: '<cosm-checkbox label="Accept terms"></cosm-checkbox>',
})
class HostComponent {}

@Component({
  imports: [ReactiveFormsModule, CosmCheckboxComponent],
  template: '<cosm-checkbox label="Accept terms" [formControl]="control"></cosm-checkbox>',
})
class FormHostComponent {
  control = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });
}

@Component({
  imports: [CosmCheckboxComponent],
  template:
    '<cosm-checkbox label="Accept terms" [checked]="checked()" (checkedChange)="handleChange($event)"></cosm-checkbox>',
})
class ControlledHostComponent {
  checked = signal(false);
  changes: boolean[] = [];

  handleChange(event: CustomEvent<CheckboxCheckedChangeDetail>) {
    this.changes.push(event.detail.checked);
  }
}

afterEach(() => TestBed.resetTestingModule());

const innerInput = (element: CosmCheckbox) =>
  element.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;

function componentOf<T>(fixture: ComponentFixture<T>): CosmCheckboxComponent {
  const host = fixture.debugElement.children[0];
  if (!host) throw new Error('Checkbox host was not rendered.');
  return host.componentInstance as CosmCheckboxComponent;
}

describe('CosmCheckboxComponent', () => {
  it('forwards contract inputs and joins COSMOS_COMPONENTS', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    component.hideLabel = true;
    component.disabled = true;
    await component.element.updateComplete;
    expect(component.element.hideLabel).toBe(true);
    expect(component.element.disabled).toBe(true);
    expect(COSMOS_COMPONENTS).toContain(CosmCheckboxComponent);
  });

  it('re-emits the original CustomEvent', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const checkedChange = vi.fn();
    component.checkedChange.subscribe(checkedChange);
    const event = new CustomEvent<CheckboxCheckedChangeDetail>('cosm-checked-change', {
      detail: { checked: true },
      bubbles: true,
      composed: true,
    });
    component.element.dispatchEvent(event);
    expect(checkedChange.mock.calls[0]?.[0]).toBe(event);
  });

  it('keeps controlled state with the owner and forwards proposals', async () => {
    await TestBed.configureTestingModule({
      imports: [ControlledHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ControlledHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    innerInput(component.element).click();
    expect(fixture.componentInstance.changes).toEqual([true]);
    expect(component.element.checked).toBe(false);
    fixture.componentInstance.checked.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(innerInput(component.element).checked).toBe(true);
  });
});

describe('CosmCheckboxComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmCheckboxComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(checkboxContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(checkboxContract, 'angular'));
  });
});

describe('CosmCheckboxComponent: ControlValueAccessor', () => {
  it('reads and writes boolean form values, validation, touch and disabled state', async () => {
    await TestBed.configureTestingModule({ imports: [FormHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const control = fixture.componentInstance.control;
    expect(control.invalid).toBe(true);
    expect(component.element.checked).toBe(false);

    innerInput(component.element).click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.value).toBe(true);
    expect(control.valid).toBe(true);

    control.setValue(false);
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(innerInput(component.element).checked).toBe(false);

    control.disable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.element.disabled).toBe(true);
    control.enable();
    control.markAsUntouched();
    innerInput(component.element).dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, composed: true })
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.touched).toBe(true);
  });
});
