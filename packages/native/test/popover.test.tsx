import {
  eventNames,
  type PopoverOpenChangeDetail,
  popoverContract,
  popoverScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import { info } from '@joralvmel/cosmos-icons/info';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CosmosThemeProvider,
  Icon,
  IconButton,
  Popover,
  type PopoverHandle,
  type PopoverProps,
  PopoverProvider,
  popoverPropNames,
  usePopoverHost,
} from '../src/index.js';
import {
  __accessibilityFocusCalls,
  __setPlatformOS,
  __setPressableRect,
  BackHandler,
} from './react-native.mock.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const runtime = vi.hoisted(() => ({ nativeWeb: false }));

vi.mock('react-native', async importOriginal => {
  const native = await importOriginal<typeof import('./react-native.mock.js')>();
  // @ts-expect-error React Native Web does not publish declarations in this workspace.
  const nativeWeb = await import('react-native-web');
  const { createElement } = await import('react');
  return {
    ...native,
    Pressable: (props: Parameters<typeof native.Pressable>[0]) =>
      createElement(runtime.nativeWeb ? nativeWeb.Pressable : native.Pressable, props),
  };
});

let root: Root | undefined;
let container: HTMLElement | undefined;

beforeEach(() => vi.useFakeTimers());

async function frames() {
  await act(async () => vi.advanceTimersByTimeAsync(20));
}

function target(id: string) {
  const element = container?.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!element) throw new Error(`Missing test target: ${id}`);
  return element;
}

async function render(node: ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  await act(async () => container?.querySelector<HTMLElement>('[data-testid="trigger"]')?.focus());
  await frames();
  return container;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  BackHandler.__reset();
  __setPlatformOS('web');
  __setPressableRect();
  runtime.nativeWeb = false;
  __accessibilityFocusCalls.length = 0;
  vi.useRealTimers();
});

function pointer(target: Element, type: 'pointerdown' | 'pointerup', x = 200, y = 200) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  target.dispatchEvent(event);
  return event;
}

function touch(host: Element, type: 'touchstart' | 'touchend', x = 200, y = 200) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperties(event, {
    pageX: { value: x },
    pageY: { value: y },
  });
  host.dispatchEvent(event);
}

type PopoverScenarioProps = Omit<PopoverProps, 'trigger'>;

function ScenarioHarness({
  initialProps,
  onProposal,
  reference,
  panelHasFocusableContent = true,
  onOutsidePress,
}: {
  initialProps: PopoverScenarioProps;
  onProposal: (detail: PopoverOpenChangeDetail) => void;
  reference?: { current: PopoverHandle | null };
  panelHasFocusableContent?: boolean;
  onOutsidePress: () => void;
}) {
  const [controlledOpen, setControlledOpen] = useState(initialProps.open);
  const [defaultOpen, setDefaultOpen] = useState(initialProps.defaultOpen);
  const props: PopoverProps = {
    ...initialProps,
    defaultOpen,
    ...(initialProps.open !== undefined ? { open: controlledOpen } : {}),
    onOpenChange: onProposal,
    ref: reference,
    trigger: 'Open details',
    testID: 'trigger',
    panelTestID: 'panel',
  };
  return (
    <PopoverProvider>
      <Popover {...props}>
        {panelHasFocusableContent ? (
          <button type="button" data-testid="panel-first">
            Panel action
          </button>
        ) : (
          'Popover content'
        )}
      </Popover>
      <button type="button" data-testid="outside" onClick={onOutsidePress}>
        Outside
      </button>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: contract fixture is deliberately nonfocusable. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: contract fixture preserves focus during an outside press. */}
      <div data-testid="outside-static" onClick={onOutsidePress} />
      <button type="button" data-testid="sync-open" onClick={() => setControlledOpen(true)}>
        sync open
      </button>
      <button type="button" data-testid="sync-close" onClick={() => setControlledOpen(false)}>
        sync close
      </button>
      <button type="button" data-testid="change-default" onClick={() => setDefaultOpen(false)}>
        change default
      </button>
      <button
        type="button"
        data-testid="request-close"
        onClick={() => reference?.current?.requestClose()}
      >
        Request close
      </button>
    </PopoverProvider>
  );
}

