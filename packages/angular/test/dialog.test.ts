import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  type DialogOpenChangeDetail,
  dialogContract,
  dialogLayoutScenarios,
  dialogScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it } from 'vitest';
import { COSMOS_COMPONENTS, CosmDialogComponent } from '../src/index.js';

@Component({
  imports: [CosmDialogComponent],
  template:
    '<cosm-dialog defaultOpen closeOnEscape closeOnBackdropPress fullWidth responsiveFullscreen movable>Dialog content</cosm-dialog>',
})
class HostComponent {}

@Component({
  imports: [CosmDialogComponent],
  template: `<cosm-dialog [open]="open" [defaultOpen]="defaultOpen"
    [presentation]="presentation" [size]="size" [maxWidth]="maxWidth"
    [fullWidth]="fullWidth" [responsiveFullscreen]="responsiveFullscreen" [movable]="movable"
    [moveControlsLabel]="moveControlsLabel" [moveUpLabel]="moveUpLabel"
    [moveDownLabel]="moveDownLabel" [moveLeftLabel]="moveLeftLabel"
    [moveRightLabel]="moveRightLabel" [moveCenterLabel]="moveCenterLabel"
    [closeOnEscape]="closeOnEscape" [closeOnBackdropPress]="closeOnBackdropPress">
    <h2 slot="title">Title</h2><button>Continue</button>
  </cosm-dialog>`,
})
class ScenarioHost {
  open: boolean | undefined;
  defaultOpen = false;
  presentation: 'standard' | 'fullscreen' = 'standard';
  size: 'sm' | 'md' | 'lg' = 'md';
  maxWidth: number | undefined;
  fullWidth = false;
  responsiveFullscreen = false;
  movable = false;
  moveControlsLabel = 'Move dialog';
  moveUpLabel = 'Move up';
  moveDownLabel = 'Move down';
  moveLeftLabel = 'Move left';
  moveRightLabel = 'Move right';
  moveCenterLabel = 'Center dialog';
  closeOnEscape = true;
  closeOnBackdropPress = false;
}

const viewportWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
afterEach(() => {
  TestBed.resetTestingModule();
  if (viewportWidth) Object.defineProperty(window, 'innerWidth', viewportWidth);
  else Reflect.deleteProperty(window, 'innerWidth');
});

async function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const wrapper = fixture.debugElement.query(By.directive(CosmDialogComponent))
    .componentInstance as CosmDialogComponent;
  await wrapper.element.updateComplete;
  return { fixture, wrapper, el: wrapper.element };
}

describe('CosmDialogComponent', () => {
  it('applies boolean attribute transforms from Angular templates', async () => {
    const { fixture, el } = await setup();
    expect(el.defaultOpen).toBe(true);
    expect(el.closeOnEscape).toBe(true);
    expect(el.closeOnBackdropPress).toBe(true);
    expect(el.fullWidth).toBe(true);
    expect(el.responsiveFullscreen).toBe(true);
    expect(el.movable).toBe(true);
    fixture.destroy();
  });

  it('forwards inputs as element properties, including HTMLElement references', async () => {
    const { fixture, wrapper, el } = await setup();
    const initialFocusTarget = document.createElement('button');
    const returnFocusTarget = document.createElement('button');

    wrapper.open = false;
    wrapper.defaultOpen = true;
    wrapper.presentation = 'fullscreen';
    wrapper.size = 'lg';
    wrapper.maxWidth = 672;
    wrapper.fullWidth = true;
    wrapper.responsiveFullscreen = true;
    wrapper.movable = true;
    wrapper.moveControlsLabel = 'Move this dialog';
    wrapper.moveUpLabel = 'Shift upward';
    wrapper.moveDownLabel = 'Shift downward';
    wrapper.moveLeftLabel = 'Shift left';
    wrapper.moveRightLabel = 'Shift right';
    wrapper.moveCenterLabel = 'Center this dialog';
    wrapper.closeLabel = 'Dismiss dialog';
    wrapper.closeOnEscape = false;
    wrapper.closeOnBackdropPress = false;
    wrapper.initialFocusTarget = initialFocusTarget;
    wrapper.returnFocusTarget = returnFocusTarget;
    await el.updateComplete;

    expect(el.open).toBe(false);
    expect(el.openControlled).toBe(true);
    expect(el.defaultOpen).toBe(true);
    expect(el.presentation).toBe('fullscreen');
    expect(el.size).toBe('lg');
    expect(el.maxWidth).toBe(672);
    expect(el.fullWidth).toBe(true);
    expect(el.responsiveFullscreen).toBe(true);
    expect(el.movable).toBe(true);
    expect(el.moveControlsLabel).toBe('Move this dialog');
    expect(el.moveUpLabel).toBe('Shift upward');
    expect(el.moveDownLabel).toBe('Shift downward');
    expect(el.moveLeftLabel).toBe('Shift left');
    expect(el.moveRightLabel).toBe('Shift right');
    expect(el.moveCenterLabel).toBe('Center this dialog');
    expect(el.closeLabel).toBe('Dismiss dialog');
    expect(el.closeOnEscape).toBe(false);
    expect(el.closeOnBackdropPress).toBe(false);
    expect(el.initialFocusTarget).toBe(initialFocusTarget);
    expect(el.returnFocusTarget).toBe(returnFocusTarget);

    wrapper.size = 'sm';
    wrapper.maxWidth = undefined;
    wrapper.fullWidth = false;
    wrapper.responsiveFullscreen = false;
    wrapper.movable = false;
    expect(el.size).toBe('sm');
    expect(el.maxWidth).toBeUndefined();
    expect(el.fullWidth).toBe(false);
    expect(el.responsiveFullscreen).toBe(false);
    expect(el.movable).toBe(false);

    wrapper.initialFocusTarget = null;
    wrapper.returnFocusTarget = null;
    expect(el.initialFocusTarget).toBeNull();
    expect(el.returnFocusTarget).toBeNull();
    fixture.destroy();
  });

  it('supports controlled-state release and the element open/close request API', async () => {
    const { fixture, wrapper, el } = await setup();
    wrapper.open = true;
    await el.updateComplete;
    expect(el.openControlled).toBe(true);

    wrapper.open = undefined;
    expect(el.openControlled).toBe(false);
    expect(el.open).toBe(true);

    wrapper.requestClose();
    await el.updateComplete;
    expect(el.open).toBe(false);
    wrapper.requestOpen();
    await el.updateComplete;
    expect(el.open).toBe(true);
    fixture.destroy();
  });

  it('re-emits the original cancelable CustomEvent and preserves controlled state', async () => {
    const { fixture, wrapper, el } = await setup();
    wrapper.open = true;
    await el.updateComplete;
    let received: CustomEvent<DialogOpenChangeDetail> | undefined;
    let originalEvent: Event | undefined;
    el.addEventListener('cosm-open-change', event => {
      originalEvent = event;
    });
    const subscription = wrapper.openChange.subscribe(event => {
      received = event;
      event.preventDefault();
    });

    wrapper.requestClose();

    expect(received).toBeInstanceOf(CustomEvent);
    expect(received).toBe(originalEvent);
    expect(received?.detail.open).toBe(false);
    expect(received?.defaultPrevented).toBe(true);
    expect(el.open).toBe(true);

    subscription.unsubscribe();
    fixture.destroy();
  });

  it('is part of COSMOS_COMPONENTS', () => {
    expect(COSMOS_COMPONENTS).toContain(CosmDialogComponent);
  });
});

