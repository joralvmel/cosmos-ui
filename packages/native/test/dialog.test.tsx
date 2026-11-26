import {
  type DialogAction,
  type DialogHandle,
  type DialogOpenChangeDetail,
  dialogContract,
  dialogLayoutScenarios,
  dialogMovementScenarios,
  dialogScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Dialog, type DialogProps, dialogPropNames } from '../src/index.js';
import {
  clampDialogMovement,
  dialogMovementStops,
  snapDialogMovement,
  snapDialogMovementValue,
  stepDialogMovementValue,
} from '../src/internal/dialog-movement.js';
import {
  __accessibilityFocusCalls,
  __accessibilityFocusedNodes,
  __dispatchModalRequestClose,
  __dispatchPanResponder,
  __resetLayouts,
  __resetPanResponder,
  __setLayoutForTest,
  __setPlatformOS,
  __setReducedMotion,
  __setWindowDimensions,
} from './react-native.mock.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let container: HTMLElement | undefined;

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container;
}

function target<T extends HTMLElement = HTMLElement>(testID: string): T {
  const element = document.body.querySelector<T>(`[data-testid="${testID}"]`);
  if (!element) throw new Error(`Missing Dialog target: ${testID}`);
  return element;
}

async function renderScenario(
  scenarioProps: DialogProps,
  handle: { current: DialogHandle | null },
  onProposal: (detail: DialogOpenChangeDetail) => void,
  controlledOpen: boolean | undefined,
  defaultOpen: boolean | undefined
) {
  await act(async () => {
    root?.render(
      <Dialog
        {...scenarioProps}
        open={controlledOpen}
        defaultOpen={defaultOpen}
        title="Dialog title"
        testID="subject"
        ref={handle}
        onOpenChange={onProposal}
      >
        Dialog body
      </Dialog>
    );
  });
}

async function performScenarioAction(
  action: DialogAction,
  handle: { current: DialogHandle | null },
  syncOpen: (open: boolean) => Promise<void>,
  setDefault: (open: boolean) => Promise<void>
) {
  await act(async () => {
    switch (action.type) {
      case 'open':
        handle.current?.requestOpen();
        break;
      case 'action':
        handle.current?.requestClose();
        break;
      case 'close-button':
        target<HTMLButtonElement>('subject-close').click();
        break;
      case 'escape':
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
        );
        document.dispatchEvent(
          new KeyboardEvent('keyup', { key: 'Escape', bubbles: true, cancelable: true })
        );
        break;
      case 'back':
        __dispatchModalRequestClose();
        break;
      case 'backdrop':
        target<HTMLButtonElement>('subject-backdrop').click();
        break;
      case 'sync':
        await syncOpen(action.open);
        break;
      case 'set-default':
        await setDefault(action.defaultOpen);
        break;
    }
  });
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  container = undefined;
  root = undefined;
  __setPlatformOS('web');
  __setReducedMotion(false);
  __setWindowDimensions();
  __resetLayouts();
  __resetPanResponder();
  __accessibilityFocusCalls.length = 0;
  __accessibilityFocusedNodes.length = 0;
});

describe('Dialog (native): shared scenarios', () => {
  for (const scenario of dialogScenariosFor('native')) {
    it(scenario.name, async () => {
      if (scenario.actions.some(action => action.type === 'back')) __setPlatformOS('android');
      const handle: { current: DialogHandle | null } = { current: null };
      const changes: { open: boolean; reason: string; canceled: boolean }[] = [];
      let controlledOpen = scenario.props.open;
      let defaultOpen = scenario.props.defaultOpen;
      let cancel = false;
      const onProposal = (detail: DialogOpenChangeDetail) => {
        if (detail.open === false && cancel) detail.preventDefault();
        changes.push({
          open: detail.open,
          reason: detail.reason,
          canceled: detail.open === false && detail.defaultPrevented,
        });
        cancel = false;
      };
      const props = scenario.props as DialogProps;
      await render(
        <Dialog
          {...props}
          open={controlledOpen}
          defaultOpen={defaultOpen}
          title="Dialog title"
          onOpenChange={onProposal}
          ref={handle}
          testID="subject"
        >
          Dialog body
        </Dialog>
      );
      for (let index = 0; index < scenario.actions.length; index += 1) {
        const action = scenario.actions[index];
        if (!action) continue;
        cancel = 'cancel' in action && Boolean(action.cancel);
        await performScenarioAction(
          action,
          handle,
          async next => {
            controlledOpen = next;
            await renderScenario(props, handle, onProposal, controlledOpen, defaultOpen);
          },
          async next => {
            defaultOpen = next;
            await renderScenario(props, handle, onProposal, controlledOpen, defaultOpen);
          }
        );
        expect(Boolean(document.body.querySelector('[data-testid="subject"]'))).toBe(
          scenario.expected.openAfterEachAction[index]
        );
      }
      expect(changes).toEqual(scenario.expected.changes);
    });
  }
});

