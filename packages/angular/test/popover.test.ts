import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  eventNames,
  type PopoverAction,
  type PopoverOpenChangeDetail,
  popoverContract,
  popoverScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmPopover } from '@joralvmel/cosmos-elements/popover';
import { afterEach, describe, expect, it } from 'vitest';
import { CosmPopoverComponent } from '../src/components/popover.component.js';

@Component({
  imports: [CosmPopoverComponent],
  template:
    '<cosm-popover><button slot="trigger" [disabled]="!triggerFocusable">Toggle</button>@if (panelFocusable) {<button>First action</button>}</cosm-popover>',
})
class ScenarioHostComponent {
  triggerFocusable = true;
  panelFocusable = true;
}

@Component({
  imports: [CosmPopoverComponent],
  template: `<cosm-popover
    [open]="open"
    [side]="side"
    (openChange)="handleChange($event)"
  >
    <button slot="trigger">Toggle</button>
    <button>First action</button>
  </cosm-popover>`,
})
class BindingHostComponent {
  open = true;
  side: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
  received: CustomEvent<PopoverOpenChangeDetail> | undefined;
  cancel = false;

  handleChange(event: CustomEvent<PopoverOpenChangeDetail>): void {
    this.received = event;
    if (this.cancel && !event.detail.open) event.preventDefault();
  }
}

afterEach(() => TestBed.resetTestingModule());

const trigger = (el: CosmPopover) =>
  el.querySelector<HTMLButtonElement>('[slot="trigger"]') as HTMLButtonElement;
const panel = (el: CosmPopover) => el.shadowRoot?.querySelector<HTMLElement>('[part="panel"]');
const panelFirst = (el: CosmPopover) =>
  el.querySelector<HTMLButtonElement>(':not([slot="trigger"])');

async function setup(
  props: Record<string, unknown> = {},
  fixtureOptions: { panelHasFocusableContent?: boolean; triggerFocusable?: boolean } = {}
) {
  const fixture = TestBed.createComponent(ScenarioHostComponent);
  fixture.componentInstance.triggerFocusable = fixtureOptions.triggerFocusable !== false;
  fixture.componentInstance.panelFocusable = fixtureOptions.panelHasFocusableContent !== false;
  fixture.detectChanges();
  const wrapper = fixture.debugElement.query(By.directive(CosmPopoverComponent))
    .componentInstance as CosmPopoverComponent;
  for (const [name, value] of Object.entries(props)) {
    (wrapper as unknown as Record<string, unknown>)[name] = value;
  }
  fixture.detectChanges();
  await fixture.whenStable();
  await wrapper.element.updateComplete;
  if (!(wrapper.element.open && wrapper.element.initialFocus)) trigger(wrapper.element).focus();
  return { fixture, wrapper, el: wrapper.element };
}

