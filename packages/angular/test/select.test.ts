import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  eventNames,
  propNames,
  type SelectChangeDetail,
  selectContract,
  selectScenarioItems,
} from '@joralvmel/cosmos-core';
import type { CosmSelect } from '@joralvmel/cosmos-elements/select';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COSMOS_COMPONENTS, CosmSelectComponent } from '../src/index.js';

@Component({
  imports: [CosmSelectComponent],
  template:
    '<cosm-select label="Fruit" [items]="items" placeholder="Choose a fruit"></cosm-select>',
})
class HostComponent {
  items = selectScenarioItems;
}

@Component({
  imports: [ReactiveFormsModule, CosmSelectComponent],
  template:
    '<cosm-select label="Fruit" [items]="items" placeholder="Choose a fruit" [formControl]="control"></cosm-select>',
})
class FormHostComponent {
  items = selectScenarioItems;
  control = new FormControl<string | null>(null, { validators: Validators.required });
}

@Component({
  imports: [CosmSelectComponent],
  template:
    '<cosm-select label="Fruit" [items]="items" placeholder="Choose a fruit" [value]="value()" (valueChange)="handleChange($event)"></cosm-select>',
})
class ControlledHostComponent {
  items = selectScenarioItems;
  value = signal<string | null>('apple');
  changes: CustomEvent<SelectChangeDetail>[] = [];

  handleChange(event: CustomEvent<SelectChangeDetail>) {
    this.changes.push(event);
  }
}

afterEach(() => TestBed.resetTestingModule());

const optionOf = (element: CosmSelect, value: string) =>
  [...(element.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])].find(
    option => option.dataset.value === value
  );

function componentOf<T>(fixture: ComponentFixture<T>): CosmSelectComponent {
  const host = fixture.debugElement.children[0];
  if (!host) throw new Error('Select host was not rendered.');
  return host.componentInstance as CosmSelectComponent;
}

describe('CosmSelectComponent', () => {
  it('forwards contract inputs and joins COSMOS_COMPONENTS', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    component.size = 'lg';
    component.required = true;
    await component.element.updateComplete;
    expect(component.element.size).toBe('lg');
    expect(component.element.required).toBe(true);
    expect(component.element.items).toEqual(selectScenarioItems);
    expect(COSMOS_COMPONENTS).toContain(CosmSelectComponent);
  });

  it('re-emits the original CustomEvent', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const valueChange = vi.fn();
    component.valueChange.subscribe(valueChange);
    const event = new CustomEvent<SelectChangeDetail>('cosm-change', {
      detail: { value: 'apple' },
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
    optionOf(component.element, 'cherry')?.click();
    expect(fixture.componentInstance.changes.map(event => event.detail.value)).toEqual(['cherry']);
    expect(component.element.value).toBe('apple');
    fixture.componentInstance.value.set('cherry');
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(optionOf(component.element, 'cherry')?.getAttribute('aria-selected')).toBe('true');
  });
});

describe('CosmSelectComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmSelectComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(selectContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(selectContract, 'angular'));
  });
});

describe('CosmSelectComponent: ControlValueAccessor', () => {
  it('reads and writes nullable values, validation, touch and disabled state', async () => {
    await TestBed.configureTestingModule({ imports: [FormHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const control = fixture.componentInstance.control;
    expect(control.invalid).toBe(true);
    expect(component.element.value).toBeNull();

    optionOf(component.element, 'cherry')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.value).toBe('cherry');
    expect(control.valid).toBe(true);

    control.setValue(null);
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(component.element.value).toBeNull();

    control.disable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.element.disabled).toBe(true);
    control.enable();
    control.markAsUntouched();
    component.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.touched).toBe(true);
  });
});