describe('CosmDialogComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmDialogComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(dialogContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(dialogContract, 'angular'));
  });

  describe('CosmDialogComponent: shared scenarios', () => {
    for (const scenario of dialogScenariosFor('angular')) {
      it(scenario.name, async () => {
        const fixture = TestBed.createComponent(ScenarioHost);
        Object.assign(fixture.componentInstance, scenario.props);
        fixture.detectChanges();
        await fixture.whenStable();
        const wrapper = fixture.debugElement.query(By.directive(CosmDialogComponent))
          .componentInstance as CosmDialogComponent;
        const el = wrapper.element;
        await el.updateComplete;
        let cancel = false;
        const changes: Array<{ open: boolean; reason: string; canceled: boolean }> = [];
        const subscription = wrapper.openChange.subscribe(event => {
          if (!event.detail.open && cancel) event.preventDefault();
          changes.push({
            open: event.detail.open,
            reason: event.detail.reason,
            canceled: event.defaultPrevented,
          });
        });
        for (const [index, action] of scenario.actions.entries()) {
          cancel = 'cancel' in action && Boolean(action.cancel);
          if (action.type === 'sync') wrapper.open = action.open;
          if (action.type === 'set-default') wrapper.defaultOpen = action.defaultOpen;
          if (action.type === 'open') wrapper.requestOpen();
          if (action.type === 'action') wrapper.requestClose();
          if (action.type === 'close-button')
            el.shadowRoot?.querySelector('cosm-icon-button')?.click();
          if (action.type === 'backdrop')
            el.shadowRoot?.querySelector<HTMLElement>('[part="backdrop"]')?.click();
          if (action.type === 'escape')
            el.shadowRoot
              ?.querySelector('dialog')
              ?.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
              );
          await el.updateComplete;
          expect(el.open).toBe(scenario.expected.openAfterEachAction[index]);
        }
        expect(changes).toEqual(scenario.expected.changes);
        subscription.unsubscribe();
        fixture.destroy();
      });
    }

    for (const scenario of dialogLayoutScenarios) {
      it(`layout: ${scenario.name}`, async () => {
        Object.defineProperty(window, 'innerWidth', {
          configurable: true,
          value: scenario.viewportWidth,
        });
        const fixture = TestBed.createComponent(ScenarioHost);
        Object.assign(fixture.componentInstance, scenario.props, { defaultOpen: true });
        fixture.detectChanges();
        await fixture.whenStable();
        const wrapper = fixture.debugElement.query(By.directive(CosmDialogComponent))
          .componentInstance as CosmDialogComponent;
        const el = wrapper.element;
        await el.updateComplete;
        const fullscreen =
          el.shadowRoot?.querySelector('dialog')?.hasAttribute('data-fullscreen') ?? false;
        const width = Number(
          el.style.getPropertyValue('--_cosm-dialog-max-width').match(/(\d+)px/)?.[1]
        );
        expect(fullscreen).toBe(scenario.expected.fullscreen);
        expect(fullscreen ? null : width).toBe(scenario.expected.maxWidth);
        expect(fullscreen || el.fullWidth).toBe(scenario.expected.fullWidth);
        expect(Boolean(el.shadowRoot?.querySelector('[part="move-controls"]'))).toBe(
          scenario.expected.movable
        );
        fixture.destroy();
      });
    }
  });
});
