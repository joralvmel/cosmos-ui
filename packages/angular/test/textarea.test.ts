import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  eventNames,
  propNames,
  type TextareaChangeDetail,
  textareaContract,
  textareaScenariosFor,
} from '@joralvmel/cosmos-core';
import type { CosmTextarea } from '@joralvmel/cosmos-elements/textarea';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COSMOS_COMPONENTS, CosmTextareaComponent } from '../src/index.js';

@Component({
  imports: [CosmTextareaComponent],
  template: '<cosm-textarea label="Message"></cosm-textarea>',
})
class HostComponent {}

@Component({
  imports: [ReactiveFormsModule, CosmTextareaComponent],
  template: '<cosm-textarea label="Message" [formControl]="control"></cosm-textarea>',
})
class FormHostComponent {
  control = new FormControl('initial', { nonNullable: true });
}

@Component({
  imports: [ReactiveFormsModule, CosmTextareaComponent],
  template: '<cosm-textarea label="Message" [formControl]="control"></cosm-textarea>',
})
class BlurFormHostComponent {
  control = new FormControl('initial', { nonNullable: true, updateOn: 'blur' });
}

afterEach(() => TestBed.resetTestingModule());

const editor = (el: CosmTextarea) =>
  el.shadowRoot?.querySelector<HTMLTextAreaElement>('textarea') as HTMLTextAreaElement;

function componentOf<T>(fixture: ComponentFixture<T>): CosmTextareaComponent {
  const host = fixture.debugElement.children[0];
  if (!host) throw new Error('Textarea host was not rendered.');
  return host.componentInstance as CosmTextareaComponent;
}

describe('CosmTextareaComponent', () => {
  for (const scenario of textareaScenariosFor('angular')) {
    it(scenario.name, async () => {
      await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const el = componentOf(fixture).element;
      Object.assign(el, scenario.props);
      el.valueControlled = scenario.props.value !== undefined;
      await el.updateComplete;
      const changes: string[] = [];
      el.addEventListener('cosm-change', event => {
        changes.push((event as CustomEvent<TextareaChangeDetail>).detail.value);
      });

      for (const action of scenario.actions) {
        if (action.type === 'edit') {
          editor(el).value = action.value;
          editor(el).dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        } else if (action.type === 'sync') {
          el.value = action.value;
        } else if (action.type === 'reset') {
          el.formResetCallback();
        }
        await el.updateComplete;
      }

      if (el.valueControlled) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }
      expect(el.value).toBe(scenario.expected.value);
      expect(editor(el).value).toBe(scenario.expected.value);
      expect(changes).toEqual(scenario.expected.changes);
      expect(el.disabled).toBe(scenario.expected.disabled);
    });
  }

  it('forwards every input, emits the original change CustomEvent and joins COSMOS_COMPONENTS', async () => {
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
    expect(COSMOS_COMPONENTS).toContain(CosmTextareaComponent);

    const output = vi.fn();
    component.valueChange.subscribe(output);
    const change = new CustomEvent<TextareaChangeDetail>('cosm-change', {
      detail: { value: 'next' },
      bubbles: true,
      composed: true,
    });
    component.element.dispatchEvent(change);
    expect(output.mock.calls[0]?.[0]).toBe(change);
  });
});

describe('CosmTextareaComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmTextareaComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(textareaContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(textareaContract, 'angular'));
  });
});

describe('CosmTextareaComponent: ControlValueAccessor', () => {
  it('supports programmatic writes, disabled and reset without emitting a proposal', async () => {
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
    const field = editor(component.element);
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
