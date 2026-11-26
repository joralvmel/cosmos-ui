import {
  type DialogAction,
  type DialogOpenChangeDetail,
  dialogContract,
  dialogLayoutScenarios,
  dialogMovementScenarios,
  dialogScenariosFor,
  eventNames,
  propNames,
} from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CosmDialog } from '../src/components/dialog/cosm-dialog.js';

const viewportWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
const viewportHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
const visualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
afterEach(() => {
  document.body.replaceChildren();
  if (viewportWidth) Object.defineProperty(window, 'innerWidth', viewportWidth);
  else Reflect.deleteProperty(window, 'innerWidth');
  if (viewportHeight) Object.defineProperty(window, 'innerHeight', viewportHeight);
  else Reflect.deleteProperty(window, 'innerHeight');
  if (visualViewport) Object.defineProperty(window, 'visualViewport', visualViewport);
  else Reflect.deleteProperty(window, 'visualViewport');
  vi.restoreAllMocks();
});

async function setup(props: Record<string, unknown> = {}) {
  const invoker = document.createElement('button');
  invoker.textContent = 'Open';
  const el = document.createElement('cosm-dialog');
  const title = document.createElement('h2');
  title.slot = 'title';
  title.textContent = 'Dialog title';
  const body = document.createElement('button');
  body.textContent = 'Continue';
  el.append(title, body);
  Object.assign(el, props);
  document.body.append(invoker, el);
  invoker.focus();
  await el.updateComplete;
  return { el, invoker, title, body };
}

async function openMovementControls(el: CosmDialog) {
  const trigger = el.shadowRoot?.querySelector<HTMLElementTagNameMap['cosm-icon-button']>(
    'cosm-icon-button[part="move-trigger"]'
  );
  if (!trigger) throw new Error('dialog movement trigger missing');
  await trigger.updateComplete;
  trigger.click();
  await el.updateComplete;
}

function act(el: CosmDialog, action: DialogAction): void {
  switch (action.type) {
    case 'open':
      el.requestOpen();
      break;
    case 'action':
      el.requestClose();
      break;
    case 'sync':
      el.open = action.open;
      break;
    case 'set-default':
      el.defaultOpen = action.defaultOpen;
      break;
    case 'backdrop':
      el.shadowRoot?.querySelector<HTMLElement>('[part="backdrop"]')?.click();
      break;
    case 'escape':
      el.shadowRoot
        ?.querySelector('dialog')
        ?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
        );
      break;
    case 'close-button':
      el.shadowRoot?.querySelector<HTMLElement>('cosm-icon-button[part="close"]')?.click();
      break;
  }
}

