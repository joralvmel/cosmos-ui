import {
  type DialogOpenChangeDetail,
  dialogContract,
  dialogLayoutScenarios,
  dialogScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import type { CosmDialog } from '@joralvmel/cosmos-elements/dialog';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog, type DialogProps, dialogEvents } from '../src/index.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;
const viewportWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');

function Owner({
  onOpenChange,
}: {
  onOpenChange: (event: CustomEvent<DialogOpenChangeDetail>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={event => {
        onOpenChange(event);
        setOpen(event.detail.open);
      }}
    >
      <h2 slot="title" aria-label="Details" />
    </Dialog>
  );
}

async function render(props: DialogProps) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  return rerender(props);
}

async function rerender(props: DialogProps) {
  await act(async () =>
    root?.render(
      <Dialog {...props}>
        <h2 slot="title" aria-label="Details" />
        <button type="button" aria-label="Continue" />
      </Dialog>
    )
  );
  const el = container?.querySelector('cosm-dialog') as CosmDialog;
  await act(async () => el.updateComplete);
  return el;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
  if (viewportWidth) Object.defineProperty(window, 'innerWidth', viewportWidth);
  else Reflect.deleteProperty(window, 'innerWidth');
});

describe('Dialog: shared scenarios', () => {
  for (const scenario of dialogScenariosFor('react')) {
    it(scenario.name, async () => {
      let cancel = false;
      const changes: Array<{ open: boolean; reason: string; canceled: boolean }> = [];
      const onOpenChange = (event: CustomEvent<DialogOpenChangeDetail>) => {
        if (!event.detail.open && cancel) event.preventDefault();
        changes.push({
          open: event.detail.open,
          reason: event.detail.reason,
          canceled: event.defaultPrevented,
        });
      };
      let props = { ...scenario.props, onOpenChange } as DialogProps;
      const el = await render(props);
      for (const [index, action] of scenario.actions.entries()) {
        cancel = 'cancel' in action && Boolean(action.cancel);
        if (action.type === 'sync' || action.type === 'set-default') {
          props = {
            ...props,
            ...(action.type === 'sync'
              ? { open: action.open }
              : { defaultOpen: action.defaultOpen }),
          };
          await rerender(props);
        } else {
          await act(async () => {
            if (action.type === 'open') el.requestOpen();
            if (action.type === 'action') el.requestClose();
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
          });
        }
        expect(el.open).toBe(scenario.expected.openAfterEachAction[index]);
      }
      expect(changes).toEqual(scenario.expected.changes);
    });
  }

  for (const scenario of dialogLayoutScenarios) {
    it(`layout: ${scenario.name}`, async () => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: scenario.viewportWidth,
      });
      const el = await render({ ...scenario.props, defaultOpen: true });
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
    });
  }
});

describe('Dialog: contract drift', () => {
  it('maps every contract event to its React name and DOM event', () => {
    expect(Object.keys(dialogEvents)).toEqual(eventNames(dialogContract, 'react'));
    expect(Object.values(dialogEvents)).toEqual(eventNames(dialogContract, 'dom'));
  });

  it('forwards every React contract prop including element references', async () => {
    const initialFocusTarget = document.createElement('button');
    const returnFocusTarget = document.createElement('button');
    const values = {
      open: false,
      defaultOpen: true,
      presentation: 'fullscreen',
      size: 'lg',
      maxWidth: 640,
      fullWidth: true,
      responsiveFullscreen: true,
      movable: true,
      moveControlsLabel: 'Move dialog',
      moveUpLabel: 'Move up',
      moveDownLabel: 'Move down',
      moveLeftLabel: 'Move left',
      moveRightLabel: 'Move right',
      moveCenterLabel: 'Center dialog',
      closeLabel: 'Dismiss',
      closeOnEscape: false,
      closeOnBackdropPress: true,
      initialFocusTarget,
      returnFocusTarget,
    } satisfies DialogProps;
    expect(Object.keys(values).sort()).toEqual(propNames(dialogContract, 'react').sort());
    const el = await render(values);
    for (const [name, value] of Object.entries(values)) {
      expect(el[name as keyof CosmDialog], name).toBe(value);
    }
    expect(el.openControlled).toBe(true);
    await rerender({ ...values, initialFocusTarget: null, returnFocusTarget: null });
    expect(el.initialFocusTarget).toBeNull();
    expect(el.returnFocusTarget).toBeNull();
  });
});