function ScrollHookProbe() {
  const host = usePopoverHost();
  return (
    <button type="button" onClick={host.onScroll} data-testid="scroll">
      Scroll
    </button>
  );
}

function TouchFixture({ composed, changes }: { composed: boolean; changes: string[] }) {
  const [, rerender] = useState(0);
  return (
    <PopoverProvider>
      <Popover
        triggerMode="hover"
        trigger={
          composed
            ? props => (
                <IconButton {...props} testID="touch-trigger" label="Details">
                  <Icon icon={info} />
                </IconButton>
              )
            : 'Details'
        }
        testID="touch-trigger"
        panelTestID="panel"
        onOpenChange={detail => {
          changes.push(`${detail.open}:${detail.reason}`);
          rerender(value => value + 1);
        }}
      >
        Panel
      </Popover>
    </PopoverProvider>
  );
}

describe('Popover (native): shared scenarios', () => {
  for (const scenario of popoverScenariosFor('native')) {
    it(scenario.name, async () => {
      if (scenario.actions.some(action => action.type === 'back')) __setPlatformOS('android');
      const proposals: { open: boolean; reason: string; canceled: boolean }[] = [];
      let cancelProposal = false;
      const reference = { current: null as PopoverHandle | null };
      const outsidePress = vi.fn();
      const proposal = (detail: PopoverOpenChangeDetail) => {
        if (cancelProposal && !detail.open) detail.preventDefault();
        proposals.push({
          open: detail.open,
          reason: detail.reason,
          canceled: !detail.open && detail.defaultPrevented,
        });
        cancelProposal = false;
      };
      await render(
        <ScenarioHarness
          initialProps={scenario.props}
          onProposal={proposal}
          reference={reference}
          panelHasFocusableContent={scenario.fixture?.panelHasFocusableContent}
          onOutsidePress={outsidePress}
        />
      );
      const trigger = container?.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
      if (scenario.fixture?.triggerFocusable === false) trigger.disabled = true;
      const outside = target('outside');
      const panelFirst = () => container?.querySelector<HTMLElement>('[data-testid="panel-first"]');

      for (const [index, action] of scenario.actions.entries()) {
        cancelProposal = 'cancel' in action && Boolean(action.cancel);
        await act(async () => {
          if (action.type === 'trigger') {
            trigger.focus();
            trigger.click();
          } else if (action.type === 'action') {
            reference.current?.requestClose();
          } else if (action.type === 'close-button') {
            container?.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();
          } else if (action.type === 'escape') {
            const event = new KeyboardEvent('keydown', {
              key: 'Escape',
              bubbles: true,
              cancelable: true,
            });
            if (action.handled) event.preventDefault();
            (document.activeElement ?? trigger).dispatchEvent(event);
          } else if (action.type === 'outside') {
            const outsideTarget = action.focusable ? outside : target('outside-static');
            if (scenario.actions.some(item => item.type === 'back')) {
              const provider = container?.querySelector(
                '[data-popover-host="true"]'
              ) as HTMLElement;
              touch(provider, 'touchstart');
              touch(provider, 'touchend');
            } else {
              pointer(outsideTarget, 'pointerdown');
              if (action.focusable) outsideTarget.focus();
              pointer(outsideTarget, 'pointerup');
            }
            outsideTarget.click();
          } else if (action.type === 'back') {
            BackHandler.__dispatch();
          } else if (action.type === 'sync') {
            container
              ?.querySelector<HTMLButtonElement>(
                action.open ? '[data-testid="sync-open"]' : '[data-testid="sync-close"]'
              )
              ?.click();
          } else if (action.type === 'set-default') {
            container?.querySelector<HTMLButtonElement>('[data-testid="change-default"]')?.click();
          } else if (action.type === 'focus') {
            (action.target === 'outside'
              ? outside
              : action.target === 'trigger'
                ? trigger
                : panelFirst()
            )?.focus();
          }
        });
        await frames();
        const isOpen = Boolean(container?.querySelector('[data-testid="panel"]'));
        expect(isOpen, `open state after action ${index + 1}`).toBe(
          scenario.expected.openAfterEachAction[index]
        );
      }

      expect(proposals).toEqual(scenario.expected.changes);
      expect(outsidePress).toHaveBeenCalledTimes(scenario.expected.outsidePresses);
      const focused = document.activeElement;
      if (scenario.expected.focus === 'trigger') expect(focused).toBe(trigger);
      else if (scenario.expected.focus === 'panel-first') expect(focused).toBe(panelFirst());
      else if (scenario.expected.focus === 'panel')
        expect(container?.querySelector('[data-testid="panel"]')?.contains(focused)).toBe(true);
      else if (scenario.expected.focus === 'outside') expect(focused).toBe(outside);
      else expect(focused).not.toBe(trigger);
    });
  }
});

