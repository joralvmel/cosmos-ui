import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  eventNames,
  propNames,
  type TextFieldChangeDetail,
  type TextFieldSubmitDetail,
  textFieldContract,
  textFieldScenariosFor,
} from '@joralvmel/cosmos-core';
import type { CosmTextField } from '@joralvmel/cosmos-elements/text-field';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COSMOS_COMPONENTS, CosmTextFieldComponent } from '../src/index.js';

@Component({
  imports: [CosmTextFieldComponent],
  template: '<cosm-text-field label="Text field"></cosm-text-field>',
})
class HostComponent {}

@Component({
  imports: [ReactiveFormsModule, CosmTextFieldComponent],
  template: '<cosm-text-field label="Text field" [formControl]="control"></cosm-text-field>',
})
class FormHostComponent {
  control = new FormControl('initial', { nonNullable: true });
}

@Component({
  imports: [ReactiveFormsModule, CosmTextFieldComponent],
  template: '<cosm-text-field label="Text field" [formControl]="control"></cosm-text-field>',
})
class BlurFormHostComponent {
  control = new FormControl('initial', { nonNullable: true, updateOn: 'blur' });
}

afterEach(() => TestBed.resetTestingModule());

const innerInput = (el: CosmTextField) =>
  el.shadowRoot?.querySelector<HTMLInputElement>('input') as HTMLInputElement;
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

function componentOf<T>(fixture: ComponentFixture<T>): CosmTextFieldComponent {
  const host = fixture.debugElement.children[0];
  if (!host) throw new Error('Text-field host was not rendered.');
  return host.componentInstance as CosmTextFieldComponent;
}

describe('CosmTextFieldComponent', () => {
  for (const scenario of textFieldScenariosFor('angular')) {
    it(scenario.name, async () => {
      await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const component = componentOf(fixture);
      const el = component.element;
      Object.assign(el, {
        ...scenario.props,
        ...(scenario.props.clearable ? { clearLabel: 'Clear' } : {}),
        ...(scenario.props.passwordReveal
          ? { revealPasswordLabel: 'Show password', hidePasswordLabel: 'Hide password' }
          : {}),
      });
      el.valueControlled = scenario.props.value !== undefined;
      await el.updateComplete;
      const changes: string[] = [];
      const submits: string[] = [];
      el.addEventListener('cosm-change', event => {
        changes.push((event as CustomEvent<TextFieldChangeDetail>).detail.value);
      });
      el.addEventListener('cosm-submit', event => {
        submits.push((event as CustomEvent<TextFieldSubmitDetail>).detail.value);
      });

      for (const action of scenario.actions) {
        if (action.type === 'edit') {
          const field = innerInput(el);
          field.value = action.value;
          if (action.selectionStart !== undefined)
            field.setSelectionRange(action.selectionStart, action.selectionStart);
          if (action.composing)
            field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
          field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          if (action.composing)
            field.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
        } else if (action.type === 'sync') {
          el.value = action.value;
        } else if (action.type === 'clear') {
          el.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]')?.click();
        } else if (action.type === 'reveal' || action.type === 'hide') {
          el.shadowRoot?.querySelector<HTMLButtonElement>('[part="reveal-button"]')?.click();
        } else if (action.type === 'submit') {
          innerInput(el).dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
          );
        } else if (action.type === 'reset') {
          el.formResetCallback();
        }
        await el.updateComplete;
        await Promise.resolve();
      }

      if (scenario.props.value !== undefined) await nextFrame();
      expect(el.value).toBe(scenario.expected.value);
      expect(innerInput(el).value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      expect(el.disabled).toBe(scenario.expected.disabled);
      if (scenario.expected.submits) expect(submits).toEqual(scenario.expected.submits);
      if (scenario.expected.selectionStart !== undefined)
        expect(innerInput(el).selectionStart).toBe(scenario.expected.selectionStart);
      if (scenario.expected.passwordVisible !== undefined)
        expect(innerInput(el).type).toBe(scenario.expected.passwordVisible ? 'text' : 'password');
    });
  }

  it('forwards all inputs and joins COSMOS_COMPONENTS', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    component.label = 'Account';
    component.disabled = true;
    await component.element.updateComplete;
    expect(component.element.label).toBe('Account');
    expect(component.element.disabled).toBe(true);
    expect(COSMOS_COMPONENTS).toContain(CosmTextFieldComponent);
  });

  it('re-emits the original CustomEvents from the underlying element', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const change = vi.fn();
    const submit = vi.fn();
    component.valueChange.subscribe(change);
    component.submit.subscribe(submit);
    const changeEvent = new CustomEvent<TextFieldChangeDetail>('cosm-change', {
      detail: { value: 'next' },
      bubbles: true,
      composed: true,
    });
    const submitEvent = new CustomEvent<TextFieldSubmitDetail>('cosm-submit', {
      detail: { value: 'next' },
      bubbles: true,
      composed: true,
    });
    component.element.dispatchEvent(changeEvent);
    component.element.dispatchEvent(submitEvent);
    expect(change.mock.calls[0]?.[0]).toBe(changeEvent);
    expect(submit.mock.calls[0]?.[0]).toBe(submitEvent);
  });
});

describe('CosmTextFieldComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmTextFieldComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(textFieldContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(textFieldContract, 'angular'));
  });
});

describe('CosmTextFieldComponent: ControlValueAccessor', () => {
  it('supports programmatic writes, touched, disabled and reset without emitting a proposal', async () => {
    await TestBed.configureTestingModule({ imports: [FormHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FormHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const emitted = vi.fn();
    component.valueChange.subscribe(emitted);
    expect(component.element.value).toBe('initial');

    fixture.componentInstance.control.setValue('programmatic');
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(component.element.value).toBe('programmatic');
    expect(emitted).not.toHaveBeenCalled();

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.element.disabled).toBe(true);
    fixture.componentInstance.control.enable();
    fixture.componentInstance.control.reset('restored');
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(component.element.disabled).toBe(false);
    expect(component.element.value).toBe('restored');
    expect(emitted).not.toHaveBeenCalled();
  });

  it('defers updateOn blur values until focusout and marks the control touched', async () => {
    await TestBed.configureTestingModule({ imports: [BlurFormHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(BlurFormHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = componentOf(fixture);
    const field = innerInput(component.element);
    field.value = 'draft';
    field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('initial');
    field.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    await component.element.updateComplete;
    expect(fixture.componentInstance.control.value).toBe('draft');
    expect(fixture.componentInstance.control.touched).toBe(true);
  });
});