describe('cosm-dialog: shared scenarios', () => {
  for (const scenario of dialogScenariosFor('web')) {
    it(scenario.name, async () => {
      const { el } = await setup(scenario.props);
      const changes: Array<{ open: boolean; reason: string; canceled: boolean }> = [];
      let cancel = false;
      el.addEventListener('cosm-open-change', ((event: CustomEvent<DialogOpenChangeDetail>) => {
        if (!event.detail.open && cancel) event.detail.preventDefault();
        changes.push({
          open: event.detail.open,
          reason: event.detail.reason,
          canceled: event.defaultPrevented,
        });
      }) as EventListener);
      for (const [index, action] of scenario.actions.entries()) {
        cancel = 'cancel' in action && Boolean(action.cancel);
        act(el, action);
        await el.updateComplete;
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
      const { el } = await setup({ ...scenario.props, defaultOpen: true });
      const dialog = el.shadowRoot?.querySelector('dialog');
      const fullscreen = dialog?.hasAttribute('data-fullscreen') ?? false;
      const value = el.style.getPropertyValue('--_cosm-dialog-max-width');
      const width = Number(value.match(/(\d+)px/)?.[1]);
      expect(fullscreen).toBe(scenario.expected.fullscreen);
      expect(fullscreen ? null : width).toBe(scenario.expected.maxWidth);
      expect(fullscreen || el.fullWidth).toBe(scenario.expected.fullWidth);
      expect(Boolean(el.shadowRoot?.querySelector('[part="move-controls"]'))).toBe(
        scenario.expected.movable
      );
    });
  }

  for (const scenario of dialogMovementScenarios) {
    it(`movement: ${scenario.name}`, async () => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 200 });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 120 });
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
      const { el } = await setup({
        defaultOpen: true,
        movable: scenario.movable,
        presentation: scenario.fullscreen ? 'fullscreen' : 'standard',
      });
      if (scenario.movable && !scenario.fullscreen) await openMovementControls(el);
      const base = el.shadowRoot?.querySelector<HTMLElement>('[part="base"]');
      const header = el.shadowRoot?.querySelector<HTMLElement>('[part="header"]');
      if (!base || !header) throw new Error('dialog surface or header missing');
      const current = () => {
        const values = base.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/);
        return { x: Number(values?.[1] ?? 0), y: Number(values?.[2] ?? 0) };
      };
      vi.spyOn(base, 'getBoundingClientRect').mockImplementation(() => {
        const { x, y } = current();
        return DOMRect.fromRect({
          x: -scenario.bounds.minX + x,
          y: -scenario.bounds.minY + y,
          width: 200 + scenario.bounds.minX - scenario.bounds.maxX,
          height: 120 + scenario.bounds.minY - scenario.bounds.maxY,
        });
      });
      for (const [index, action] of scenario.actions.entries()) {
        if (action.type === 'drag') {
          const pointer = (type: string, x: number, y: number) =>
            new PointerEvent(type, {
              bubbles: true,
              composed: true,
              isPrimary: true,
              pointerId: 7,
              button: 0,
              clientX: x,
              clientY: y,
            });
          header.dispatchEvent(pointer('pointerdown', 0, 0));
          header.dispatchEvent(pointer('pointermove', action.x, action.y));
          header.dispatchEvent(
            pointer(action.cancel ? 'pointercancel' : 'pointerup', action.x, action.y)
          );
        } else {
          const button = el.shadowRoot?.querySelector<
            HTMLElement & { updateComplete: Promise<unknown> }
          >(`[part="move-${action.type}"]`);
          await button?.updateComplete;
          button?.click();
        }
        expect(current()).toEqual(scenario.expected[index]);
      }
    });
  }
});

