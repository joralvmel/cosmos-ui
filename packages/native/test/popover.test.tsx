import {
  eventNames,
  type PopoverOpenChangeDetail,
  popoverContract,
  popoverScenariosFor,
  propNames,
} from '@joralvmel/cosmos-core';
import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { act, type ReactNode, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CosmosThemeProvider,
  Popover,
  type PopoverHandle,
  type PopoverProps,
  PopoverProvider,
  popoverPropNames,
  usePopoverHost,
} from '../src/index.js';
import { __accessibilityFocusCalls, __setPlatformOS, BackHandler } from './react-native.mock.js';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

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
  container.querySelector<HTMLElement>('[data-testid="trigger"]')?.focus();
  await frames();
  return container;
}

afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  BackHandler.__reset();
  __setPlatformOS('web');
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
