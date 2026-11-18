import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { badgeContract, badgeScenariosFor, eventNames, propNames } from '@joralvmel/cosmos-core';
import type {
  BadgeSize,
  BadgeTone,
  BadgeVariant,
  CosmBadge,
} from '@joralvmel/cosmos-elements/badge';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { heart } from '@joralvmel/cosmos-icons/heart';
import { afterEach, describe, expect, it } from 'vitest';
import { COSMOS_COMPONENTS, CosmBadgeComponent } from '../src/index.js';

@Component({
  imports: [CosmBadgeComponent],
  template:
    '<cosm-badge [variant]="variant" [tone]="tone" [size]="size" [startIcon]="startIcon">{{ text }}</cosm-badge>',
})
class HostComponent {
  variant: BadgeVariant = 'soft';
  tone: BadgeTone = 'neutral';
  size: BadgeSize = 'md';
  startIcon: IconDefinition | undefined;
  text = 'Ready';
}

afterEach(() => TestBed.resetTestingModule());

describe('CosmBadgeComponent', () => {
  for (const scenario of badgeScenariosFor('angular')) {
    it(scenario.name, async () => {
      const fixture = TestBed.createComponent(HostComponent);
      Object.assign(fixture.componentInstance, scenario.props, { text: scenario.text });
      fixture.detectChanges();
      await fixture.whenStable();
      const el = fixture.nativeElement.querySelector('cosm-badge') as CosmBadge;
      await el.updateComplete;
      expect(el.variant).toBe(scenario.expected.variant);
      expect(el.tone).toBe(scenario.expected.tone);
      expect(el.size).toBe(scenario.expected.size);
      expect(el.textContent).toBe(scenario.expected.text);
    });
  }

  it('forwards a structured icon as a property', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.startIcon = heart;
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('cosm-badge') as CosmBadge;
    await el.updateComplete;
    expect(el.startIcon).toBe(heart);
    expect(el.hasAttribute('start-icon')).toBe(false);
  });

  it('is part of COSMOS_COMPONENTS', () => {
    expect(COSMOS_COMPONENTS).toContain(CosmBadgeComponent);
  });

  it('keeps the web element noninteractive', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('cosm-badge') as CosmBadge;
    await el.updateComplete;
    expect(el.getAttribute('role')).toBeNull();
    expect(el.shadowRoot?.querySelector('[aria-live]')).toBeNull();
  });
});

describe('CosmBadgeComponent: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (CosmBadgeComponent as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(badgeContract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(badgeContract, 'angular'));
  });
});