describe('cosm-dialog: contract drift', () => {
  it('exposes contract props and a bubbling composed event', async () => {
    expect(Object.keys(CosmDialog.properties).sort()).toEqual(
      propNames(dialogContract, 'web').sort()
    );
    const { el } = await setup({ defaultOpen: true });
    const listener = vi.fn();
    el.addEventListener(eventNames(dialogContract, 'dom')[0] as string, listener);
    el.requestClose();
    const event = listener.mock.calls[0]?.[0] as CustomEvent<DialogOpenChangeDetail>;
    expect(event).toMatchObject({ bubbles: true, composed: true, cancelable: true });
    expect(event.detail).toMatchObject({ open: false, reason: 'action' });
  });

  it('names the native modal using the slotted title and optional description containers', async () => {
    const { el, title } = await setup({ defaultOpen: true });
    const dialog = el.shadowRoot?.querySelector('dialog');
    expect(dialog?.open).toBe(true);
    expect(dialog?.getAttribute('aria-labelledby')).toBe('dialog-title');
    expect(
      el.shadowRoot?.getElementById('dialog-title')?.querySelector('slot')?.assignedElements()
    ).toContain(title);
    expect(dialog?.hasAttribute('aria-describedby')).toBe(false);
    const description = document.createElement('p');
    description.slot = 'description';
    description.textContent = 'Short description';
    el.append(description);
    el.shadowRoot
      ?.querySelector<HTMLSlotElement>('slot[name="description"]')
      ?.dispatchEvent(new Event('slotchange'));
    await el.updateComplete;
    expect(dialog?.getAttribute('aria-describedby')).toBe('dialog-description');
    expect(
      el.shadowRoot?.getElementById('dialog-description')?.querySelector('slot')?.assignedElements()
    ).toContain(description);
  });

  it('uses the localized decorative icon button and documented parts', async () => {
    const { el } = await setup({ closeLabel: 'Cerrar', defaultOpen: true, movable: true });
    const close = el.shadowRoot?.querySelector<HTMLElement & { label: string }>('[part="close"]');
    expect(close?.label).toBe('Cerrar');
    expect(close?.querySelector('cosm-icon')?.decorative).toBe(true);
    for (const name of Object.keys(dialogContract.parts)) {
      expect(el.shadowRoot?.querySelector(`[part="${name}"]`), name).toBeTruthy();
    }
  });

  it('re-snaps position when a viewport boundary moves', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 200 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 120 });
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
    const { el } = await setup({ defaultOpen: true, movable: true });
    await openMovementControls(el);
    const base = el.shadowRoot?.querySelector<HTMLElement>('[part="base"]');
    const right = el.shadowRoot?.querySelector<HTMLElement & { updateComplete: Promise<unknown> }>(
      '[part="move-right"]'
    );
    if (!base || !right) throw new Error('dialog movement controls not found');
    await right.updateComplete;
    vi.spyOn(base, 'getBoundingClientRect').mockImplementation(() => {
      const values = base.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/);
      return DOMRect.fromRect({
        x: 40 + Number(values?.[1] ?? 0),
        y: 30 + Number(values?.[2] ?? 0),
        width: 120,
        height: 60,
      });
    });
    right.click();
    right.click();
    expect(base.style.transform).toBe('translate(32px, 0px)');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 190 });
    window.dispatchEvent(new Event('resize'));
    await el.updateComplete;
    expect(base.style.transform).toBe('translate(30px, 0px)');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 200 });
    window.dispatchEvent(new Event('resize'));
    await el.updateComplete;
    expect(base.style.transform).toBe('translate(32px, 0px)');
  });

  it('localizes the movement controls and keeps focus inside on responsive fullscreen', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    const { el, body } = await setup({
      defaultOpen: true,
      movable: true,
      responsiveFullscreen: true,
      moveControlsLabel: 'Mover diálogo',
      moveRightLabel: 'Mover a la derecha',
    });

    expect(document.activeElement).toBe(body);
    const trigger = el.shadowRoot?.querySelector<HTMLElementTagNameMap['cosm-icon-button']>(
      'cosm-icon-button[part="move-trigger"]'
    );
    await trigger?.updateComplete;
    expect(trigger?.shadowRoot?.querySelector('button')?.getAttribute('aria-expanded')).toBe(
      'false'
    );
    expect(el.shadowRoot?.querySelector('[part="move-controls"]')?.hasAttribute('hidden')).toBe(
      true
    );
    await openMovementControls(el);
    expect(trigger?.shadowRoot?.querySelector('button')?.getAttribute('aria-expanded')).toBe(
      'true'
    );
    const group = el.shadowRoot?.querySelector('[part="move-controls"]');
    const right = el.shadowRoot?.querySelector<
      HTMLElement & { label: string; updateComplete: Promise<unknown> }
    >('[part="move-right"]');
    await right?.updateComplete;
    expect(group?.getAttribute('aria-label')).toBe('Mover diálogo');
    expect(right?.label).toBe('Mover a la derecha');
    expect(right?.querySelector('cosm-icon')?.decorative).toBe(true);
    right?.shadowRoot?.querySelector('button')?.focus();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 639 });
    window.dispatchEvent(new Event('resize'));
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('[part="move-controls"]')).toBeNull();
    expect(document.activeElement).toBe(body);
    expect(el.open).toBe(true);
  });

  it('collapses movement controls on demand and when the dialog is reopened', async () => {
    const { el } = await setup({ defaultOpen: true, movable: true });
    const trigger = el.shadowRoot?.querySelector<HTMLElementTagNameMap['cosm-icon-button']>(
      'cosm-icon-button[part="move-trigger"]'
    );
    const group = el.shadowRoot?.querySelector<HTMLElement>('[part="move-controls"]');
    if (!trigger || !group) throw new Error('dialog movement controls not found');
    await openMovementControls(el);
    expect(group.hidden).toBe(false);
    trigger.click();
    await el.updateComplete;
    expect(group.hidden).toBe(true);
    await openMovementControls(el);
    el.requestClose();
    await el.updateComplete;
    el.requestOpen();
    await el.updateComplete;
    expect(group.hidden).toBe(true);
  });

  it('focuses an explicit target and restores the invoker only after actual closure', async () => {
    const { el, invoker, body } = await setup();
    el.initialFocusTarget = body;
    el.requestOpen();
    await el.updateComplete;
    expect(document.activeElement).toBe(body);
    const cancel = (event: Event) => event.preventDefault();
    el.addEventListener('cosm-open-change', cancel);
    el.requestClose();
    await el.updateComplete;
    expect(document.activeElement).toBe(body);
    expect(el.open).toBe(true);
    el.removeEventListener('cosm-open-change', cancel);
    el.requestClose();
    await el.updateComplete;
    expect(document.activeElement).toBe(invoker);
  });

  it('honors an explicit return target', async () => {
    const { el } = await setup();
    const returnTarget = document.createElement('button');
    document.body.append(returnTarget);
    el.returnFocusTarget = returnTarget;
    el.requestOpen();
    await el.updateComplete;
    el.requestClose();
    await el.updateComplete;
    expect(document.activeElement).toBe(returnTarget);
  });

  it('wraps Tab and Shift+Tab between slotted controls and the shadow close button', async () => {
    const { el, body } = await setup({ defaultOpen: true });
    const close = el.shadowRoot?.querySelector('cosm-icon-button');
    await close?.updateComplete;
    const button = close?.shadowRoot?.querySelector('button');
    expect(button).toBeTruthy();
    body.focus();
    const forward = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    el.shadowRoot?.querySelector('dialog')?.dispatchEvent(forward);
    expect(forward.defaultPrevented).toBe(true);
    expect(close?.shadowRoot?.activeElement).toBe(button);
    const backward = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    button?.dispatchEvent(backward);
    expect(backward.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(body);
  });

  it('ignores Escape already handled by a child', async () => {
    const { el, body } = await setup({ defaultOpen: true });
    const listener = vi.fn();
    el.addEventListener('cosm-open-change', listener);
    body.addEventListener('keydown', event => event.preventDefault());
    body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(listener).not.toHaveBeenCalled();
  });

  it.each([
    { controlled: false, cancel: false, expectedOpen: false },
    { controlled: false, cancel: true, expectedOpen: true },
    { controlled: true, cancel: false, expectedOpen: true },
    { controlled: true, cancel: true, expectedOpen: true },
  ])('treats a dialog-method form as a cancelable action: $controlled / $cancel', async options => {
    const { el, body } = await setup(options.controlled ? { open: true } : { defaultOpen: true });
    const form = document.createElement('form');
    form.setAttribute('method', 'dialog');
    const submitter = document.createElement('button');
    submitter.type = 'submit';
    form.append(submitter);
    el.append(form);
    body.focus();
    const listener = vi.fn((event: Event) => {
      if (options.cancel) event.preventDefault();
    });
    el.addEventListener('cosm-open-change', listener);
    const submit = new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter });
    form.dispatchEvent(submit);
    await el.updateComplete;
    expect(submit.defaultPrevented).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
    expect(
      (listener.mock.calls[0]?.[0] as CustomEvent<DialogOpenChangeDetail> | undefined)?.detail
    ).toMatchObject({
      open: false,
      reason: 'action',
    });
    expect(el.open).toBe(options.expectedOpen);
    expect(el.shadowRoot?.querySelector('dialog')?.open).toBe(options.expectedOpen);
    if (options.expectedOpen) expect(document.activeElement).toBe(body);
    if (options.controlled && !options.cancel) {
      el.open = false;
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('dialog')?.open).toBe(false);
    }
  });

  it('respects formmethod overrides and consumer-canceled submissions', async () => {
    const { el } = await setup({ defaultOpen: true });
    const form = document.createElement('form');
    form.setAttribute('method', 'dialog');
    const submitter = document.createElement('button');
    submitter.setAttribute('formmethod', 'post');
    form.append(submitter);
    el.append(form);
    const listener = vi.fn();
    el.addEventListener('cosm-open-change', listener);
    const ordinary = new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter });
    form.dispatchEvent(ordinary);
    expect(ordinary.defaultPrevented).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    form.setAttribute('method', 'post');
    submitter.setAttribute('formmethod', 'dialog');
    form.addEventListener('submit', event => event.preventDefault(), { once: true });
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter }));
    expect(listener).not.toHaveBeenCalled();
    const dialogSubmit = new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter });
    form.dispatchEvent(dialogSubmit);
    await el.updateComplete;
    expect(dialogSubmit.defaultPrevented).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
    expect(el.open).toBe(false);
  });

  it('does not intercept a nested consumer-owned native dialog form', async () => {
    const { el } = await setup({ defaultOpen: true });
    const nested = document.createElement('dialog');
    const form = document.createElement('form');
    form.setAttribute('method', 'dialog');
    nested.append(form);
    el.append(nested);
    const listener = vi.fn();
    el.addEventListener('cosm-open-change', listener);
    const submit = new SubmitEvent('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    expect(el.open).toBe(true);
  });

  it.each([false, true])(
    'recovers an unexpected native close while open, controlled=%s',
    async controlled => {
      const { el, invoker, body } = await setup(
        controlled ? { open: true } : { defaultOpen: true }
      );
      const dialog = el.shadowRoot?.querySelector('dialog');
      expect(dialog).toBeTruthy();
      body.focus();
      const listener = vi.fn();
      el.addEventListener('cosm-open-change', listener);
      dialog?.close();
      dialog?.dispatchEvent(new Event('close'));
      expect(dialog?.open).toBe(true);
      expect(el.open).toBe(true);
      expect(listener).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(body);
      if (controlled) el.open = false;
      else el.requestClose();
      await el.updateComplete;
      dialog?.dispatchEvent(new Event('close'));
      expect(dialog?.open).toBe(false);
      expect(document.activeElement).toBe(invoker);
    }
  );

  it('preserves the last focused control when native reopening moves focus first', async () => {
    const { el, body } = await setup({ defaultOpen: true });
    const dialog = el.shadowRoot?.querySelector('dialog');
    const close = el.shadowRoot?.querySelector('cosm-icon-button');
    await close?.updateComplete;
    const nativeButton = close?.shadowRoot?.querySelector('button');
    if (!dialog || !nativeButton) throw new Error('dialog controls not found');
    const focusEvent = (target: HTMLElement) => {
      const event = new FocusEvent('focusin', { bubbles: true, composed: true });
      Object.defineProperty(event, 'composedPath', { value: () => [target, dialog] });
      dialog.dispatchEvent(event);
    };
    body.focus();
    focusEvent(body);
    const showModal = dialog.showModal.bind(dialog);
    vi.spyOn(dialog, 'showModal').mockImplementation(() => {
      showModal();
      nativeButton.focus();
      focusEvent(nativeButton);
    });
    dialog.close();
    dialog.dispatchEvent(new Event('close'));
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(body);
  });
});