describe('Dialog (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...dialogPropNames].sort()).toEqual(propNames(dialogContract, 'native').sort());
  });
});

describe('Dialog (native): shared movement scenarios', () => {
  for (const scenario of dialogMovementScenarios) {
    it(scenario.name, () => {
      const bounds = scenario.bounds;
      let position = { x: 0, y: 0 };
      for (const action of scenario.actions) {
        if (!scenario.movable || scenario.fullscreen) {
          position = { x: 0, y: 0 };
        } else if (action.type === 'center') {
          position = snapDialogMovement({ x: 0, y: 0 }, bounds);
        } else if (action.type === 'drag') {
          if (!action.cancel) {
            position = snapDialogMovement(
              clampDialogMovement({ x: position.x + action.x, y: position.y + action.y }, bounds),
              bounds
            );
          }
        } else if (action.type === 'left' || action.type === 'right') {
          position = {
            ...position,
            x: stepDialogMovementValue(
              position.x,
              action.type === 'right' ? 1 : -1,
              bounds.minX,
              bounds.maxX
            ),
          };
        } else {
          position = {
            ...position,
            y: stepDialogMovementValue(
              position.y,
              action.type === 'down' ? 1 : -1,
              bounds.minY,
              bounds.maxY
            ),
          };
        }
        expect(position).toEqual(scenario.expected[scenario.actions.indexOf(action)]);
      }
    });
  }

  it('creates a shared center-relative grid with exact reachable boundaries', () => {
    expect(dialogMovementStops(-40.5, 35.25)).toEqual([-40.5, -32, -16, 0, 16, 32, 35.25]);
    expect(snapDialogMovementValue(8, -40, 40)).toBe(0);
    expect(snapDialogMovementValue(-8, -40, 40)).toBe(-16);
    expect(stepDialogMovementValue(16, 1, -1, 16.0005)).toBe(16.0005);
  });
});

