import {
  eventNames,
  type PopoverAction,
  type PopoverOpenChangeDetail,
  popoverContract,
  popoverScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmPopover } from '@joralvmel/cosmos-elements/popover';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Popover, type PopoverProps, popoverEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(
  props: PopoverProps,
  fixture: { panelHasFocusableContent?: boolean; triggerFocusable?: boolean } = {}
) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root?.render(
      <Popover {...props}>
        <button
          type="button"
          slot="trigger"
          aria-label="Toggle popover"
          disabled={fixture.triggerFocusable === false}
        />
        {fixture.panelHasFocusableContent === false ? null : (
          <button type="button" aria-label="First action" />
        )}
      </Popover>
    )
  );
  const el = container.querySelector('cosm-popover') as CosmPopover;
  await el.updateComplete;
  if (!(el.open && el.initialFocus)) trigger(el).focus();
  return el;
}

async function rerender(
  props: PopoverProps,
  fixture: { panelHasFocusableContent?: boolean; triggerFocusable?: boolean } = {}
) {
  await act(async () =>
    root?.render(
      <Popover {...props}>
        <button
          type="button"
          slot="trigger"
          aria-label="Toggle popover"
          disabled={fixture.triggerFocusable === false}
        />
        {fixture.panelHasFocusableContent === false ? null : (
          <button type="button" aria-label="First action" />
        )}
      </Popover>
    )
  );
  const el = container?.querySelector('cosm-popover') as CosmPopover;
  await el.updateComplete;
  return el;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

const trigger = (el: CosmPopover) =>
  el.querySelector<HTMLButtonElement>('[slot="trigger"]') as HTMLButtonElement;
const panel = (el: CosmPopover) => el.shadowRoot?.querySelector<HTMLElement>('[part="panel"]');
const panelFirst = (el: CosmPopover) =>
  el.querySelector<HTMLButtonElement>(':not([slot="trigger"])');

async function perform(
  el: CosmPopover,
  action: PopoverAction,
  props: PopoverProps,
  outsideTargets: HTMLElement[],
  fixture: { panelHasFocusableContent?: boolean; triggerFocusable?: boolean } = {}
): Promise<{ props: PopoverProps; outsideEvent?: Event }> {
  if (action.type === 'trigger') {
    const button = trigger(el);
    button.focus();
    if (action.source === 'keyboard') {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }));
    });
  } else if (action.type === 'escape') {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    if (action.handled) event.preventDefault();
    document.dispatchEvent(event);
  } else if (action.type === 'outside') {
    const target = document.createElement('button');
    document.body.append(target);
    outsideTargets.push(target);
    const outsideEvent = new Event('pointerdown', { bubbles: true, cancelable: true });
    target.dispatchEvent(outsideEvent);
    if (action.focusable) target.focus();
    return { props, outsideEvent };
  } else if (action.type === 'action' || action.type === 'back') {
    el.requestClose();
  } else if (action.type === 'close-button') {
    el.shadowRoot?.querySelector<HTMLElement>('cosm-icon-button')?.click();
  } else if (action.type === 'sync') {
    props = { ...props, open: action.open };
    await rerender(props, fixture);
  } else if (action.type === 'set-default') {
    props = { ...props, defaultOpen: action.defaultOpen };
    await rerender(props, fixture);
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
  return { props };
}

describe('Popover: shared scenarios', () => {
  for (const scenario of popoverScenariosFor('react')) {
    it(scenario.name, async () => {
      let cancelCurrent = false;
      const changes: Array<{ open: boolean; reason: string; canceled: boolean }> = [];
      const onOpenChange = vi.fn((event: CustomEvent<PopoverOpenChangeDetail>) => {
        const detail = event.detail;
        if (!detail.open && cancelCurrent) detail.preventDefault();
        changes.push({
          open: detail.open,
          reason: detail.reason,
          canceled: event.defaultPrevented,
        });
      });
      let props: PopoverProps = { ...scenario.props, onOpenChange };
      const el = await render(props, scenario.fixture);
      let outsidePresses = 0;
      const outsideTargets: HTMLElement[] = [];
      const countOutside = () => outsidePresses++;
      document.addEventListener('pointerdown', countOutside);

      for (const [index, action] of scenario.actions.entries()) {
        cancelCurrent = 'cancel' in action && Boolean(action.cancel);
        const result = await perform(el, action, props, outsideTargets, scenario.fixture);
        props = result.props;
        await el.updateComplete;
        if (result.outsideEvent) {
          expect(result.outsideEvent.defaultPrevented).toBe(false);
          expect(result.outsideEvent.cancelBubble).toBe(false);
        }
        expect(el.open, `after action ${index + 1}`).toBe(
          scenario.expected.openAfterEachAction[index]
        );
      }

      document.removeEventListener('pointerdown', countOutside);
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
    });
  }
});

describe('Popover: contract drift', () => {
  it('maps every contract event to its React name and DOM event', () => {
    expect(Object.keys(popoverEvents)).toEqual(eventNames(popoverContract, 'react'));
    expect(Object.values(popoverEvents)).toEqual(eventNames(popoverContract, 'dom'));
  });

  it('forwards every contract prop to the element', async () => {
    const values: Record<string, unknown> = {
      open: false,
      defaultOpen: true,
      triggerMode: 'hover',
      closable: true,
      closeLabel: 'Dismiss',
      gap: 20,
      arrow: true,
      closeOnEscape: false,
      closeOnOutsidePress: false,
      initialFocus: true,
      restoreFocus: false,
      side: 'left',
      align: 'start',
      flip: false,
      shift: false,
    };
    expect(Object.keys(values).sort()).toEqual(propNames(popoverContract, 'react').sort());
    const el = await render(values as PopoverProps);
    for (const [name, value] of Object.entries(values)) {
      expect(el[name as keyof CosmPopover], name).toBe(value);
    }
    expect(el.openControlled).toBe(true);
  });

  it('forwards the original cancelable CustomEvent and exposes requestClose on the ref', async () => {
    const ref = { current: null as CosmPopover | null };
    const onOpenChange = vi.fn((event: CustomEvent<PopoverOpenChangeDetail>) => {
      if (!event.detail.open) event.preventDefault();
    });
    const el = await render({ defaultOpen: true, onOpenChange, ref });
    el.requestClose();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect(onOpenChange.mock.calls[0]?.[0].defaultPrevented).toBe(true);
    expect(ref.current).toBe(el);
    expect(el.open).toBe(true);
  });

  it('releases controlled true to autonomous without changing the open value', async () => {
    const el = await render({ open: true });
    await rerender({});
    expect(el.openControlled).toBe(false);
    expect(el.open).toBe(true);
    el.requestClose();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('releases controlled false without opening, then allows autonomous activation', async () => {
    const el = await render({ open: false });
    await rerender({});
    expect(el.openControlled).toBe(false);
    expect(el.open).toBe(false);
    await act(async () => {
      trigger(el).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    });
    await el.updateComplete;
    expect(el.open).toBe(true);
  });
});
