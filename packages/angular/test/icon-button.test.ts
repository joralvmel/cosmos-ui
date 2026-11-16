import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  eventNames,
  type IconButtonPressDetail,
  type IconButtonPressedChangeDetail,
  iconButtonContract,
  iconButtonScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmIconButton } from '@joralvmel/cosmos-elements/icon-button';
import { afterEach, describe, expect, it } from 'vitest';
import { COSMOS_COMPONENTS, CosmIconButtonComponent } from '../src/index.js';

@Component({ imports: [CosmIconButtonComponent], template: '' })
class HostComponent {
  label = 'Favorite';
  mode: 'action' | 'toggle' = 'action';
  disabled = false;
  defaultPressed = false;
  pressed = false;
  sources: string[] = [];
  changes: boolean[] = [];
  onPress(event: CustomEvent<IconButtonPressDetail>) {
    this.sources.push(event.detail.source);
  }
  onChange(event: CustomEvent<IconButtonPressedChangeDetail>) {
    this.changes.push(event.detail.pressed);
  }
}

afterEach(() => TestBed.resetTestingModule());

describe('CosmIconButtonComponent', () => {
  for (const scenario of iconButtonScenariosFor('angular')) {
    it(scenario.name, async () => {
      const controlled = Object.hasOwn(scenario.props, 'pressed');
      TestBed.overrideComponent(HostComponent, {
        set: {
          template: `<cosm-icon-button [label]="label" [mode]="mode" [disabled]="disabled"
          [defaultPressed]="defaultPressed" ${controlled ? '[pressed]="pressed"' : ''}
          (press)="onPress($event)" (pressedChange)="onChange($event)"></cosm-icon-button>`,
        },
      });
      const fixture = TestBed.createComponent(HostComponent);
      Object.assign(fixture.componentInstance, scenario.props);
      fixture.detectChanges();
      await fixture.whenStable();
      const el = fixture.nativeElement.querySelector('cosm-icon-button') as CosmIconButton;
      await el.updateComplete;
      for (const action of scenario.actions) {
        if (action.type === 'sync') {
          fixture.componentInstance.pressed = action.pressed;
          fixture.detectChanges();
        } else {
          const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
          if (action.type === 'key')
            button.dispatchEvent(new KeyboardEvent('keydown', { key: action.key, bubbles: true }));
          else button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
          if (!button.disabled)
            button.dispatchEvent(
              new MouseEvent('click', {
                bubbles: true,
                composed: true,
                detail: action.type === 'key' ? 0 : 1,
              })
            );
        }
        await el.updateComplete;
      }
      const button = el.shadowRoot?.querySelector('button') as HTMLButtonElement;
      expect(fixture.componentInstance.sources).toEqual(scenario.expected.sources);
      expect(fixture.componentInstance.changes).toEqual(scenario.expected.changes);
      expect(button.disabled).toBe(scenario.expected.disabled);
      expect(button.getAttribute('aria-pressed')).toBe(
        scenario.expected.pressed === null ? null : String(scenario.expected.pressed)
      );
    });
  }
});

describe('CosmIconButtonComponent: contract drift', () => {
  it('coerces a static pressed attribute and keeps it controlled', async () => {
    TestBed.overrideComponent(HostComponent, {
      set: {
        template:
          '<cosm-icon-button label="Favorite" mode="toggle" pressed (pressedChange)="onChange($event)"></cosm-icon-button>',
      },
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('cosm-icon-button') as CosmIconButton;
    await el.updateComplete;
    el.click();
    await el.updateComplete;
    expect(el.pressed).toBe(true);
    expect(fixture.componentInstance.changes).toEqual([false]);
  });

  it('declares exactly the contract inputs and outputs', () => {
    const def = (
      CosmIconButtonComponent as unknown as { ɵcmp: { inputs: object; outputs: object } }
    ).ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(iconButtonContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(iconButtonContract, 'angular'));
    expect(COSMOS_COMPONENTS).toContain(CosmIconButtonComponent);
  });
});