describe('Dialog (native)', () => {
  it('renders a named modal with localized 44-point close action and separate body/actions', async () => {
    await render(
      <Dialog
        defaultOpen
        title="Confirm booking"
        description="Review the details before continuing."
        closeLabel="Cerrar diálogo"
        testID="subject"
        actions={<button type="button">Confirm booking</button>}
      >
        <p>Booking details</p>
      </Dialog>
    );
    const surface = target('subject');
    const modal = target('subject-modal');
    const labelId = modal.getAttribute('aria-labelledby');
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-modal')).toBe('true');
    expect(surface.getAttribute('role')).toBeNull();
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId ?? '')?.textContent).toBe('Confirm booking');
    const descriptionId = modal.getAttribute('aria-describedby');
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId ?? '')?.textContent).toContain(
      'Review the details'
    );
    expect(target('subject-body').textContent).toContain('Booking details');
    expect(target('subject-actions').textContent).toContain('Confirm booking');
    const close = target<HTMLButtonElement>('subject-close');
    expect(close.getAttribute('aria-label')).toBe('Cerrar diálogo');
    expect(close.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    const closeStyle = JSON.parse(close.getAttribute('data-style') ?? '{}') as {
      minHeight?: number;
      minWidth?: number;
    };
    expect(closeStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(closeStyle.minWidth).toBeGreaterThanOrEqual(44);
  });

  it('sizes standard content to the available maximum and supports fullscreen', async () => {
    await render(
      <Dialog
        defaultOpen
        maxWidth={480}
        title="Standard"
        testID="standard"
        actions={<button type="button">Done</button>}
      >
        A short body
      </Dialog>
    );
    const standardStyle = JSON.parse(target('standard').getAttribute('data-style') ?? '{}') as {
      maxWidth?: number;
    };
    expect(standardStyle.maxWidth).toBeLessThanOrEqual(480);
    await act(async () => root?.unmount());
    container?.remove();
    root = undefined;
    container = undefined;
    await render(
      <Dialog
        defaultOpen
        presentation="fullscreen"
        maxWidth={200}
        title="Full screen"
        testID="fullscreen"
      >
        Long content
      </Dialog>
    );
    const fullscreenStyle = JSON.parse(target('fullscreen').getAttribute('data-style') ?? '{}') as {
      width?: string;
      height?: string;
      borderRadius?: number;
      flex?: number;
    };
    expect(fullscreenStyle).toMatchObject({
      width: '100%',
      height: '100%',
      borderRadius: 0,
      flex: 1,
    });
  });

  it('applies semantic sizes, explicit maximums, full width and responsive fullscreen', async () => {
    for (const scenario of dialogLayoutScenarios) {
      __setWindowDimensions({ width: scenario.viewportWidth, height: 800 });
      await render(
        <Dialog {...scenario.props} defaultOpen title={scenario.name} testID="subject">
          Body
        </Dialog>
      );
      const style = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
        width?: string;
        height?: string;
        maxWidth?: number;
      };
      expect(style.maxWidth ?? null).toBe(
        scenario.expected.fullscreen
          ? null
          : Math.min(
              scenario.expected.maxWidth ?? Number.POSITIVE_INFINITY,
              scenario.viewportWidth - 2 * 16
            )
      );
      expect(style.width === '100%').toBe(
        scenario.expected.fullscreen || scenario.expected.fullWidth
      );
      if (scenario.expected.fullscreen) expect(style.height).toBe('100%');
      expect(Boolean(document.body.querySelector('[data-testid="subject-move-trigger"]'))).toBe(
        scenario.expected.movable
      );
      expect(document.body.querySelector('[data-testid="subject-move-controls"]')).toBeNull();
      await act(async () => root?.unmount());
      container?.remove();
      root = undefined;
      container = undefined;
    }
  });

  it('renders localized 44-point directional controls and moves on the shared grid', async () => {
    __setPlatformOS('android');
    __setWindowDimensions({ width: 228, height: 152 });
    __setLayoutForTest('subject-viewport', { x: 0, y: 0, width: 228, height: 152 });
    __setLayoutForTest('subject', { x: 0, y: 0, width: 100, height: 44 });
    await render(
      <Dialog
        defaultOpen
        movable
        title="Movable"
        moveControlsLabel="Mover diálogo"
        moveUpLabel="Subir"
        moveDownLabel="Bajar"
        moveLeftLabel="Izquierda"
        moveRightLabel="Derecha"
        moveCenterLabel="Centrar"
        testID="subject"
      >
        Body
      </Dialog>
    );
    const focusCallsAfterOpen = __accessibilityFocusCalls.length;
    const trigger = target<HTMLButtonElement>('subject-move-trigger');
    expect(trigger.getAttribute('aria-label')).toBe('Mover diálogo');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.body.querySelector('[data-testid="subject-move-controls"]')).toBeNull();
    await act(async () => trigger.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const group = target('subject-move-controls');
    expect(group.getAttribute('aria-label')).toBe('Mover diálogo');
    const right = target<HTMLButtonElement>('subject-move-right');
    expect(right.getAttribute('aria-label')).toBe('Derecha');
    const buttonStyle = JSON.parse(right.getAttribute('data-style') ?? '{}') as {
      minHeight?: number;
      minWidth?: number;
    };
    expect(buttonStyle.minHeight).toBeGreaterThanOrEqual(44);
    expect(buttonStyle.minWidth).toBeGreaterThanOrEqual(44);

    await act(async () => right.click());
    let surfaceStyle = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(surfaceStyle.transform).toEqual([{ translateX: 16 }, { translateY: 0 }]);
    await act(async () => target<HTMLButtonElement>('subject-move-down').click());
    surfaceStyle = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(surfaceStyle.transform).toEqual([{ translateX: 16 }, { translateY: 16 }]);
    await act(async () => target<HTMLButtonElement>('subject-move-center').click());
    surfaceStyle = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(surfaceStyle.transform).toEqual([{ translateX: 0 }, { translateY: 0 }]);
    expect(__accessibilityFocusCalls).toHaveLength(focusCallsAfterOpen);
  });

  it('snaps free drags to reachable boundaries and restores canceled drags', async () => {
    __setWindowDimensions({ width: 228, height: 152 });
    __setLayoutForTest('subject-viewport', { x: 0, y: 0, width: 228, height: 152 });
    __setLayoutForTest('subject', { x: 0, y: 0, width: 100, height: 44 });
    await render(
      <Dialog defaultOpen movable title="Drag" testID="subject">
        Body
      </Dialog>
    );
    const titleID = 'subject-title';
    expect(__dispatchPanResponder(titleID, 'onStartShouldSetResponder')).toBe(true);
    expect(__dispatchPanResponder(titleID, 'onMoveShouldSetResponder', { dx: 8, dy: 0 })).toBe(
      true
    );
    await act(async () => {
      __dispatchPanResponder(titleID, 'onResponderGrant');
      __dispatchPanResponder(titleID, 'onResponderMove', { dx: 100, dy: -100 });
      __dispatchPanResponder(titleID, 'onResponderRelease', { dx: 100, dy: -100 });
    });
    let style = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(style.transform).toEqual([{ translateX: 48 }, { translateY: -38 }]);

    await act(async () => target<HTMLButtonElement>('subject-move-trigger').click());
    await act(async () => target<HTMLButtonElement>('subject-move-center').click());
    await act(async () => {
      __dispatchPanResponder(titleID, 'onResponderGrant');
      __dispatchPanResponder(titleID, 'onResponderMove', { dx: 20, dy: 20 });
      __dispatchPanResponder(titleID, 'onResponderTerminate');
    });
    style = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(style.transform).toEqual([{ translateX: 0 }, { translateY: 0 }]);

    for (let index = 0; index < 3; index += 1) {
      await act(async () => target<HTMLButtonElement>('subject-move-right').click());
    }
    style = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(style.transform?.[0]?.translateX).toBe(48);
  });

  it('Escape aborts an active web drag without closing or moving focus', async () => {
    __setPlatformOS('web');
    __setWindowDimensions({ width: 228, height: 152 });
    __setLayoutForTest('subject-viewport', { x: 0, y: 0, width: 228, height: 152 });
    __setLayoutForTest('subject', { x: 0, y: 0, width: 100, height: 44 });
    await render(
      <Dialog defaultOpen movable title="Abort drag" testID="subject">
        Body
      </Dialog>
    );
    const titleID = 'subject-title';
    await act(async () => {
      __dispatchPanResponder(titleID, 'onResponderGrant');
      __dispatchPanResponder(titleID, 'onResponderMove', { dx: 32, dy: 0 });
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
      document.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'Escape', bubbles: true, cancelable: true })
      );
    });
    expect(target('subject')).toBeTruthy();
    const style = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(style.transform).toEqual([{ translateX: 0 }, { translateY: 0 }]);
  });

  it('collapses movement controls on Escape before closing the web modal', async () => {
    __setPlatformOS('web');
    await render(
      <Dialog defaultOpen movable title="Movement" testID="subject">
        <button type="button">Content</button>
      </Dialog>
    );
    const trigger = target<HTMLButtonElement>('subject-move-trigger');
    await act(async () => trigger.click());
    expect(target('subject-move-controls')).toBeTruthy();
    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
      document.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'Escape', bubbles: true, cancelable: true })
      );
    });
    expect(document.body.querySelector('[data-testid="subject-move-controls"]')).toBeNull();
    expect(target('subject')).toBeTruthy();
    expect(document.activeElement).toBe(trigger);
  });

  it('re-snaps position to new bounds and resets when movement is disabled', async () => {
    __setWindowDimensions({ width: 228, height: 152 });
    __setLayoutForTest('subject-viewport', { x: 0, y: 0, width: 228, height: 152 });
    __setLayoutForTest('subject', { x: 0, y: 0, width: 100, height: 44 });
    const renderDialog = (movable: boolean) => (
      <Dialog defaultOpen movable={movable} title="Resize movement" testID="subject">
        Body
      </Dialog>
    );
    await render(renderDialog(true));
    await act(async () => target<HTMLButtonElement>('subject-move-trigger').click());
    for (let index = 0; index < 3; index += 1) {
      await act(async () => target<HTMLButtonElement>('subject-move-right').click());
    }

    __setWindowDimensions({ width: 164, height: 152 });
    __setLayoutForTest('subject-viewport', { x: 0, y: 0, width: 164, height: 152 });
    await act(async () => root?.render(renderDialog(true)));
    let style = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(style.transform).toEqual([{ translateX: 16 }, { translateY: 0 }]);

    await act(async () => root?.render(renderDialog(false)));
    style = JSON.parse(target('subject').getAttribute('data-style') ?? '{}') as {
      transform?: { translateX: number }[];
    };
    expect(style.transform).toBeUndefined();
    expect(document.body.querySelector('[data-testid="subject-move-controls"]')).toBeNull();
  });

  it('keeps focus within the web modal, makes the background inert, and restores focus on close', async () => {
    __setPlatformOS('web');
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () =>
      root?.render(
        <div>
          <button type="button" data-testid="invoker">
            Open
          </button>
        </div>
      )
    );
    const invoker = target<HTMLButtonElement>('invoker');
    await act(async () => invoker.focus());
    await act(async () =>
      root?.render(
        <div>
          <button type="button" data-testid="invoker">
            Open
          </button>
          <Dialog
            defaultOpen
            title="Web modal"
            testID="subject"
            actions={
              <button type="button" data-testid="last-action">
                Continue
              </button>
            }
          >
            <button type="button" data-testid="first-action">
              First
            </button>
          </Dialog>
        </div>
      )
    );
    const first = target<HTMLButtonElement>('first-action');
    const last = target<HTMLButtonElement>('last-action');
    expect(document.activeElement).toBe(first);
    expect(container?.inert).toBe(true);
    expect(container?.getAttribute('aria-hidden')).toBe('true');
    await act(async () => {
      last.focus();
      last.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
      );
    });
    expect(document.activeElement).toBe(target<HTMLButtonElement>('subject-close'));
    await act(async () => {
      target<HTMLButtonElement>('subject-close').focus();
      target<HTMLButtonElement>('subject-close').dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
    });
    expect(document.activeElement).toBe(last);
    await act(async () => target<HTMLButtonElement>('subject-close').click());
    expect(document.activeElement).toBe(invoker);
    expect(container?.inert).toBe(false);
    expect(container?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('keeps visibility and focus when a close request is synchronously canceled', async () => {
    const handle: { current: DialogHandle | null } = { current: null };
    let activeBeforeClose: Element | null = null;
    await render(
      <>
        <button type="button" data-testid="invoker">
          Open
        </button>
        <Dialog
          defaultOpen
          title="Cancelable"
          testID="subject"
          ref={handle}
          onOpenChange={detail => {
            if (detail.open === false) detail.preventDefault();
          }}
        >
          <button type="button" data-testid="inside">
            Stay here
          </button>
        </Dialog>
      </>
    );
    await act(async () => target<HTMLButtonElement>('inside').focus());
    activeBeforeClose = document.activeElement;
    await act(async () => handle.current?.requestClose());
    expect(target('subject')).toBeTruthy();
    expect(document.activeElement).toBe(activeBeforeClose);
  });

  it('uses the consumer initial-focus target when it is mounted inside the dialog', async () => {
    const focusTarget: { current: HTMLElement | null } = { current: null };
    await render(
      <Dialog defaultOpen title="Initial focus" testID="subject" initialFocusTarget={focusTarget}>
        <button
          ref={node => {
            focusTarget.current = node;
          }}
          type="button"
          data-testid="focus-target"
        >
          Focus me
        </button>
      </Dialog>
    );
    expect(document.activeElement).toBe(target<HTMLButtonElement>('focus-target'));
  });

  it('uses the React Native Web modal Escape request and preserves child handling', async () => {
    __setPlatformOS('web');
    let closeReason: string | undefined;
    await render(
      <Dialog
        defaultOpen
        title="Escape behavior"
        testID="subject"
        onOpenChange={detail => {
          if (detail.open === false) closeReason = detail.reason;
        }}
      >
        <button type="button" data-testid="escape-button">
          Close on Escape
        </button>
      </Dialog>
    );
    const escapeButton = target<HTMLButtonElement>('escape-button');
    await act(async () => {
      escapeButton.focus();
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
      document.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'Escape', bubbles: true, cancelable: true })
      );
    });
    expect(closeReason).toBe('escape');
    expect(document.body.querySelector('[data-testid="subject"]')).toBeNull();

    await act(async () => root?.unmount());
    container?.remove();
    root = undefined;
    container = undefined;
    await render(
      <Dialog
        defaultOpen
        title="Escape handled by child"
        testID="subject"
        onOpenChange={detail => {
          if (detail.open === false) closeReason = detail.reason;
        }}
      >
        <button
          type="button"
          data-testid="child-handled"
          onKeyDown={event => {
            if (event.key === 'Escape') event.preventDefault();
          }}
        >
          Keep open
        </button>
      </Dialog>
    );
    const previousReason = closeReason;
    const childHandled = target<HTMLButtonElement>('child-handled');
    await act(async () => {
      childHandled.focus();
      childHandled.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
      document.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'Escape', bubbles: true, cancelable: true })
      );
    });
    expect(target('subject')).toBeTruthy();
    expect(closeReason).toBe(previousReason);
  });

  it('uses the platform modal-isolation semantic on iOS', async () => {
    __setPlatformOS('ios');
    await render(
      <Dialog defaultOpen title="iOS modal" testID="subject">
        Content
      </Dialog>
    );
    const surface = target('subject');
    expect(surface.getAttribute('role')).toBe('dialog');
    expect(surface.getAttribute('data-role')).toBeNull();
    expect(surface.getAttribute('data-accessibility-modal')).toBe('true');
  });

  it('keeps Android Back consumed and the dialog open when its close request is vetoed', async () => {
    __setPlatformOS('android');
    await render(
      <Dialog
        defaultOpen
        title="Back veto"
        testID="subject"
        onOpenChange={detail => {
          if (detail.open === false) detail.preventDefault();
        }}
      >
        Content
      </Dialog>
    );
    __dispatchModalRequestClose();
    expect(target('subject')).toBeTruthy();
  });

  it('uses the consumer initial-focus target on native platforms', async () => {
    __setPlatformOS('android');
    const initialTarget: { current: HTMLButtonElement | null } = { current: null };
    await render(
      <Dialog
        defaultOpen
        title="Native initial focus"
        testID="subject"
        initialFocusTarget={initialTarget}
      >
        <button
          ref={node => {
            initialTarget.current = node;
          }}
          type="button"
          data-testid="native-initial-target"
        >
          Focus this
        </button>
      </Dialog>
    );
    expect(__accessibilityFocusedNodes.at(-1)).toBe(
      target<HTMLButtonElement>('native-initial-target')
    );
  });

  it('uses the title as native initial focus and does not claim automatic return without a target', async () => {
    __setPlatformOS('android');
    const handle: { current: DialogHandle | null } = { current: null };
    await render(
      <>
        <button type="button" data-testid="native-invoker">
          Open
        </button>
        <Dialog defaultOpen title="Native default focus" testID="subject" ref={handle}>
          <button type="button">Inside</button>
        </Dialog>
      </>
    );
    expect(__accessibilityFocusedNodes.at(-1)).toBe(target('subject-title'));
    const focusCallsAfterOpen = __accessibilityFocusCalls.length;
    await act(async () => handle.current?.requestClose());
    expect(__accessibilityFocusCalls).toHaveLength(focusCallsAfterOpen);
    expect(target('native-invoker')).toBeTruthy();
  });

  it('returns accessibility focus to the caller-supplied native target after close', async () => {
    __setPlatformOS('android');
    const handle: { current: DialogHandle | null } = { current: null };
    const returnTarget = document.createElement('button');
    document.body.append(returnTarget);
    await render(
      <Dialog
        defaultOpen
        title="Native focus"
        testID="subject"
        ref={handle}
        returnFocusTarget={returnTarget as unknown as DialogProps['returnFocusTarget']}
      >
        Content
      </Dialog>
    );
    await act(async () => handle.current?.requestClose());
    expect(__accessibilityFocusCalls.length).toBeGreaterThan(0);
    expect(__accessibilityFocusedNodes.at(-1)).toBe(returnTarget);
    returnTarget.remove();
  });

  it('disables the presentation animation when reduced motion is enabled', async () => {
    __setReducedMotion(true);
    await render(
      <Dialog defaultOpen title="Reduced motion" testID="subject">
        Content
      </Dialog>
    );
    await act(async () => Promise.resolve());
    expect(target('subject-modal').getAttribute('data-animation-type')).toBe('none');
  });

  it('rejects invalid width and close labels', () => {
    expect(() => Dialog({ title: 'Invalid', maxWidth: 0 } as DialogProps)).toThrow(/maxWidth/);
    expect(() => Dialog({ title: 'Invalid', closeLabel: '  ' } as DialogProps)).toThrow(
      /closeLabel/
    );
    expect(() => Dialog({ title: 'Invalid', moveRightLabel: '  ' } as DialogProps)).toThrow(
      /moveRightLabel/
    );
  });
});
