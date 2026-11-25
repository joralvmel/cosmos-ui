import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  eventNames,
  paginationContract,
  paginationScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmButton } from '@joralvmel/cosmos-elements/button';
import type { CosmPagination } from '@joralvmel/cosmos-elements/pagination';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COSMOS_COMPONENTS, CosmPaginationComponent } from '../src/index.js';

@Component({
  imports: [CosmPaginationComponent],
  template:
    '<cosm-pagination label="Results" [totalPages]="10" [page]="page()" [defaultPage]="defaultPage" [disabled]="disabled" (pageChange)="change($event)" />',
})
class Host {
  page = signal<number | undefined>(undefined);
  defaultPage = 1;
  disabled = false;
  change = vi.fn();
}

afterEach(() => TestBed.resetTestingModule());

describe('CosmPaginationComponent', () => {
  it('renders controlled input changes after initial rendering', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.page.set(5);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: CosmPagination = fixture.nativeElement.querySelector('cosm-pagination');
    await el.updateComplete;
    fixture.componentInstance.page.set(9);
    fixture.detectChanges();
    await fixture.whenStable();
    await el.updateComplete;
    expect(el.page).toBe(9);
    expect(fixture.componentInstance.change).not.toHaveBeenCalled();
  });
  for (const scenario of paginationScenariosFor('angular')) {
    it(scenario.name, async () => {
      await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
      const fixture = TestBed.createComponent(Host);
      fixture.componentInstance.page.set(scenario.props.page);
      fixture.componentInstance.defaultPage = scenario.props.defaultPage ?? 1;
      fixture.componentInstance.disabled = scenario.props.disabled ?? false;
      fixture.detectChanges();
      await fixture.whenStable();
      const el: CosmPagination = fixture.nativeElement.querySelector('cosm-pagination');
      await el.updateComplete;
      const target = el.renderRoot.querySelector<CosmButton>(`[data-page="${scenario.target}"]`);
      await target?.updateComplete;
      target?.click();
      await el.updateComplete;
      expect(el.page).toBe(scenario.expected.page);
      expect(
        fixture.componentInstance.change.mock.calls.map(([event]) => event.detail.page)
      ).toEqual(scenario.expected.changes);
    });
  }
});

describe('CosmPaginationComponent: contract drift', () => {
  it('forwards exactly the inputs and outputs', () => {
    const definition = Reflect.get(CosmPaginationComponent, 'ɵcmp');
    expect(Object.keys(definition.inputs).sort()).toEqual(
      propNames(paginationContract, 'angular').sort()
    );
    expect(Object.keys(definition.outputs)).toEqual(eventNames(paginationContract, 'angular'));
    expect(COSMOS_COMPONENTS).toContain(CosmPaginationComponent);
  });
});