describe('Dialog: React integration', () => {
  it('falls back to the medium size when an explicit size and width are removed', async () => {
    const el = await render({
      defaultOpen: true,
      size: 'lg',
      maxWidth: 720,
      fullWidth: true,
      responsiveFullscreen: true,
      movable: true,
      moveUpLabel: 'Move upwards',
    });
    expect(el.size).toBe('lg');
    expect(el.maxWidth).toBe(720);
    await rerender({ defaultOpen: true });
    expect(el.size).toBe('md');
    expect(el.maxWidth).toBeUndefined();
    expect(el.fullWidth).toBe(false);
    expect(el.responsiveFullscreen).toBe(false);
    expect(el.movable).toBe(false);
    expect(el.moveUpLabel).toBe('Move up');
  });

  it('forwards the original cancelable event and exposes the imperative methods on the ref', async () => {
    const ref = { current: null as CosmDialog | null };
    const onOpenChange = vi.fn((event: CustomEvent<DialogOpenChangeDetail>) => {
      if (!event.detail.open) event.preventDefault();
    });

    const el = await render({ onOpenChange, ref });
    const domListener = vi.fn();
    el.addEventListener('cosm-open-change', domListener);
    await act(async () => {
      ref.current?.requestOpen();
      await el.updateComplete;
    });
    expect(el.open).toBe(true);
    await act(async () => {
      ref.current?.requestClose();
      await el.updateComplete;
    });
    expect(ref.current).toBe(el);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange.mock.calls[1]?.[0]).toBe(domListener.mock.calls[1]?.[0]);
    expect(onOpenChange.mock.calls[1]?.[0]).toBeInstanceOf(CustomEvent);
    expect(onOpenChange.mock.calls[1]?.[0].defaultPrevented).toBe(true);
    expect(el.open).toBe(true);
  });

  it('keeps controlled false and true unchanged until the owner updates them', async () => {
    const onOpenChange = vi.fn();
    const el = await render({ open: false, defaultOpen: true, onOpenChange });
    expect(el.open).toBe(false);
    expect(el.openControlled).toBe(true);
    await act(async () => {
      el.requestOpen();
      await el.updateComplete;
    });
    expect(el.open).toBe(false);
    await rerender({ open: true, onOpenChange });
    await act(async () => {
      el.requestClose();
      await el.updateComplete;
    });
    expect(el.open).toBe(true);
    expect(el.openControlled).toBe(true);
    expect(onOpenChange.mock.calls.map(([event]) => event.detail.open)).toEqual([true, false]);
    await rerender({ open: false, onOpenChange });
    expect(el.open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it.each([false, true])('releases controlled %s to autonomous state', async open => {
    const el = await render({ open });
    await rerender({});
    expect(el.openControlled).toBe(false);
    expect(el.open).toBe(open);
    await act(async () => {
      if (open) el.requestClose();
      else el.requestOpen();
      await el.updateComplete;
    });
    expect(el.open).toBe(!open);
  });

  it('initializes autonomous state from defaultOpen only once', async () => {
    const onOpenChange = vi.fn();
    const el = await render({ defaultOpen: true, onOpenChange });
    expect(el.open).toBe(true);
    await rerender({ defaultOpen: false, onOpenChange });
    expect(el.open).toBe(true);
    await act(async () => {
      el.requestClose();
      await el.updateComplete;
    });
    expect(el.open).toBe(false);
    await rerender({ defaultOpen: true, onOpenChange });
    expect(el.open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('synchronously applies an owner acceptance from the original event', async () => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const onOpenChange = vi.fn();
    await act(async () => root?.render(<Owner onOpenChange={onOpenChange} />));
    const el = container.querySelector('cosm-dialog') as CosmDialog;
    await act(async () => el.updateComplete);
    await act(async () => {
      el.requestOpen();
      expect(el.open).toBe(true);
      await el.updateComplete;
    });
    await act(async () => {
      el.requestClose();
      expect(el.open).toBe(false);
      await el.updateComplete;
    });
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });
});