describe('Popover (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...popoverPropNames].sort()).toEqual(propNames(popoverContract, 'native').sort());
  });

  it('uses the contract callback names', () => {
    const callbacks: (keyof PopoverProps)[] = ['onOpenChange'];
    expect(callbacks).toEqual(eventNames(popoverContract, 'native'));
  });
});

describe('Popover (native)', () => {
  it('keeps touch focus opening through delayed compatibility click on an actual RN Web IconButton SVG', async () => {
    runtime.nativeWeb = true;
    const changes: string[] = [];
    await render(<TouchFixture composed changes={changes} />);
    const button = target('touch-trigger');
    const svg = button.querySelector('svg');
    if (!svg) throw new Error('Missing real Icon SVG');
    const dispatch = (type: 'pointerdown' | 'pointerup' | 'click') => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: 20,
        clientY: 20,
      });
      Object.defineProperty(event, 'pointerType', { value: 'touch' });
      svg.dispatchEvent(event);
    };
    await act(async () => dispatch('pointerdown'));
    await act(async () => dispatch('pointerup'));
    // Chromium touch synthesizes focus/click after pointerup in later tasks.
    await act(async () => vi.advanceTimersByTimeAsync(10));
    await act(async () => button.focus());
    await act(async () => vi.advanceTimersByTimeAsync(10));
    await act(async () => dispatch('click'));
    expect(target('panel')).toBeDefined();
    expect(changes).toEqual(['true:focus']);
    await act(async () => dispatch('pointerdown'));
    await act(async () => dispatch('pointerup'));
    await act(async () => vi.advanceTimersByTimeAsync(10));
    await act(async () => dispatch('click'));
    expect(container?.querySelector('[data-testid="panel"]')).toBeNull();
    expect(changes).toEqual(['true:focus', 'false:trigger']);
  });

  for (const composed of [false, true]) {
    it(`does not toggle a focus-opened hover popover closed on touch (${composed ? 'IconButton' : 'content'} trigger)`, async () => {
      const changes: string[] = [];
      await render(<TouchFixture composed={composed} changes={changes} />);
      const button = target('touch-trigger');
      const touchPointer = (type: 'pointerdown' | 'pointerup') => {
        const event = new MouseEvent(type, { bubbles: true, clientX: 20, clientY: 20 });
        Object.defineProperty(event, 'pointerType', { value: 'touch' });
        button.dispatchEvent(event);
      };
      await act(async () => touchPointer('pointerdown'));
      await act(async () => button.focus());
      await act(async () => {
        touchPointer('pointerup');
        button.click();
      });
      expect(target('panel')).toBeDefined();
      expect(changes).toEqual(['true:focus']);
      await act(async () => {
        touchPointer('pointerdown');
        touchPointer('pointerup');
        button.click();
      });
      expect(container?.querySelector('[data-testid="panel"]')).toBeNull();
      expect(changes).toEqual(['true:focus', 'false:trigger']);
    });
  }

  it('composes one named IconButton host and activates once, including disabled state', async () => {
    const change = vi.fn();
    const fixture = (disabled: boolean) => (
      <PopoverProvider>
        <Popover
          trigger={props => (
            <IconButton {...props} testID="trigger" label="Details" disabled={disabled}>
              <Icon icon={info} />
            </IconButton>
          )}
          panelTestID="panel"
          onOpenChange={change}
        >
          Panel
        </Popover>
      </PopoverProvider>
    );
    await render(fixture(false));
    const button = target('trigger');
    expect(button.getAttribute('aria-label')).toBe('Details');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.querySelector('button')).toBeNull();
    await act(async () => button.click());
    expect(change).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    await act(async () => root?.render(fixture(true)));
    await act(async () => button.click());
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('positions an arrow using the requested gap and panel override colors', async () => {
    await render(
      <PopoverProvider>
        <Popover
          defaultOpen
          trigger="Open"
          testID="trigger"
          panelTestID="panel"
          arrow
          gap={0}
          panelStyle={{ backgroundColor: 'red', borderColor: 'blue', borderWidth: 2 }}
        >
          Panel
        </Popover>
      </PopoverProvider>
    );
    await frames();
    const style = JSON.parse(target('panel').getAttribute('data-style') ?? '{}');
    expect(style.top).toBe(52);
    const arrow = target('popover-arrow');
    expect(arrow.querySelector('polygon')?.getAttribute('fill')).toBe('red');
    expect(arrow.querySelector('polygon')?.getAttribute('stroke')).toBe('blue');
    expect(arrow.querySelector('polygon')?.getAttribute('stroke-width')).toBe('2');
  });

  it('keeps the arrow tip at the requested gap on every side with panel borders', async () => {
    const fixture = (side: NonNullable<PopoverProps['side']>, borderWidth: number) => (
      <PopoverProvider>
        <Popover
          defaultOpen
          trigger="Open"
          testID="trigger"
          panelTestID="panel"
          side={side}
          arrow
          gap={8}
          panelStyle={{ borderWidth }}
        >
          Panel
        </Popover>
      </PopoverProvider>
    );
    __setPressableRect({ x: 140, y: 250, width: 44, height: 44 });
    await render(fixture('top', 1));
    await act(async () => target('trigger').dispatchEvent(new Event('scroll')));
    await frames();
    for (const borderWidth of [1, 2]) {
      for (const side of ['top', 'bottom', 'left', 'right'] as const) {
        await act(async () => root?.render(fixture(side, borderWidth)));
        await frames();
        const panel = JSON.parse(target('panel').getAttribute('data-style') ?? '{}');
        const arrowStyle = JSON.parse(target('popover-arrow').getAttribute('data-style') ?? '{}');
        const x = panel.left + borderWidth + arrowStyle.left;
        const y = panel.top + borderWidth + arrowStyle.top;
        const tip = side === 'top' ? y + 8 : side === 'bottom' ? y : side === 'left' ? x + 8 : x;
        expect(tip).toBe(
          side === 'top' ? 242 : side === 'bottom' ? 302 : side === 'left' ? 132 : 192
        );
      }
    }
  });

  it('flips the arrow with placement, hides it at corners, and uses edge gap without an arrow', async () => {
    const fixture = (arrow: boolean, radius: number) => (
      <PopoverProvider>
        <Popover
          defaultOpen
          trigger="Open"
          testID="trigger"
          panelTestID="panel"
          side="top"
          gap={0}
          arrow={arrow}
          panelStyle={{ borderRadius: radius }}
        >
          Panel
        </Popover>
      </PopoverProvider>
    );
    await render(fixture(true, 4));
    await frames();
    expect(JSON.parse(target('panel').getAttribute('data-style') ?? '{}').top).toBe(52);
    expect(target('popover-arrow').querySelector('polygon')?.getAttribute('points')).toBe(
      '0,8 8,0 16,8'
    );
    await act(async () => root?.render(fixture(true, 50)));
    expect(container?.querySelector('[data-testid="popover-arrow"]')).toBeNull();
    await act(async () => root?.render(fixture(false, 4)));
    await frames();
    expect(JSON.parse(target('panel').getAttribute('data-style') ?? '{}').top).toBe(44);
  });

  it('closes after both pointer and focus leave for 150ms', async () => {
    const change = vi.fn();
    await render(
      <PopoverProvider>
        <Popover
          trigger="Open"
          testID="trigger"
          panelTestID="panel"
          triggerMode="hover"
          onOpenChange={change}
        >
          Panel
        </Popover>
        <button type="button" data-testid="outside">
          Outside
        </button>
      </PopoverProvider>
    );
    await act(async () => {
      target('outside').focus();
      await vi.advanceTimersByTimeAsync(149);
    });
    expect(target('panel')).toBeDefined();
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(container?.querySelector('[data-testid="panel"]')).toBeNull();
    expect(change).toHaveBeenLastCalledWith(
      expect.objectContaining({ open: false, reason: 'focus' })
    );
  });

  it('retains a controlled panel after an uncanceled close button proposal', async () => {
    const change = vi.fn();
    await render(
      <PopoverProvider>
        <Popover
          open
          closable
          trigger="Open"
          testID="trigger"
          panelTestID="panel"
          onOpenChange={change}
        >
          Panel
        </Popover>
      </PopoverProvider>
    );
    await act(async () =>
      container?.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click()
    );
    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({ open: false, reason: 'close-button', defaultPrevented: false })
    );
    expect(target('panel')).toBeDefined();
  });

  it('hover and focus leave after a delay, bridge the gap, and explicit dismissal suppresses reopening', async () => {
    const change = vi.fn();
    await render(
      <PopoverProvider>
        <Popover
          trigger="Open"
          testID="trigger"
          panelTestID="panel"
          triggerMode="hover"
          gap={100}
          initialFocus
          onOpenChange={change}
        >
          <button type="button" data-testid="panel-first">
            Panel action
          </button>
        </Popover>
        <button type="button" data-testid="outside">
          Outside
        </button>
      </PopoverProvider>
    );
    // The test fixture focuses the trigger, opening by focus rather than moving focus.
    expect(document.activeElement).toBe(target('trigger'));
    expect(change).toHaveBeenCalledWith({ open: true, reason: 'focus' });
    await act(async () => {
      target('trigger').dispatchEvent(
        new MouseEvent('pointerover', { bubbles: true, clientX: 50, clientY: 40 })
      );
      target('outside').focus();
      document.dispatchEvent(
        new MouseEvent('pointermove', { bubbles: true, clientX: 50, clientY: 100 })
      );
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(target('panel')).toBeDefined();
    await act(async () => {
      target('panel').dispatchEvent(
        new MouseEvent('pointerover', { bubbles: true, clientX: 50, clientY: 150 })
      );
      target('panel-first').focus();
      target('panel-first').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      );
    });
    expect(container?.querySelector('[data-testid="panel"]')).toBeNull();
    await act(async () => {
      target('trigger').dispatchEvent(
        new MouseEvent('pointerover', { bubbles: true, clientX: 50, clientY: 40 })
      );
    });
    expect(container?.querySelector('[data-testid="panel"]')).toBeNull();
    await act(async () => {
      target('outside').focus();
      target('outside').dispatchEvent(
        new MouseEvent('pointermove', { bubbles: true, clientX: 300, clientY: 400 })
      );
      await vi.advanceTimersByTimeAsync(151);
      target('trigger').focus();
    });
    expect(target('panel')).toBeDefined();
  });

  it('close button proposals are canceled or controlled without committing', async () => {
    const change = vi.fn((detail: PopoverOpenChangeDetail) => {
      if (!detail.open) detail.preventDefault();
    });
    await render(
      <PopoverProvider>
        <Popover
          open
          closable
          trigger="Open"
          testID="trigger"
          panelTestID="panel"
          onOpenChange={change}
        >
          Panel
        </Popover>
      </PopoverProvider>
    );
    await act(async () =>
      container?.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click()
    );
    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'close-button', defaultPrevented: true })
    );
    expect(target('panel')).toBeDefined();
  });
  for (const committedOpen of [true, false]) {
    it(`preserves controlled ${committedOpen} on release and then toggles autonomously`, async () => {
      const onOpenChange = vi.fn();
      const fixture = (open: boolean | undefined) => (
        <PopoverProvider>
          <Popover
            open={open}
            defaultOpen={!committedOpen}
            trigger="Open"
            testID="trigger"
            panelTestID="panel"
            onOpenChange={onOpenChange}
          >
            Panel
          </Popover>
        </PopoverProvider>
      );
      const assertOpen = (expected: boolean) => {
        expect(Boolean(container?.querySelector('[data-testid="panel"]'))).toBe(expected);
        expect(target('trigger').getAttribute('aria-expanded')).toBe(String(expected));
      };

      await render(fixture(!committedOpen));
      await act(async () => root?.render(fixture(committedOpen)));
      assertOpen(committedOpen);
      await act(async () => root?.render(fixture(undefined)));
      assertOpen(committedOpen);
      expect(onOpenChange).not.toHaveBeenCalled();

      await act(async () => target('trigger').click());
      assertOpen(!committedOpen);
      await act(async () => target('trigger').click());
      assertOpen(committedOpen);
      expect(
        onOpenChange.mock.calls.map(([detail]) => ({
          open: detail.open,
          reason: detail.reason,
        }))
      ).toEqual([
        { open: !committedOpen, reason: 'trigger' },
        { open: committedOpen, reason: 'trigger' },
      ]);
    });
  }

  it('fails explicitly without the required provider for both component and scroll hook', async () => {
    await expect(render(<Popover trigger="Open">Panel</Popover>)).rejects.toThrow(
      'PopoverProvider'
    );
    await act(async () => root?.unmount());
    container?.remove();
    await expect(render(<ScrollHookProbe />)).rejects.toThrow('PopoverProvider');
  });

  it('focuses the first eligible child and handles Escape bubbling from the hosted panel', async () => {
    await render(
      <PopoverProvider>
        <Popover defaultOpen initialFocus trigger="Open" testID="trigger" panelTestID="panel">
          <button type="button" disabled>
            Disabled
          </button>
          <div hidden>
            <button type="button">Hidden</button>
          </div>
          <input data-testid="first-input" />
          <button type="button" data-testid="handled" onKeyDown={event => event.preventDefault()}>
            Handles Escape
          </button>
        </Popover>
      </PopoverProvider>
    );
    expect(document.activeElement).toBe(target('first-input'));
    await act(async () => {
      pointer(target('first-input'), 'pointerdown', 20, 70);
      pointer(target('first-input'), 'pointerup', 20, 70);
      target('handled').focus();
      target('handled').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
    });
    expect(target('panel')).toBeDefined();
    await act(async () => {
      target('first-input').focus();
      target('first-input').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
    });
    expect(container?.querySelector('[data-testid="panel"]')).toBeNull();
    expect(document.activeElement).toBe(target('trigger'));
  });

  it('does not treat a pointer drag or canceled pointer sequence as an outside press', async () => {
    const proposal = vi.fn();
    await render(
      <PopoverProvider>
        <Popover defaultOpen trigger="Open" panelTestID="panel" onOpenChange={proposal}>
          Panel
        </Popover>
        <button type="button" data-testid="outside">
          Outside
        </button>
      </PopoverProvider>
    );
    await act(async () => {
      pointer(target('outside'), 'pointerdown', 200, 200);
      pointer(target('outside'), 'pointerup', 200, 250);
      pointer(target('outside'), 'pointerdown');
      target('outside').dispatchEvent(new Event('pointercancel', { bubbles: true }));
      pointer(target('outside'), 'pointerup');
    });
    expect(proposal).not.toHaveBeenCalled();
    expect(target('panel')).toBeDefined();
  });

  it('exposes an accessible trigger with committed expanded state', async () => {
    await render(
      <PopoverProvider>
        <Popover trigger="More details" testID="trigger">
          Panel
        </Popover>
      </PopoverProvider>
    );
    const trigger = container?.querySelector('[data-testid="trigger"]');
    expect(trigger?.getAttribute('data-role')).toBe('button');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    await act(async () => (trigger as HTMLButtonElement).click());
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
  });

  it('supports a ref close request and cancelable close proposals', async () => {
    const reference = { current: null as PopoverHandle | null };
    const onOpenChange = vi.fn((detail: PopoverOpenChangeDetail) => {
      if (!detail.open) detail.preventDefault();
    });
    await render(
      <PopoverProvider>
        <Popover
          defaultOpen
          trigger="More details"
          ref={reference}
          onOpenChange={onOpenChange}
          panelTestID="panel"
        >
          Panel
        </Popover>
      </PopoverProvider>
    );
    await act(async () => reference.current?.requestClose());
    expect(onOpenChange).toHaveBeenCalledWith(
      expect.objectContaining({ open: false, reason: 'action', defaultPrevented: true })
    );
    expect(container?.querySelector('[data-testid="panel"]')).not.toBeNull();
  });

  it('requests accessibility focus for initially open content when opted in', async () => {
    __setPlatformOS('android');
    await render(
      <PopoverProvider>
        <Popover defaultOpen initialFocus trigger="More details" panelTestID="panel">
          Panel
        </Popover>
      </PopoverProvider>
    );
    expect(__accessibilityFocusCalls.length).toBeGreaterThan(0);
  });

  it('uses the active theme surface and border tokens', async () => {
    const activeTheme = getNativeTheme('nebula', 'dark');
    await render(
      <CosmosThemeProvider theme="nebula" mode="dark">
        <PopoverProvider>
          <Popover defaultOpen trigger="More details" panelTestID="panel">
            Panel
          </Popover>
        </PopoverProvider>
      </CosmosThemeProvider>
    );
    const panelStyle = JSON.parse(
      container?.querySelector('[data-testid="panel"]')?.getAttribute('data-style') ?? '{}'
    ) as Record<string, unknown>;
    expect(panelStyle.backgroundColor).toBe(activeTheme.colors.surface);
    expect(panelStyle.borderColor).toBe(activeTheme.colors['border-strong']);
  });

  it('dismisses outside without preventing the outside control interaction', async () => {
    const outsidePress = vi.fn();
    await render(
      <PopoverProvider>
        <Popover defaultOpen trigger="More details" panelTestID="panel">
          Panel
        </Popover>
        <button type="button" data-testid="outside" onClick={outsidePress}>
          Outside
        </button>
      </PopoverProvider>
    );
    const outside = target('outside');
    await act(async () => {
      expect(pointer(outside, 'pointerdown').defaultPrevented).toBe(false);
      outside.focus();
      expect(pointer(outside, 'pointerup').defaultPrevented).toBe(false);
      outside.click();
    });
    expect(container?.querySelector('[data-testid="panel"]')).toBeNull();
    expect(outsidePress).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(outside);
  });

  it('consumes Android Back even when its close proposal is canceled', async () => {
    __setPlatformOS('android');
    const onOpenChange = (detail: PopoverOpenChangeDetail) => {
      if (!detail.open) detail.preventDefault();
    };
    await render(
      <PopoverProvider>
        <Popover defaultOpen trigger="More details" onOpenChange={onOpenChange} panelTestID="panel">
          Panel
        </Popover>
      </PopoverProvider>
    );
    let consumed = false;
    await act(async () => {
      consumed = BackHandler.__dispatch();
    });
    expect(consumed).toBe(true);
    expect(container?.querySelector('[data-testid="panel"]')).not.toBeNull();
  });

  it('does not steal observable native input focus after it leaves the panel', async () => {
    __setPlatformOS('android');
    await render(
      <PopoverProvider>
        <Popover defaultOpen initialFocus trigger="Open" testID="trigger" panelTestID="panel">
          <input data-testid="panel-input" />
        </Popover>
        <input data-testid="outside-input" />
      </PopoverProvider>
    );
    await act(async () => {
      target('panel-input').focus();
      target('outside-input').focus();
      BackHandler.__dispatch();
    });
    expect(container?.querySelector('[data-testid="panel"]')).toBeNull();
    expect(document.activeElement).toBe(target('outside-input'));
  });

  it('offers a scroll remeasurement callback through the host hook', async () => {
    await render(
      <PopoverProvider>
        <ScrollHookProbe />
      </PopoverProvider>
    );
    expect(container?.querySelector('[data-testid="scroll"]')).not.toBeNull();
  });

  it('automatically remeasures on captured browser scrolling', async () => {
    await render(
      <PopoverProvider>
        <Popover defaultOpen trigger="Open" testID="trigger" panelTestID="panel">
          Panel
        </Popover>
      </PopoverProvider>
    );
    const measure = vi.spyOn(
      target('trigger') as HTMLElement & { measureInWindow: () => void },
      'measureInWindow'
    );
    await act(async () => target('trigger').dispatchEvent(new Event('scroll')));
    expect(measure).toHaveBeenCalled();
  });
});
