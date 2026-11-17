import {
  eventNames,
  type PopoverAction,
  type PopoverOpenChangeDetail,
  popoverContract,
  popoverScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmPopover } from '../src/components/popover/cosm-popover.js';
import { cleanup } from './fixture.js';

afterEach(cleanup);
const localHosts: HTMLElement[] = [];
afterEach(() => {
  for (const host of localHosts.splice(0)) host.remove();
});

const trigger = (el: CosmPopover) =>
  el.querySelector<HTMLButtonElement>('[slot="trigger"]') as HTMLButtonElement;
const panel = (el: CosmPopover) => el.shadowRoot?.querySelector<HTMLElement>('[part="panel"]');
const panelFirst = (el: CosmPopover) =>
  el.querySelector<HTMLButtonElement>('[slot=""]') ??
  el.querySelector<HTMLButtonElement>(':not([slot="trigger"])');

async function setup(
  props: Record<string, unknown> = {},
  fixture: { panelHasFocusableContent?: boolean; triggerFocusable?: boolean } = {}
) {
  const host = document.createElement('div');
  const el = document.createElement('cosm-popover') as CosmPopover;
  const triggerButton = document.createElement('button');
  triggerButton.slot = 'trigger';
  triggerButton.textContent = 'Toggle';
  const actionButton = document.createElement('button');
  actionButton.textContent = 'First action';
  if (fixture.triggerFocusable === false) triggerButton.disabled = true;
  el.append(triggerButton);
  if (fixture.panelHasFocusableContent !== false) el.append(actionButton);
  Object.assign(el, props);
  host.append(el);
  document.body.append(host);
  localHosts.push(host);
  await el.updateComplete;
  if (!(el.open && el.initialFocus)) triggerButton.focus();
  return el;
}

function pressTrigger(el: CosmPopover, source: 'pointer' | 'touch' | 'keyboard'): void {
  const button = trigger(el);
  button.focus();
  if (source === 'keyboard') {
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
}

function sendEscape(handled = false): void {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  if (handled) event.preventDefault();
  document.dispatchEvent(event);
}

function sendOutside(
  focusable: boolean,
  targets: HTMLElement[]
): { target: HTMLButtonElement; event: Event } {
  const target = document.createElement('button');
  target.textContent = 'Outside';
  document.body.append(target);
  targets.push(target);
  const event = new Event('pointerdown', { bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  if (focusable) target.focus();
  return { target, event };
}

async function perform(
  el: CosmPopover,
  action: PopoverAction,
  focusOutside: HTMLButtonElement,
  outsideTargets: HTMLElement[]
): Promise<Event | undefined> {
  if (action.type === 'trigger') {
    pressTrigger(el, action.source);
  } else if (action.type === 'escape') {
    sendEscape(action.handled);
  } else if (action.type === 'outside') {
    return sendOutside(action.focusable, outsideTargets).event;
  } else if (action.type === 'action' || action.type === 'back') {
    el.requestClose();
  } else if (action.type === 'sync') {
    el.open = action.open;
  } else if (action.type === 'set-default') {
    el.defaultOpen = action.defaultOpen;
  } else if (action.type === 'focus') {
    if (action.target === 'trigger') trigger(el).focus();
    else if (action.target === 'panel') panelFirst(el)?.focus();
    else focusOutside.focus();
  }
  return undefined;
}

describe('cosm-popover: shared scenarios', () => {
  for (const scenario of popoverScenariosFor('web')) {
    it(scenario.name, async () => {
      const el = await setup({ ...scenario.props }, scenario.fixture);
      const changes: Array<{ open: boolean; reason: string; canceled: boolean }> = [];
      let cancelCurrent = false;
      let outsidePresses = 0;
      const focusOutside = document.createElement('button');
      focusOutside.textContent = 'Focus outside';
      document.body.append(focusOutside);
      const outsideTargets: HTMLElement[] = [];
      const onChange = (event: CustomEvent<PopoverOpenChangeDetail>) => {
        const detail = event.detail;
        if (!detail.open && cancelCurrent) detail.preventDefault();
        changes.push({
          open: detail.open,
          reason: detail.reason,
          canceled: event.defaultPrevented,
        });
      };
      el.addEventListener('cosm-open-change', onChange);
      const countOutside = () => outsidePresses++;
      document.addEventListener('pointerdown', countOutside);

      for (const [index, action] of scenario.actions.entries()) {
        cancelCurrent = 'cancel' in action && Boolean(action.cancel);
        const external = await perform(el, action, focusOutside, outsideTargets);
        await el.updateComplete;
        if (external?.type === 'pointerdown') {
          expect(external.defaultPrevented).toBe(false);
          expect(external.cancelBubble).toBe(false);
        }
        expect(el.open, `after action ${index + 1}`).toBe(
          scenario.expected.openAfterEachAction[index]
        );
      }

      expect(el.open).toBe(scenario.expected.open);
      expect(changes).toEqual(
        scenario.expected.changes.map(change => ({
          open: change.open,
          reason: change.reason,
          canceled: change.canceled,
        }))
      );
      expect(outsidePresses).toBe(scenario.expected.outsidePresses);
      document.removeEventListener('pointerdown', countOutside);
      focusOutside.remove();
      for (const target of outsideTargets) target.remove();

      const active = document.activeElement;
      if (scenario.expected.focus === 'trigger') expect(active).toBe(trigger(el));
      if (scenario.expected.focus === 'panel-first') expect(active).toBe(panelFirst(el));
      if (scenario.expected.focus === 'panel') expect(el.shadowRoot?.activeElement).toBe(panel(el));
      if (scenario.expected.focus === 'outside') expect(active).toBe(document.activeElement);
      if (scenario.expected.focus === 'unmanaged') expect(active).not.toBe(trigger(el));
    });
  }
});

describe('cosm-popover: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(CosmPopover.properties).sort()).toEqual(
      propNames(popoverContract, 'web').sort()
    );
  });

  it('dispatches the contract DOM event with composed, bubbling request details', async () => {
    const el = await setup({ defaultOpen: true });
    const received = vi.fn();
    el.addEventListener('cosm-open-change', received);
    el.requestClose();
    const event = received.mock.calls[0]?.[0] as CustomEvent<PopoverOpenChangeDetail>;
    expect(event.type).toBe(eventNames(popoverContract, 'dom')[0]);
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.cancelable).toBe(true);
    expect(event.detail).toMatchObject({ open: false, reason: 'action' });
    expect('defaultPrevented' in event.detail ? event.detail.defaultPrevented : undefined).toBe(
      false
    );
  });
});

