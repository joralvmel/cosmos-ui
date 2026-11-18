import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  eventNames,
  propNames,
  type SwitchCheckedChangeDetail,
  switchContract,
  switchScenariosFor,
} from '@joralvmel/cosmos-core';
import type { CosmSwitch } from '@joralvmel/cosmos-elements/switch';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COSMOS_COMPONENTS, CosmSwitchComponent } from '../src/index.js';

@Component({
  imports: [CosmSwitchComponent],
  template: '<cosm-switch label="Enable notifications"></cosm-switch>',
})
class HostComponent {}

@Component({
  imports: [ReactiveFormsModule, CosmSwitchComponent],
  template: '<cosm-switch label="Enable notifications" [formControl]="control"></cosm-switch>',
})
class FormHostComponent {
  control = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });
}

@Component({
  imports: [CosmSwitchComponent],
  template:
    '<cosm-switch label="Enable notifications" [checked]="checked()" (checkedChange)="handleChange($event)"></cosm-switch>',
})
class ControlledHostComponent {
  checked = signal(false);
  changes: boolean[] = [];

  handleChange(event: CustomEvent<SwitchCheckedChangeDetail>) {
    this.changes.push(event.detail.checked);
  }
}

@Component({
  imports: [CosmSwitchComponent],
  template:
    '<cosm-switch label="Enable notifications" [checked]="checked()" [defaultChecked]="defaultChecked()" [disabled]="disabled()" [invalid]="invalid()" (checkedChange)="handleChange($event)"></cosm-switch>',
})
class ScenarioHostComponent {
  checked = signal<boolean | undefined>(undefined);
  defaultChecked = signal(false);
  disabled = signal(false);
  invalid = signal(false);
  changes: boolean[] = [];

  handleChange(event: CustomEvent<SwitchCheckedChangeDetail>) {
    this.changes.push(event.detail.checked);
  }
}

afterEach(() => TestBed.resetTestingModule());

const innerInput = (element: CosmSwitch) =>
  element.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;

function componentOf<T>(fixture: ComponentFixture<T>): CosmSwitchComponent {
  const host = fixture.debugElement.children[0];
  if (!host) throw new Error('Switch host was not rendered.');
  return host.componentInstance as CosmSwitchComponent;
}

describe('CosmSwitchComponent', () => {
  it('forwards contract inputs and joins COSMOS_COMPONENTS', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    component.hideLabel = true;
    component.disabled = true;
    component.invalid = true;
    component.helpText = 'You can change this preference at any time.';
    await component.element.updateComplete;
    expect(component.element.hideLabel).toBe(true);
    expect(component.element.disabled).toBe(true);
    expect(innerInput(component.element).getAttribute('aria-invalid')).toBe('true');
    expect(component.element.helpText).toBe('You can change this preference at any time.');
    expect(COSMOS_COMPONENTS).toContain(CosmSwitchComponent);
  });

  it('re-emits the original CustomEvent', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const checkedChange = vi.fn();
    component.checkedChange.subscribe(checkedChange);
    const event = new CustomEvent<SwitchCheckedChangeDetail>('cosm-checked-change', {
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

describe('CosmSwitchComponent: shared scenarios', () => {
  for (const scenario of switchScenariosFor('angular')) {
    it(scenario.name, async () => {
      await TestBed.configureTestingModule({
        imports: [ScenarioHostComponent],
      }).compileComponents();
      const fixture = TestBed.createComponent(ScenarioHostComponent);
      fixture.componentInstance.checked.set(scenario.props.checked);
      fixture.componentInstance.defaultChecked.set(scenario.props.defaultChecked ?? false);
      fixture.componentInstance.disabled.set(scenario.props.disabled ?? false);
      fixture.componentInstance.invalid.set(scenario.props.invalid ?? false);
      fixture.detectChanges();
      await fixture.whenStable();
      const element = fixture.nativeElement.querySelector('cosm-switch') as CosmSwitch;
      await element.updateComplete;

      for (const action of scenario.actions) {
        if (action.type === 'activate') innerInput(element).click();
        else fixture.componentInstance.checked.set(action.checked);
        fixture.detectChanges();
        await fixture.whenStable();
        await element.updateComplete;
      }

      expect(element.checked).toBe(scenario.expected.checked);
      expect(innerInput(element).checked).toBe(scenario.expected.checked);
      expect(fixture.componentInstance.changes).toEqual(scenario.expected.changes);
    });
  }
});

describe('CosmSwitchComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmSwitchComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(switchContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(switchContract, 'angular'));
  });
});

describe('CosmSwitchComponent: ControlValueAccessor', () => {
  it('reads and writes boolean form values, touch and disabled state', async () => {
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
    component.element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(control.touched).toBe(true);
  });
});
