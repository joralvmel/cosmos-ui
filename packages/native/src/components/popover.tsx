import {
  type PopoverHandle as ContractPopoverHandle,
  type ContractProps,
  type PopoverOpenChangeDetail,
  type PopoverSide,
  popoverContract,
} from '@joralvmel/cosmos-core';
import { x } from '@joralvmel/cosmos-icons/x';
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
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { Polygon, Svg } from 'react-native-svg';
import { useTheme } from '../theme/theme-provider.js';
import { Icon } from './icon.js';
import { IconButton } from './icon-button.js';

type ContractPopoverProps = ContractProps<typeof popoverContract, 'native'>;

export type PopoverHandle = ContractPopoverHandle;

/** Props to spread onto a single interactive native trigger. */
export interface PopoverTriggerProps {
  onPress(): void;
  ref: Ref<ComponentRef<typeof Pressable>>;
  accessibilityState: { expanded: boolean };
}

export interface PopoverProps extends ContractPopoverProps {
  /** Content for the default button, or a render function for a single interactive trigger. */
  trigger: ReactNode | ((props: PopoverTriggerProps) => ReactNode);
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
  type: string;
  clientX: number;
  clientY: number;
  target: unknown;
  relatedTarget?: unknown;
  pointerType?: string;
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
  'triggerMode',
  'closable',
  'closeLabel',
  'gap',
  'arrow',
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
  triggerMode = popoverContract.props.triggerMode.default,
  closable = popoverContract.props.closable.default,
  closeLabel = popoverContract.props.closeLabel.default,
  gap = popoverContract.props.gap.default,
  arrow = popoverContract.props.arrow.default,
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
  if (!Number.isFinite(gap) || gap < 0)
    throw new TypeError('Popover gap must be finite and non-negative.');
  if (closable && (typeof closeLabel !== 'string' || !closeLabel.trim()))
    throw new TypeError('Popover closeLabel must be non-empty when closable.');
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
  const [placement, setPlacement] = useState<{
    left: number;
    top: number;
    actualSide: PopoverSide;
  }>({
    left: 0,
    top: 0,
    actualSide: side,
  });
  const hoverInside = useRef(false);
  const focusInside = useRef(false);
  const suppressed = useRef(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openingReason = useRef<'trigger' | 'hover' | 'focus' | undefined>(undefined);
  const pointerStartedClosed = useRef(false);
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
          gap: gap + (arrow ? 8 : 0),
        });
        const nextPosition = hostOrigin
          ? {
              left: next.left + rect.x - hostOrigin.x,
              top: next.top + rect.y - hostOrigin.y,
              actualSide: next.actualSide,
            }
          : { left: next.left, top: next.top, actualSide: next.actualSide };
        panelRect.current = {
          x: (hostOrigin?.x ?? rect.x) + nextPosition.left,
          y: (hostOrigin?.y ?? rect.y) + nextPosition.top,
          width: panelSize.width,
          height: panelSize.height,
        };
        setPlacement(current =>
          current.left === nextPosition.left &&
          current.top === nextPosition.top &&
          current.actualSide === nextPosition.actualSide
            ? current
            : nextPosition
        );
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
    gap,
    arrow,
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
      if (reason === 'escape' || reason === 'close-button')
        suppressed.current = hoverInside.current || focusInside.current;
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
    openingReason.current = undefined;
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
    if (
      !isOpen ||
      !initialFocusRef.current ||
      openingReason.current === 'hover' ||
      openingReason.current === 'focus'
    )
      return;
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

  const requestOpen = useCallback(
    (reason: 'trigger' | 'hover' | 'focus') => {
      if (isOpenRef.current) return;
      openingReason.current = reason;
      onOpenChange?.({ open: true, reason });
      closeIntent.current = undefined;
      if (!controlled) setUncontrolledOpen(true);
    },
    [controlled, onOpenChange]
  );
  const hoverOpenRef = useRef(requestOpen);
  const hoverCloseRef = useRef(requestClose);
  hoverOpenRef.current = requestOpen;
  hoverCloseRef.current = requestClose;

  useEffect(() => {
    const document = (globalThis as unknown as { document?: WebDocument }).document;
    if (Platform.OS !== 'web' || triggerMode !== 'hover' || !document) return;
    const inside = (target: unknown) =>
      typeof target === 'object' &&
      target !== null &&
      'nodeType' in target &&
      Boolean(
        webElement(triggerRef.current)?.contains(target) ||
          webElement(panelRef.current)?.contains(target)
      );
    const cancelTimer = () => {
      if (hoverTimer.current !== undefined) clearTimeout(hoverTimer.current);
      hoverTimer.current = undefined;
    };
    const schedule = (reason: 'hover' | 'focus') => {
      cancelTimer();
      if (!hoverInside.current && !focusInside.current) {
        suppressed.current = false;
        hoverTimer.current = setTimeout(() => {
          if (!hoverInside.current && !focusInside.current) hoverCloseRef.current(reason);
        }, 150);
      }
    };
    const pointer = (event: WebObservedEvent) => {
      if (event.pointerType === 'touch') return;
      const target = event.type === 'pointerout' ? event.relatedTarget : event.target;
      const trigger = triggerRect.current;
      const panel = panelRect.current;
      const bridge =
        hoverInside.current &&
        trigger &&
        panel &&
        event.clientX >= Math.min(trigger.x, panel.x) &&
        event.clientX <= Math.max(trigger.x + trigger.width, panel.x + panel.width) &&
        event.clientY >= Math.min(trigger.y, panel.y) &&
        event.clientY <= Math.max(trigger.y + trigger.height, panel.y + panel.height);
      hoverInside.current = inside(target) || Boolean(bridge);
      if (hoverInside.current) {
        cancelTimer();
        const element = webElement(triggerRef.current);
        if (!suppressed.current && inside(target) && element && canFocus(element))
          hoverOpenRef.current('hover');
      } else schedule('hover');
    };
    const focusIn = (event: WebObservedEvent) => {
      focusInside.current = inside(event.target);
      if (focusInside.current) {
        cancelTimer();
        if (!suppressed.current) hoverOpenRef.current('focus');
      } else schedule('focus');
    };
    const focusOut = (event: WebObservedEvent) => {
      focusInside.current = inside(event.relatedTarget);
      if (!focusInside.current) schedule('focus');
    };
    const pointerDown = (event: WebObservedEvent) => {
      pointerStartedClosed.current = inside(event.target) && !isOpenRef.current;
    };
    const resetPress = () => {
      pointerStartedClosed.current = false;
    };
    document.addEventListener('pointermove', pointer);
    document.addEventListener('pointerover', pointer);
    document.addEventListener('pointerout', pointer);
    document.addEventListener('pointerdown', pointerDown, true);
    // Touch compatibility focus/click may arrive in a later task than pointerup.
    // Retain intent until activation, cancellation, or a new keyboard gesture.
    document.addEventListener('click', resetPress);
    document.addEventListener('pointercancel', resetPress, true);
    document.addEventListener('keydown', resetPress, true);
    document.addEventListener('focusin', focusIn);
    document.addEventListener('focusout', focusOut);
    return () => {
      cancelTimer();
      pointerStartedClosed.current = false;
      hoverInside.current = false;
      focusInside.current = false;
      document.removeEventListener('pointermove', pointer);
      document.removeEventListener('pointerover', pointer);
      document.removeEventListener('pointerout', pointer);
      document.removeEventListener('pointerdown', pointerDown, true);
      document.removeEventListener('click', resetPress);
      document.removeEventListener('pointercancel', resetPress, true);
      document.removeEventListener('keydown', resetPress, true);
      document.removeEventListener('focusin', focusIn);
      document.removeEventListener('focusout', focusOut);
    };
  }, [triggerMode]);

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
    },
    [updatePlacement]
  );

  const surface =
    StyleSheet.flatten([
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors['border-strong'],
        borderWidth: 1,
        borderRadius: theme.radius.md,
      },
      panelStyle,
    ]) ?? {};
  const bounds = hostBounds ?? { x: 0, y: 0, width: dimensions.width, height: dimensions.height };
  const panelX = (hostOrigin?.x ?? 0) + placement.left;
  const panelY = (hostOrigin?.y ?? 0) + placement.top;
  const vertical = placement.actualSide === 'top' || placement.actualSide === 'bottom';
  const center = triggerRect.current
    ? vertical
      ? triggerRect.current.x + triggerRect.current.width / 2 - panelX
      : triggerRect.current.y + triggerRect.current.height / 2 - panelY
    : NaN;
  const radius = Math.max(
    ...[
      surface.borderRadius ?? theme.radius.md,
      surface.borderTopLeftRadius,
      surface.borderTopRightRadius,
      surface.borderBottomLeftRadius,
      surface.borderBottomRightRadius,
    ].map(value => (typeof value === 'number' ? value : 0))
  );
  const length = vertical ? panelSize.width : panelSize.height;
  const arrowX = vertical
    ? panelX + center - 8
    : placement.actualSide === 'right'
      ? panelX - 8
      : panelX + panelSize.width;
  const arrowY = vertical
    ? placement.actualSide === 'bottom'
      ? panelY - 8
      : panelY + panelSize.height
    : panelY + center - 8;
  const arrowWidth = vertical ? 16 : 8;
  const arrowHeight = vertical ? 8 : 16;
  // Absolute children are positioned from the panel's inner border edge on
  // both RN Web and native. Geometry above is measured from the outer edge.
  const leftBorder =
    surface.borderLeftWidth ??
    (I18nManager.isRTL ? surface.borderEndWidth : surface.borderStartWidth) ??
    surface.borderWidth ??
    0;
  const topBorder = surface.borderTopWidth ?? surface.borderWidth ?? 0;
  const measuredTrigger = triggerRect.current;
  const validSide =
    measuredTrigger &&
    (placement.actualSide === 'bottom'
      ? arrowY >= measuredTrigger.y + measuredTrigger.height
      : placement.actualSide === 'top'
        ? arrowY + 8 <= measuredTrigger.y
        : placement.actualSide === 'right'
          ? arrowX >= measuredTrigger.x + measuredTrigger.width
          : arrowX + 8 <= measuredTrigger.x);
  const showArrow =
    arrow &&
    validSide &&
    Number.isFinite(center) &&
    center - 8 >= radius &&
    center + 8 <= length - radius &&
    arrowX >= bounds.x &&
    arrowY >= bounds.y &&
    arrowX + arrowWidth <= bounds.x + bounds.width &&
    arrowY + arrowHeight <= bounds.y + bounds.height;
  const arrowPoints =
    placement.actualSide === 'bottom'
      ? '0,8 8,0 16,8'
      : placement.actualSide === 'top'
        ? '0,0 8,8 16,0'
        : placement.actualSide === 'right'
          ? '8,0 0,8 8,16'
          : '0,0 8,8 0,16';

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
          {showArrow && (
            <View
              pointerEvents="none"
              accessible={false}
              aria-hidden
              testID="popover-arrow"
              style={{
                position: 'absolute',
                left: arrowX - panelX - leftBorder,
                top: arrowY - panelY - topBorder,
                width: arrowWidth,
                height: arrowHeight,
              }}
            >
              <Svg width={arrowWidth} height={arrowHeight} aria-hidden>
                <Polygon
                  points={arrowPoints}
                  fill={surface.backgroundColor}
                  stroke={surface.borderColor}
                  strokeWidth={surface.borderWidth}
                />
              </Svg>
            </View>
          )}
          {closable && (
            <IconButton
              label={closeLabel}
              variant="ghost"
              tone="neutral"
              onPress={() => requestClose('close-button')}
            >
              <Icon icon={x} />
            </IconButton>
          )}
          {children}
        </View>
      ) : null,
    [
      children,
      arrowHeight,
      arrowPoints,
      arrowWidth,
      arrowX,
      arrowY,
      closable,
      closeLabel,
      dimensions.height,
      dimensions.width,
      hostBounds?.height,
      hostBounds?.width,
      isOpen,
      leftBorder,
      onPanelLayout,
      panelStyle,
      panelTestID,
      placement.left,
      placement.top,
      panelX,
      panelY,
      requestClose,
      showArrow,
      surface.backgroundColor,
      surface.borderColor,
      surface.borderWidth,
      theme.colors,
      theme.radius.md,
      theme.shadow.md,
      theme.space.md,
      topBorder,
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

  const activateTrigger = () => {
    const focusOpenedDuringPress =
      pointerStartedClosed.current && openingReason.current === 'focus' && isOpenRef.current;
    pointerStartedClosed.current = false;
    if (focusOpenedDuringPress) return;
    if (isOpenRef.current) requestClose('trigger');
    else requestOpen('trigger');
  };

  return (
    <View
      ref={wrapperRef}
      collapsable={false}
      onLayout={onWrapperLayout}
      style={{ alignSelf: 'flex-start', zIndex: isOpen ? 1 : 0 }}
    >
      {typeof trigger === 'function' ? (
        trigger({
          ref: triggerRef,
          accessibilityState: { expanded: isOpen },
          onPress: activateTrigger,
        })
      ) : (
        <Pressable
          ref={triggerRef}
          testID={testID}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          onPress={activateTrigger}
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
      )}
    </View>
  );
}