describe('cosm-popover', () => {
  it('exposes expanded state on the consumer trigger and hides closed panel content', async () => {
    const el = await setup();
    expect(trigger(el).getAttribute('aria-expanded')).toBe('false');
    expect(panel(el)?.hasAttribute('hidden')).toBe(true);
    expect(panel(el)?.hasAttribute('role')).toBe(false);
    expect(panel(el)?.hasAttribute('aria-modal')).toBe(false);
    expect(panel(el)?.hasAttribute('aria-haspopup')).toBe(false);

    pressTrigger(el, 'pointer');
    await el.updateComplete;
    expect(trigger(el).getAttribute('aria-expanded')).toBe('true');
    expect(panel(el)?.hasAttribute('hidden')).toBe(false);
  });

  it('shares synchronous cancellation between detail.preventDefault and event.preventDefault', async () => {
    const el = await setup({ defaultOpen: true });
    const detailCancel = vi.fn((event: CustomEvent<PopoverOpenChangeDetail>) => {
      if (!event.detail.open) event.detail.preventDefault();
      expect(event.defaultPrevented).toBe(true);
    });
    el.addEventListener('cosm-open-change', detailCancel);
    el.requestClose();
    expect(detailCancel).toHaveBeenCalledTimes(1);
    expect(el.open).toBe(true);

    el.removeEventListener('cosm-open-change', detailCancel);
    el.addEventListener('cosm-open-change', event => {
      event.preventDefault();
      const detail = (event as CustomEvent<PopoverOpenChangeDetail>).detail;
      expect('defaultPrevented' in detail ? detail.defaultPrevented : undefined).toBe(true);
    });
    el.requestClose();
    expect(el.open).toBe(true);
  });

  it('returns no proposal while closed and requestClose proposes only an action close', async () => {
    const el = await setup();
    const listener = vi.fn();
    el.addEventListener('cosm-open-change', listener);
    el.requestClose();
    expect(listener).not.toHaveBeenCalled();
    pressTrigger(el, 'pointer');
    await el.updateComplete;
    el.requestClose();
    await el.updateComplete;
    expect(listener.mock.calls.map(([event]) => event.detail)).toEqual([
      { open: true, reason: 'trigger' },
      expect.objectContaining({ open: false, reason: 'action' }),
    ]);
  });

  it('releases controlled ownership on undefined without changing committed visibility', async () => {
    const el = await setup();
    el.open = true;
    await el.updateComplete;
    expect(el.openControlled).toBe(true);

    el.open = undefined;
    expect(el.open).toBe(true);
    expect(el.openControlled).toBe(false);
    el.requestClose();
    await el.updateComplete;
    expect(el.open).toBe(false);

    el.open = false;
    await el.updateComplete;
    el.open = undefined;
    expect(el.open).toBe(false);
    expect(el.openControlled).toBe(false);
    pressTrigger(el, 'pointer');
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('uses the native manual Popover API when available and keeps dismissal owned', async () => {
    const el = await setup();
    const panelElement = panel(el);
    if (!panelElement) throw new Error('Popover panel was not rendered.');
    const showPopover = vi.fn();
    const hidePopover = vi.fn();
    Object.defineProperties(panelElement, {
      showPopover: { configurable: true, value: showPopover },
      hidePopover: { configurable: true, value: hidePopover },
    });

    el.open = true;
    await el.updateComplete;
    expect(panelElement.getAttribute('popover')).toBe('manual');
    expect(showPopover).toHaveBeenCalledTimes(1);

    const cancelClose = (event: CustomEvent<PopoverOpenChangeDetail>) => {
      if (!event.detail.open) event.preventDefault();
    };
    el.addEventListener('cosm-open-change', cancelClose);
    el.requestClose();
    expect(el.open).toBe(true);
    expect(hidePopover).not.toHaveBeenCalled();

    el.removeEventListener('cosm-open-change', cancelClose);
    el.open = false;
    await el.updateComplete;
    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it('uses fixed positioning when Popover API methods are unavailable', async () => {
    const el = await setup();
    const panelElement = panel(el);
    if (!panelElement) throw new Error('Popover panel was not rendered.');
    Object.defineProperties(panelElement, {
      showPopover: { configurable: true, value: undefined },
      hidePopover: { configurable: true, value: undefined },
    });

    el.open = true;
    await el.updateComplete;
    expect(panelElement.hasAttribute('popover')).toBe(false);
    expect(panelElement.hasAttribute('hidden')).toBe(false);
    expect(getComputedStyle(panelElement).position).toBe('fixed');
  });

  it('propagates unexpected showPopover errors instead of silently falling back', async () => {
    const el = await setup();
    const panelElement = panel(el);
    if (!panelElement) throw new Error('Popover panel was not rendered.');
    const failure = new Error('showPopover failed unexpectedly');
    Object.defineProperties(panelElement, {
      showPopover: {
        configurable: true,
        value: () => {
          throw failure;
        },
      },
      hidePopover: { configurable: true, value: vi.fn() },
    });

    el.open = true;
    await expect(el.updateComplete).rejects.toBe(failure);
  });

  it('propagates unexpected hidePopover errors', async () => {
    const el = await setup();
    const panelElement = panel(el);
    if (!panelElement) throw new Error('Popover panel was not rendered.');
    const failure = new Error('hidePopover failed unexpectedly');
    Object.defineProperties(panelElement, {
      showPopover: { configurable: true, value: vi.fn() },
      hidePopover: {
        configurable: true,
        value: () => {
          throw failure;
        },
      },
    });

    el.open = true;
    await el.updateComplete;
    el.open = false;
    await expect(el.updateComplete).rejects.toBe(failure);
  });

  it('flips and shifts against viewport bounds, then recomputes on scroll', async () => {
    const oldWidth = window.innerWidth;
    const oldHeight = window.innerHeight;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    try {
      const el = await setup({ open: true, side: 'bottom', align: 'center' });
      const triggerRect = (left: number, top: number) =>
        ({
          x: left,
          y: top,
          left,
          top,
          right: left + 40,
          bottom: top + 20,
          width: 40,
          height: 20,
          toJSON: () => ({}),
        }) as DOMRect;
      let rect = triggerRect(480, 450);
      trigger(el).getBoundingClientRect = () => rect;
      const panelElement = panel(el);
      if (!panelElement) throw new Error('Popover panel was not rendered.');
      panelElement.getBoundingClientRect = () =>
        ({
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 120,
          bottom: 100,
          width: 120,
          height: 100,
          toJSON: () => ({}),
        }) as DOMRect;

      el.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      expect(panelElement.dataset.placement).toBe('top');
      expect(Number.parseFloat(panelElement.style.left)).toBeLessThanOrEqual(372);
      const before = panelElement.style.left;
      rect = triggerRect(100, 250);
      window.dispatchEvent(new Event('scroll'));
      expect(panelElement.style.left).not.toBe(before);
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: oldWidth });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: oldHeight });
    }
  });
});
