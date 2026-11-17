import {
  type PopoverHandle as ContractPopoverHandle,
  type ContractProps,
  type PopoverOpenChangeDetail,
  type PopoverSide,
  popoverContract,
} from '@joralvmel/cosmos-core';
import {
  type ComponentRef,
  createContext,
  Fragment,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  findNodeHandle,
  I18nManager,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  type StyleProp,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';

type ContractPopoverProps = ContractProps<typeof popoverContract, 'native'>;

export type PopoverHandle = ContractPopoverHandle;

export interface PopoverProps extends ContractPopoverProps {
  /** Consumer-supplied trigger content, rendered inside the accessible trigger button. */
  trigger: ReactNode;
  /** Consumer-supplied panel content and semantics. */
  children?: ReactNode;
  /** Receives the contract proposal detail; call `preventDefault()` to veto a close. */
  onOpenChange?: (detail: PopoverOpenChangeDetail) => void;
  /** Style override for the trigger button. */
  triggerStyle?: StyleProp<ViewStyle>;
  /** Style override for the panel surface. */
  panelStyle?: StyleProp<ViewStyle>;
  /** Test identifier for the trigger button. */
  testID?: string;
  /** Test identifier for the panel. */
  panelTestID?: string;
  /** Ref exposing `requestClose()`. */
  ref?: Ref<PopoverHandle>;
}

export interface PopoverSafeAreaInsets {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface Point {
  x: number;
  y: number;
}

interface Rect extends Point {
  width: number;
  height: number;
}

// Structural browser capabilities keep DOM globals/types out of native builds.
interface WebObservedEvent {
  clientX: number;
  clientY: number;
  target: unknown;
  key?: string;
  defaultPrevented: boolean;
}

interface WebDocument {
  activeElement: unknown;
  defaultView?: { getComputedStyle(element: WebElement): { display: string; visibility: string } };
  addEventListener(
    type: string,
    listener: (event: WebObservedEvent) => void,
    capture?: boolean
  ): void;
  removeEventListener(
    type: string,
    listener: (event: WebObservedEvent) => void,
    capture?: boolean
  ): void;
}

interface WebElement {
  ownerDocument: WebDocument;
  parentElement: WebElement | null;
  isConnected: boolean;
  tabIndex: number;
  focus(): void;
  contains(target: unknown): boolean;
  matches(selector: string): boolean;
  closest(selector: string): unknown;
  querySelectorAll(selector: string): Iterable<WebElement>;
}

interface PopoverHostEntry {
  refresh(): void;
  contains(point: Point): boolean;
  containsTarget(target: unknown): boolean;
  requestOutsideClose(): void;
  requestEscapeClose(): void;
}

interface PopoverHostValue {
  origin: Point | undefined;
  bounds: Rect | undefined;
  register(entry: PopoverHostEntry): () => void;
  setOverlay(key: string, content: ReactNode | null): void;
  refresh(): void;
  onScroll(): void;
  onTouchStartCapture(event: NativeSyntheticEvent<{ pageX: number; pageY: number }>): void;
  onTouchMoveCapture(event: NativeSyntheticEvent<{ pageX: number; pageY: number }>): void;
  onTouchEndCapture(event: NativeSyntheticEvent<{ pageX: number; pageY: number }>): void;
}

const PopoverHostContext = createContext<PopoverHostValue | null>(null);

/** Props for the app-level host needed for pass-through outside-press handling. */
export interface PopoverProviderProps {
  children?: ReactNode;
  /** Safe-area insets in points, if the application has them available. */
  safeAreaInsets?: PopoverSafeAreaInsets;
  /** Optional style for the host root. */
  style?: StyleProp<ViewStyle>;
}

const TOUCH_SLOP = 10;

function eventPoint(event: NativeSyntheticEvent<{ pageX: number; pageY: number }>): Point {
  const nativeEvent = event.nativeEvent;
  return { x: nativeEvent.pageX, y: nativeEvent.pageY };
}

function measureInWindow(reference: unknown, update: (rect: Rect) => void) {
  const ref = reference as {
    measureInWindow?: (
      callback: (x: number, y: number, width: number, height: number) => void
    ) => void;
    getBoundingClientRect?: () => { left: number; top: number; width: number; height: number };
  } | null;
  if (ref?.measureInWindow) {
    ref.measureInWindow((x, y, width, height) => update({ x, y, width, height }));
  } else {
    const rect = ref?.getBoundingClientRect?.();
    if (rect) update({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
  }
}

/** App-level native host for pass-through outside presses and viewport measurement. */
export function PopoverProvider({ children, safeAreaInsets, style }: PopoverProviderProps) {
  const hostRef = useRef<ComponentRef<typeof View>>(null);
  const entries = useRef(new Set<PopoverHostEntry>());
  const [overlays, setOverlays] = useState<Map<string, ReactNode>>(new Map());
  const [hostBounds, setHostBounds] = useState<Rect>();
  const touchStart = useRef<Point | undefined>(undefined);
  const dimensions = useWindowDimensions();
  const measuredDimensions = useRef({ width: dimensions.width, height: dimensions.height });

  const refresh = useCallback(() => {
    for (const entry of entries.current) entry.refresh();
  }, []);

  const register = useCallback((entry: PopoverHostEntry) => {
    entries.current.add(entry);
    return () => entries.current.delete(entry);
  }, []);
  const setOverlay = useCallback((key: string, content: ReactNode | null) => {
    setOverlays(current => {
      if (content === null) {
        if (!current.has(key)) return current;
        const next = new Map(current);
        next.delete(key);
        return next;
      }
      if (current.get(key) === content) return current;
      return new Map(current).set(key, content);
    });
  }, []);

  const bounds = useMemo<Rect | undefined>(() => {
    if (!hostBounds) return;
    const top = safeAreaInsets?.top ?? 0;
    const right = safeAreaInsets?.right ?? 0;
    const bottom = safeAreaInsets?.bottom ?? 0;
    const left = safeAreaInsets?.left ?? 0;
    return {
      x: hostBounds.x + left,
      y: hostBounds.y + top,
      width: Math.max(0, hostBounds.width - left - right),
      height: Math.max(0, hostBounds.height - top - bottom),
    };
  }, [
    hostBounds,
    safeAreaInsets?.bottom,
    safeAreaInsets?.left,
    safeAreaInsets?.right,
    safeAreaInsets?.top,
  ]);

  const measureHost = useCallback(() => {
    measureInWindow(hostRef.current, rect => setHostBounds(rect));
  }, []);

  const onDimensionsChange = useCallback(
    (width: number, height: number) => {
      if (
        measuredDimensions.current.width === width &&
        measuredDimensions.current.height === height
      ) {
        return;
      }
      measuredDimensions.current = { width, height };
      measureHost();
      refresh();
    },
    [measureHost, refresh]
  );

  useEffect(() => {
    measureHost();
    refresh();
  }, [measureHost, refresh]);

  useEffect(() => {
    onDimensionsChange(dimensions.width, dimensions.height);
  }, [dimensions.height, dimensions.width, onDimensionsChange]);

  const onTouchStartCapture = useCallback(
    (event: NativeSyntheticEvent<{ pageX: number; pageY: number }>) => {
      touchStart.current = eventPoint(event);
    },
    []
  );
  const onTouchMoveCapture = useCallback(() => refresh(), [refresh]);
  const onTouchEndCapture = useCallback(
    (event: NativeSyntheticEvent<{ pageX: number; pageY: number }>) => {
      const end = eventPoint(event);
      const start = touchStart.current;
      touchStart.current = undefined;
      if (!start || Math.hypot(end.x - start.x, end.y - start.y) > TOUCH_SLOP) return;
      for (const entry of [...entries.current].reverse()) {
        if (!entry.contains(end)) entry.requestOutsideClose();
      }
    },
    []
  );

  useEffect(() => {
    const document = (globalThis as unknown as { document?: WebDocument }).document;
    if (Platform.OS !== 'web' || !document) return;
    let start: { x: number; y: number; target: unknown } | undefined;
    const pointerDown = (event: WebObservedEvent) => {
      start = { x: event.clientX, y: event.clientY, target: event.target };
    };
    const pointerUp = (event: WebObservedEvent) => {
      const down = start;
      start = undefined;
      if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > TOUCH_SLOP) {
        return;
      }
      for (const entry of [...entries.current].reverse()) {
        if (!entry.containsTarget(down.target) && !entry.containsTarget(event.target)) {
          entry.requestOutsideClose();
        }
      }
    };
    const pointerCancel = () => {
      start = undefined;
    };
    const keyDown = (event: WebObservedEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      for (const entry of [...entries.current].reverse()) entry.requestEscapeClose();
    };
    // Observe without preventing default or stopping propagation: the target still focuses/clicks.
    document.addEventListener('pointerdown', pointerDown, true);
    document.addEventListener('pointerup', pointerUp, true);
    document.addEventListener('pointercancel', pointerCancel, true);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('scroll', refresh, true);
    return () => {
      document.removeEventListener('pointerdown', pointerDown, true);
      document.removeEventListener('pointerup', pointerUp, true);
      document.removeEventListener('pointercancel', pointerCancel, true);
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('scroll', refresh, true);
    };
  }, [refresh]);

  const value = useMemo<PopoverHostValue>(
    () => ({
      bounds,
      origin: hostBounds ? { x: hostBounds.x, y: hostBounds.y } : undefined,
      register,
      setOverlay,
      refresh,
      onScroll: refresh,
      onTouchStartCapture,
      onTouchMoveCapture,
      onTouchEndCapture,
    }),
    [
      bounds,
      hostBounds,
      register,
      setOverlay,
      refresh,
      onTouchStartCapture,
      onTouchMoveCapture,
      onTouchEndCapture,
    ]
  );

  return (
    <PopoverHostContext.Provider value={value}>
      <View
        ref={hostRef}
        collapsable={false}
        onLayout={measureHost}
        {...(Platform.OS !== 'web'
          ? { onTouchStartCapture, onTouchMoveCapture, onTouchEndCapture }
          : {})}
        style={[{ flex: 1 }, style]}
      >
        {children}
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          {[...overlays].map(([key, content]) => (
            <Fragment key={key}>{content}</Fragment>
          ))}
        </View>
      </View>
    </PopoverHostContext.Provider>
  );
}

/**
 * Returns a scroll callback that remeasures open popovers after parent scrolling.
 * Pass it to a scroll container's `onScroll` when its content can move the trigger.
 */
export function usePopoverHost() {
  const host = useContext(PopoverHostContext);
  if (!host) throw new Error('usePopoverHost requires a PopoverProvider above the consumer.');
  return useMemo(() => ({ onScroll: host.onScroll }), [host.onScroll]);
}

// RN Web refs are host DOM nodes; keep browser focus operations out of the native path.
function webElement(reference: unknown): WebElement | null {
  return Platform.OS === 'web' &&
    reference &&
    typeof reference === 'object' &&
    'ownerDocument' in reference
    ? (reference as WebElement)
    : null;
}

function canFocus(element: WebElement) {
  if (
    !element.isConnected ||
    element.matches(':disabled, [aria-disabled="true"]') ||
    element.closest('[hidden], [inert], [aria-hidden="true"]')
  )
    return false;
  for (let ancestor: WebElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    const style = element.ownerDocument.defaultView?.getComputedStyle(ancestor);
    if (style?.display === 'none' || style?.visibility === 'hidden') return false;
  }
  return true;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const popoverPropNames = [
  'open',
  'defaultOpen',
  'closeOnEscape',
  'closeOnOutsidePress',
  'initialFocus',
  'restoreFocus',
  'side',
  'align',
  'flip',
  'shift',
] as const satisfies readonly (keyof ContractPopoverProps)[];

function oppositeSide(side: PopoverSide): PopoverSide {
  return side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : side === 'left' ? 'right' : 'left';
}

function overflow(rect: Rect, bounds: Rect, side: PopoverSide) {
  return side === 'top' || side === 'bottom'
    ? Math.max(0, bounds.y - rect.y) +
        Math.max(0, rect.y + rect.height - (bounds.y + bounds.height))
    : Math.max(0, bounds.x - rect.x) + Math.max(0, rect.x + rect.width - (bounds.x + bounds.width));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

function alignedStart(align: NonNullable<PopoverProps['align']>, rtl: boolean) {
  if (align === 'center') return 'center';
  return (align === 'start') !== rtl ? 'start' : 'end';
}

function getPlacement({
  side,
  align,
  flip,
  shift,
  trigger,
  panel,
  bounds,
  wrapper,
  gap,
}: {
  side: NonNullable<PopoverProps['side']>;
  align: NonNullable<PopoverProps['align']>;
  flip: boolean;
  shift: boolean;
  trigger: Rect;
  panel: Rect;
  bounds: Rect;
  wrapper: Rect;
  gap: number;
}) {
  const requested = side;
  const candidate = (candidateSide: PopoverSide): Rect => {
    let x = trigger.x;
    let y = trigger.y;
    if (candidateSide === 'bottom' || candidateSide === 'top') {
      const crossAlign = alignedStart(align, I18nManager.isRTL);
      x =
        crossAlign === 'start'
          ? trigger.x
          : crossAlign === 'end'
            ? trigger.x + trigger.width - panel.width
            : trigger.x + (trigger.width - panel.width) / 2;
      y =
        candidateSide === 'bottom'
          ? trigger.y + trigger.height + gap
          : trigger.y - panel.height - gap;
    } else {
      x =
        candidateSide === 'right' ? trigger.x + trigger.width + gap : trigger.x - panel.width - gap;
      y =
        align === 'start'
          ? trigger.y
          : align === 'end'
            ? trigger.y + trigger.height - panel.height
            : trigger.y + (trigger.height - panel.height) / 2;
    }
    return { x, y, width: panel.width, height: panel.height };
  };
  let actualSide = requested;
  let rect = candidate(requested);
  if (flip) {
    const opposite = oppositeSide(requested);
    const oppositeRect = candidate(opposite);
    if (overflow(oppositeRect, bounds, opposite) < overflow(rect, bounds, requested)) {
      actualSide = opposite;
      rect = oppositeRect;
    }
  }
  if (shift) {
    rect = {
      ...rect,
      x: clamp(rect.x, bounds.x, bounds.x + bounds.width - rect.width),
      y: clamp(rect.y, bounds.y, bounds.y + bounds.height - rect.height),
    };
  }
  return { left: rect.x - wrapper.x, top: rect.y - wrapper.y, actualSide };
}

function makeCloseDetail(reason: Extract<PopoverOpenChangeDetail, { open: false }>['reason']) {
  let prevented = false;
  const detail: PopoverOpenChangeDetail = {
    open: false,
    reason,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
  return detail;
}

/** Native non-modal content anchored to a consumer-provided trigger. */
export function Popover({
  open,
  defaultOpen = popoverContract.props.defaultOpen.default,
  closeOnEscape = popoverContract.props.closeOnEscape.default,
  closeOnOutsidePress = popoverContract.props.closeOnOutsidePress.default,
  initialFocus = popoverContract.props.initialFocus.default,
  restoreFocus = popoverContract.props.restoreFocus.default,
  side = popoverContract.props.side.default,
  align = popoverContract.props.align.default,
  flip = popoverContract.props.flip.default,
  shift = popoverContract.props.shift.default,
  trigger,
  children,
  onOpenChange,
  triggerStyle,
  panelStyle,
  testID,
  panelTestID,
  ref,
}: PopoverProps) {
  const theme = useTheme();
  const host = useContext(PopoverHostContext);
  if (!host) throw new Error('Popover requires a PopoverProvider above the component.');
  const hostBounds = host?.bounds;
  const hostOrigin = host?.origin;
  const setHostOverlay = host?.setOverlay;
  const dimensions = useWindowDimensions();
  const controlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(open ?? defaultOpen);
  // Keep the autonomous state aligned while controlled so releasing the binding
  // preserves visibility without introducing a close/open transition or proposal.
  if (controlled && uncontrolledOpen !== open) setUncontrolledOpen(open);
  const isOpen = controlled ? open : uncontrolledOpen;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const triggerRef = useRef<ComponentRef<typeof Pressable>>(null);
  const panelRef = useRef<ComponentRef<typeof View>>(null);
  const wrapperRef = useRef<ComponentRef<typeof View>>(null);
  const triggerRect = useRef<Rect | undefined>(undefined);
  const panelRect = useRef<Rect | undefined>(undefined);
  const [panelSize, setPanelSize] = useState({ width: 0, height: 0 });
  const [placement, setPlacement] = useState({ left: 0, top: 0 });
  const focusedInPanel = useRef(false);
  const closeIntent = useRef<
    Extract<PopoverOpenChangeDetail, { open: false }>['reason'] | undefined
  >(undefined);
  const previousOpen = useRef<boolean | undefined>(undefined);
  const overlayKey = useId();
  const restoreFocusRef = useRef(restoreFocus);
  restoreFocusRef.current = restoreFocus;
  const initialFocusRef = useRef(initialFocus);
  initialFocusRef.current = initialFocus;

  const focus = useCallback((target: ComponentRef<typeof View> | null) => {
    const element = webElement(target);
    if (element) {
      if (canFocus(element)) element.focus();
      return;
    }
    const tag = target ? findNodeHandle(target) : null;
    if (tag != null) void AccessibilityInfo.setAccessibilityFocus(tag);
  }, []);

  const setPanelRef = useCallback((node: ComponentRef<typeof View> | null) => {
    const previous = webElement(panelRef.current);
    // Ref detachment precedes DOM removal. Read actual focus now, not a past focus event.
    if (!node && !isOpenRef.current && previous?.contains(previous.ownerDocument.activeElement)) {
      const triggerElement = webElement(triggerRef.current);
      if (
        closeIntent.current &&
        closeIntent.current !== 'outside' &&
        restoreFocusRef.current &&
        triggerElement &&
        canFocus(triggerElement)
      ) {
        triggerElement.focus();
      }
    }
    if (!node && !isOpenRef.current && Platform.OS === 'web') closeIntent.current = undefined;
    panelRef.current = node;
  }, []);

  const updatePlacement = useCallback(() => {
    measureInWindow(wrapperRef.current, rect => {
      measureInWindow(triggerRef.current, trigger => {
        triggerRect.current = trigger;
        if (!panelSize.width || !panelSize.height) return;
        const bounds = hostBounds
          ? hostBounds
          : { x: 0, y: 0, width: dimensions.width, height: dimensions.height };
        const panel = { ...panelSize, x: 0, y: 0 };
        const next = getPlacement({
          side,
          align,
          flip,
          shift,
          trigger,
          panel,
          bounds,
          wrapper: rect,
          gap: theme.space.xs,
        });
        const nextPosition = hostOrigin
          ? {
              left: next.left + rect.x - hostOrigin.x,
              top: next.top + rect.y - hostOrigin.y,
            }
          : { left: next.left, top: next.top };
        panelRect.current = {
          x: (hostOrigin?.x ?? rect.x) + nextPosition.left,
          y: (hostOrigin?.y ?? rect.y) + nextPosition.top,
          width: panelSize.width,
          height: panelSize.height,
        };
        setPlacement(current =>
          current.left === nextPosition.left && current.top === nextPosition.top
            ? current
            : nextPosition
        );
        requestAnimationFrame(() => {
          measureInWindow(panelRef.current, panelRectValue => {
            panelRect.current = panelRectValue;
          });
        });
      });
    });
  }, [
    align,
    dimensions.height,
    dimensions.width,
    flip,
    hostBounds,
    hostOrigin,
    panelSize,
    shift,
    side,
    theme.space.xs,
  ]);

  const refresh = useCallback(() => updatePlacement(), [updatePlacement]);
  const contains = useCallback((point: Point) => {
    const inRect = (rect: Rect | undefined) =>
      Boolean(
        rect &&
          point.x >= rect.x &&
          point.x <= rect.x + rect.width &&
          point.y >= rect.y &&
          point.y <= rect.y + rect.height
      );
    return inRect(triggerRect.current) || inRect(panelRect.current);
  }, []);

  const requestClose = useCallback(
    (reason: Extract<PopoverOpenChangeDetail, { open: false }>['reason']) => {
      if (!isOpenRef.current) return;
      const detail = makeCloseDetail(reason);
      onOpenChange?.(detail);
      closeIntent.current = detail.defaultPrevented ? undefined : reason;
      if (detail.defaultPrevented) return;
      if (!controlled) setUncontrolledOpen(false);
    },
    [controlled, onOpenChange]
  );

  const hostEntry = useRef<PopoverHostEntry>({
    refresh,
    contains,
    containsTarget: () => false,
    requestOutsideClose: () => {
      if (closeOnOutsidePress) requestClose('outside');
    },
    requestEscapeClose: () => {},
  });
  hostEntry.current.refresh = refresh;
  hostEntry.current.contains = contains;
  hostEntry.current.requestOutsideClose = () => {
    if (closeOnOutsidePress) requestClose('outside');
  };
  hostEntry.current.containsTarget = target =>
    typeof target === 'object' &&
    target !== null &&
    'nodeType' in target &&
    Boolean(
      webElement(triggerRef.current)?.contains(target) ||
        webElement(panelRef.current)?.contains(target)
    );
  hostEntry.current.requestEscapeClose = () => {
    if (closeOnEscape) requestClose('escape');
  };

  useEffect(() => host?.register(hostEntry.current), [host?.register]);

  useImperativeHandle(ref, () => ({ requestClose: () => requestClose('action') }), [requestClose]);

  useEffect(() => {
    const wasOpen = previousOpen.current;
    previousOpen.current = isOpen;
    if (wasOpen === undefined) {
      if (isOpen) {
        updatePlacement();
      }
      return;
    }
    if (wasOpen === isOpen) return;
    if (isOpen) {
      closeIntent.current = undefined;
      focusedInPanel.current = false;
      updatePlacement();
      return;
    }
    if (
      closeIntent.current &&
      closeIntent.current !== 'outside' &&
      restoreFocus &&
      focusedInPanel.current &&
      Platform.OS !== 'web'
    ) {
      focus(triggerRef.current);
    }
    if (Platform.OS !== 'web') closeIntent.current = undefined;
    focusedInPanel.current = false;
  }, [focus, isOpen, restoreFocus, updatePlacement]);

  useEffect(() => {
    if (!isOpen || !initialFocusRef.current) return;
    const frame = requestAnimationFrame(() => {
      if (!isOpenRef.current || !panelRef.current) return;
      const panelElement = webElement(panelRef.current);
      if (panelElement) {
        const first = [
          ...panelElement.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex], [contenteditable="true"]'
          ),
        ].find(element => element.tabIndex >= 0 && canFocus(element));
        focus((first ?? panelElement) as unknown as ComponentRef<typeof View>);
      } else {
        focus(panelRef.current);
        // Requesting accessibility focus does not prove ongoing input focus ownership.
        // Native restoration relies on the panel's observable focus/blur events instead.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [focus, isOpen]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !isOpen) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      requestClose('back');
      return true;
    });
    return () => subscription.remove();
  }, [isOpen, requestClose]);

  useEffect(() => {
    if (isOpen && panelSize.width && panelSize.height) updatePlacement();
  }, [isOpen, panelSize.height, panelSize.width, updatePlacement]);

  const onWrapperLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      updatePlacement();
    },
    [updatePlacement]
  );
  const onPanelLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setPanelSize(current =>
        current.width === width && current.height === height ? current : { width, height }
      );
      updatePlacement();
      measureInWindow(panelRef.current, rect => {
        panelRect.current = rect;
      });
    },
    [updatePlacement]
  );

  const panel = useMemo(
    () =>
      isOpen ? (
        <View
          ref={setPanelRef}
          {...(Platform.OS === 'web' ? { tabIndex: -1 } : {})}
          collapsable={false}
          testID={panelTestID}
          onLayout={onPanelLayout}
          onFocus={() => {
            focusedInPanel.current = true;
          }}
          onBlur={() => {
            focusedInPanel.current = false;
          }}
          style={[
            {
              position: 'absolute',
              left: placement.left,
              top: placement.top,
              maxWidth: hostBounds?.width ?? dimensions.width,
              maxHeight: hostBounds?.height ?? dimensions.height,
              padding: theme.space.md,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors['border-strong'],
              borderWidth: 1,
              borderRadius: theme.radius.md,
              zIndex: 1000,
              ...theme.shadow.md,
            },
            panelStyle,
          ]}
        >
          {children}
        </View>
      ) : null,
    [
      children,
      dimensions.height,
      dimensions.width,
      hostBounds?.height,
      hostBounds?.width,
      isOpen,
      onPanelLayout,
      panelStyle,
      panelTestID,
      placement.left,
      placement.top,
      theme.colors,
      theme.radius.md,
      theme.shadow.md,
      theme.space.md,
      setPanelRef,
    ]
  );

  useEffect(() => {
    if (!setHostOverlay) return;
    setHostOverlay(overlayKey, panel);
  }, [overlayKey, panel, setHostOverlay]);

  useEffect(
    () => () => {
      setHostOverlay?.(overlayKey, null);
    },
    [overlayKey, setHostOverlay]
  );

  return (
    <View
      ref={wrapperRef}
      collapsable={false}
      onLayout={onWrapperLayout}
      style={{ alignSelf: 'flex-start', zIndex: isOpen ? 1 : 0 }}
    >
      <Pressable
        ref={triggerRef}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => {
          if (isOpenRef.current) {
            requestClose('trigger');
            return;
          }
          const detail: PopoverOpenChangeDetail = { open: true, reason: 'trigger' };
          onOpenChange?.(detail);
          closeIntent.current = undefined;
          if (!controlled) setUncontrolledOpen(true);
        }}
        onLayout={updatePlacement}
        hitSlop={Math.max(0, (44 - theme.control.md) / 2)}
        style={[
          {
            minHeight: 44,
            minWidth: 44,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'flex-start',
          },
          triggerStyle,
        ]}
      >
        {typeof trigger === 'string' || typeof trigger === 'number' ? (
          <Text style={{ color: theme.colors.fg, fontSize: theme.text.md }}>{trigger}</Text>
        ) : (
          trigger
        )}
      </Pressable>
    </View>
  );
}
