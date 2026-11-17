import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import {
  eventNames,
  type ListboxItem,
  type ListboxScenario,
  type ListboxSelectionChangeDetail,
  listboxContract,
  listboxScenarioItems,
  listboxScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmListbox } from '@joralvmel/cosmos-elements/listbox';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { afterEach, describe, expect, it } from 'vitest';
import { COSMOS_COMPONENTS, CosmListboxComponent } from '../src/index.js';

const typedScenarioItems: readonly ListboxItem<IconDefinition>[] = listboxScenarioItems.map(item =>
  'options' in item
    ? {
        label: item.label,
        options: item.options.map(({ icon: _icon, ...option }) => option),
      }
    : (({ icon: _icon, ...option }) => option)(item)
);

@Component({
  imports: [CosmListboxComponent],
  template: '<cosm-listbox label="Choose fruit" [items]="items"></cosm-listbox>',
})
class HostComponent {
  readonly items = typedScenarioItems;
}

@Component({
  imports: [CosmListboxComponent],
  template:
    '<cosm-listbox label="Choose fruit" [items]="items" [selectedValues]="selectedValues" (selectionChange)="onSelectionChange($event)"></cosm-listbox>',
})
class ControlledHostComponent {
  readonly items = typedScenarioItems;
  selectedValues: readonly string[] = [];
  lastEvent: CustomEvent<ListboxSelectionChangeDetail> | undefined;

  onSelectionChange(event: CustomEvent<ListboxSelectionChangeDetail>): void {
    this.lastEvent = event;
  }
}

afterEach(() => TestBed.resetTestingModule());

function componentOf<T>(fixture: ComponentFixture<T>): CosmListboxComponent {
  const host = fixture.debugElement.children[0];
  if (!host) throw new Error('Listbox host was not rendered.');
  return host.componentInstance as CosmListboxComponent;
}

function typedProps(props: ListboxScenario['props']) {
  const { items: _items, ...otherProps } = props;
  return { ...otherProps, items: typedScenarioItems };
}

const options = (element: CosmListbox) => [
  ...(element.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]') ?? []),
];

const key = (element: CosmListbox, pressed: string) => {
  const active = options(element).find(option => option.dataset.active === 'true');
  active?.dispatchEvent(new KeyboardEvent('keydown', { key: pressed, bubbles: true }));
};

describe('CosmListboxComponent: shared scenarios', () => {
  for (const scenario of listboxScenariosFor('angular')) {
    it(scenario.name, async () => {
      await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const component = componentOf(fixture);
      const element = component.element;
      Object.assign(element, typedProps(scenario.props));
      element.selectedValuesControlled = scenario.props.selectedValues !== undefined;
      await fixture.whenStable();
      await element.updateComplete;
      if (
        scenario.actions.some(
          action =>
            action.type === 'key' || (action.type === 'activate' && action.source === 'keyboard')
        )
      ) {
        element.focus();
      }
      const changes: string[][] = [];
      component.selectionChange.subscribe(event => {
        changes.push([...event.detail.selectedValues]);
      });

      for (const action of scenario.actions) {
        if (action.type === 'activate') {
          if (action.source === 'pointer') {
            options(element)
              .find(option => option.dataset.value === action.value)
              ?.click();
          } else {
            key(element, action.value === element.activeValue ? 'Enter' : action.value);
          }
        } else if (action.type === 'sync') {
          element.selectedValues = action.selectedValues;
          element.selectedValuesControlled = true;
        } else {
          key(element, action.key);
        }
        await element.updateComplete;
      }

      expect(element.currentSelectedValues).toEqual(scenario.expected.selectedValues);
      expect(changes).toEqual(scenario.expected.changes);
      if (scenario.expected.activeValue !== undefined) {
        expect(element.activeValue).toBe(scenario.expected.activeValue);
        expect(
          options(element).find(option => option.dataset.active === 'true')?.dataset.value
        ).toBe(scenario.expected.activeValue);
      }
      fixture.destroy();
    });
  }
});

describe('CosmListboxComponent', () => {
  it('detects an explicitly bound empty array and re-emits the original CustomEvent', async () => {
    await TestBed.configureTestingModule({
      imports: [ControlledHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ControlledHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const component = componentOf(fixture);
    const element = component.element;
    await element.updateComplete;

    expect(element.selectedValuesControlled).toBe(true);
    options(element)
      .find(option => option.dataset.value === 'apple')
      ?.click();
    expect(host.lastEvent).toBeInstanceOf(CustomEvent);
    expect(host.lastEvent?.detail.selectedValues).toEqual(['apple']);
    expect(element.currentSelectedValues).toEqual([]);

    host.selectedValues = ['apple'];
    fixture.detectChanges();
    await fixture.whenStable();
    await element.updateComplete;
    expect(element.currentSelectedValues).toEqual(['apple']);
    fixture.destroy();
  });

  it('is included in the exported component collection', () => {
    expect(COSMOS_COMPONENTS).toContain(CosmListboxComponent);
  });

  it('rejects invalid option data on the forwarded custom element', async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = componentOf(fixture).element;
    await element.updateComplete;
    Reflect.set(element, 'items', [{ value: '', label: 'Invalid' }]);
    await expect(element.updateComplete).rejects.toThrow('nonempty value and label strings');
    fixture.destroy();
  });
});

describe('CosmListboxComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmListboxComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(listboxContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(listboxContract, 'angular'));
  });
});