async function perform(
  wrapper: CosmPopoverComponent,
  el: CosmPopover,
  action: PopoverAction,
  outsideTargets: HTMLElement[]
): Promise<Event | undefined> {
  if (action.type === 'trigger') {
    const button = trigger(el);
    button.focus();
    if (action.source === 'keyboard') {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
  } else if (action.type === 'escape') {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    if (action.handled) event.preventDefault();
    document.dispatchEvent(event);
  } else if (action.type === 'outside') {
    const target = document.createElement('button');
    target.textContent = 'Outside';
    document.body.append(target);
    outsideTargets.push(target);
    const event = new Event('pointerdown', { bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    if (action.focusable) target.focus();
    return event;
  } else if (action.type === 'action' || action.type === 'back') {
    wrapper.requestClose();
  } else if (action.type === 'close-button') {
    el.shadowRoot?.querySelector<HTMLElement>('cosm-icon-button')?.click();
  } else if (action.type === 'sync') {
    wrapper.open = action.open;
  } else if (action.type === 'set-default') {
    wrapper.defaultOpen = action.defaultOpen;
  } else if (action.type === 'focus') {
    if (action.target === 'trigger') trigger(el).focus();
    else if (action.target === 'panel') panelFirst(el)?.focus();
    else {
      const target = document.createElement('button');
      target.textContent = 'Focus outside';
      document.body.append(target);
      outsideTargets.push(target);
      target.focus();
    }
  }
  return undefined;
}

describe('CosmPopoverComponent: shared scenarios', () => {
  for (const scenario of popoverScenariosFor('angular')) {
    it(scenario.name, async () => {
      const { fixture, wrapper, el } = await setup(scenario.props, scenario.fixture);
      const changes: Array<{ open: boolean; reason: string; canceled: boolean }> = [];
      let cancelCurrent = false;
      const output = wrapper.openChange.subscribe((event: CustomEvent<PopoverOpenChangeDetail>) => {
        const detail = event.detail;
        if (!detail.open && cancelCurrent) detail.preventDefault();
        changes.push({
          open: detail.open,
          reason: detail.reason,
          canceled: event.defaultPrevented,
        });
      });
      let outsidePresses = 0;
      const outsideTargets: HTMLElement[] = [];
      const countOutside = () => outsidePresses++;
      document.addEventListener('pointerdown', countOutside);

      for (const [index, action] of scenario.actions.entries()) {
        cancelCurrent = 'cancel' in action && Boolean(action.cancel);
        const external = await perform(wrapper, el, action, outsideTargets);
        await el.updateComplete;
        if (external) {
          expect(external.defaultPrevented).toBe(false);
          expect(external.cancelBubble).toBe(false);
        }
        expect(el.open, `after action ${index + 1}`).toBe(
          scenario.expected.openAfterEachAction[index]
        );
      }

      document.removeEventListener('pointerdown', countOutside);
      output.unsubscribe();
      expect(el.open).toBe(scenario.expected.open);
      expect(changes).toEqual(
        scenario.expected.changes.map(change => ({
          open: change.open,
          reason: change.reason,
          canceled: change.canceled,
        }))
      );
      expect(outsidePresses).toBe(scenario.expected.outsidePresses);
      if (scenario.expected.focus === 'trigger') expect(document.activeElement).toBe(trigger(el));
      if (scenario.expected.focus === 'panel-first')
        expect(document.activeElement).toBe(panelFirst(el));
      if (scenario.expected.focus === 'panel') expect(el.shadowRoot?.activeElement).toBe(panel(el));
      if (scenario.expected.focus === 'outside')
        expect(document.activeElement).not.toBe(trigger(el));
      if (scenario.expected.focus === 'unmanaged')
        expect(document.activeElement).not.toBe(trigger(el));
      for (const target of outsideTargets) target.remove();
      fixture.destroy();
    });
  }
});

describe('CosmPopoverComponent', () => {
  it('forwards a bound false value and other properties as element properties', async () => {
    const { fixture, wrapper, el } = await setup();
    wrapper.open = false;
    wrapper.side = 'left';
    wrapper.align = 'start';
    wrapper.closeOnEscape = false;
    fixture.detectChanges();
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(el.openControlled).toBe(true);
    expect(el.side).toBe('left');
    expect(el.align).toBe('start');
    expect(el.closeOnEscape).toBe(false);
  });

  it('re-emits the original cancelable CustomEvent and provides requestClose', async () => {
    const fixture = TestBed.createComponent(BindingHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const wrapper = fixture.debugElement.query(By.directive(CosmPopoverComponent))
      .componentInstance as CosmPopoverComponent;
    const el = wrapper.element;
    const host = fixture.componentInstance;
    await el.updateComplete;
    expect(el.open).toBe(true);
    host.cancel = true;
    wrapper.requestClose();
    expect(host.received).toBeInstanceOf(CustomEvent);
    expect(host.received?.detail.reason).toBe('action');
    expect(host.received?.defaultPrevented).toBe(true);
    expect(el.open).toBe(true);
  });

  it('releases controlled true to autonomous without changing the open value', async () => {
    const { wrapper, el } = await setup({ open: true });
    wrapper.open = undefined;
    expect(el.openControlled).toBe(false);
    expect(el.open).toBe(true);
    wrapper.requestClose();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('releases controlled false without opening, then allows autonomous activation', async () => {
    const { wrapper, el } = await setup({ open: false });
    wrapper.open = undefined;
    expect(el.openControlled).toBe(false);
    expect(el.open).toBe(false);
    trigger(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).toBe(true);
  });
});

describe('CosmPopoverComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmPopoverComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(popoverContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(popoverContract, 'angular'));
  });
});
