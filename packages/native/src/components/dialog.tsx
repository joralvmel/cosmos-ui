import {
  type ContractProps,
  type DialogCloseReason,
  type DialogHandle,
  type DialogOpenChangeDetail,
  type DialogReferences,
  type DialogSize,
  dialogContract,
} from '@joralvmel/cosmos-core';
import { arrowDown } from '@joralvmel/cosmos-icons/arrow-down';
import { arrowLeft } from '@joralvmel/cosmos-icons/arrow-left';
import { arrowRight } from '@joralvmel/cosmos-icons/arrow-right';
import { arrowUp } from '@joralvmel/cosmos-icons/arrow-up';
import { crosshair } from '@joralvmel/cosmos-icons/crosshair';
import { move } from '@joralvmel/cosmos-icons/move';
import { x } from '@joralvmel/cosmos-icons/x';
import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  type LayoutChangeEvent,
  Modal as NativeModal,
  PanResponder,
  type PanResponderGestureState,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import {
  clampDialogMovement,
  type DialogLayoutSize,
  type DialogMovementBounds,
  type DialogOffset,
  getDialogMovementBounds,
  snapDialogMovement,
  stepDialogMovementValue,
} from '../internal/dialog-movement.js';
import { useTheme } from '../theme/theme-provider.js';
import { Icon } from './icon.js';
import { IconButton } from './icon-button.js';

/** A native host instance or React ref to one that can receive accessibility focus. */
export type DialogFocusTarget =
  | ComponentRef<typeof View>
  | ComponentRef<typeof Pressable>
  | { current: unknown }
  | null;

type ContractDialogProps = ContractProps<
  typeof dialogContract,
  'native',
  DialogReferences<DialogFocusTarget>
>;

export interface DialogProps extends ContractDialogProps {
  /** Accessible title content. */
  title: ReactNode;
  /** Optional short description of the dialog. */
  description?: ReactNode;
  /** Scrollable body content. */
  children?: ReactNode;
  /** Consumer-supplied actions, kept visible while the body scrolls. */
  actions?: ReactNode;
  /** Native style override for the dialog surface. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  ref?: Ref<DialogHandle>;
  onOpenChange?: (detail: DialogOpenChangeDetail) => void;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const dialogPropNames = [
  'open',
  'defaultOpen',
  'presentation',
  'size',
  'maxWidth',
  'fullWidth',
  'responsiveFullscreen',
  'movable',
  'moveControlsLabel',
  'moveUpLabel',
  'moveDownLabel',
  'moveLeftLabel',
  'moveRightLabel',
  'moveCenterLabel',
  'closeLabel',
  'closeOnAndroidBack',
  'closeOnBackdropPress',
  'initialFocusTarget',
  'returnFocusTarget',
] as const satisfies readonly (keyof ContractDialogProps)[];

const namedWidths: Record<DialogSize, number> = { sm: 400, md: 640, lg: 960 };

function sameSize(left: DialogLayoutSize, right: DialogLayoutSize): boolean {
  return left.width === right.width && left.height === right.height;
}

interface WebElement {
  ownerDocument: WebDocument;
  parentElement: WebElement | null;
  children: { length: number; [index: number]: WebElement };
  isConnected: boolean;
  inert: boolean;
  tabIndex: number;
  focus(): void;
  contains(target: unknown): boolean;
  matches(selector: string): boolean;
  closest(selector: string): WebElement | null;
  querySelectorAll(selector: string): { length: number; [index: number]: WebElement };
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

interface WebDocument {
  activeElement: unknown;
  body: WebElement;
  defaultView?: { getComputedStyle(element: WebElement): { display: string; visibility: string } };
  addEventListener(type: 'keydown', listener: (event: WebKeyboardEvent) => void): void;
  addEventListener(type: 'focusin', listener: (event: WebFocusEvent) => void): void;
  removeEventListener(type: 'keydown', listener: (event: WebKeyboardEvent) => void): void;
  removeEventListener(type: 'focusin', listener: (event: WebFocusEvent) => void): void;
}

interface WebKeyboardEvent {
  key: string;
  shiftKey: boolean;
  defaultPrevented: boolean;
  preventDefault(): void;
}

interface WebFocusEvent {
  target: unknown;
}

type InertSnapshot = { element: WebElement; inert: boolean; ariaHidden: string | null };

function isWebElement(value: unknown): value is WebElement {
  return (
    typeof value === 'object' &&
    value !== null &&
    'focus' in value &&
    typeof value.focus === 'function' &&
    'isConnected' in value &&
    'ownerDocument' in value
  );
}

function webDocument(): WebDocument | null {
  return (globalThis as unknown as { document?: WebDocument }).document ?? null;
}

function targetNode(target: DialogFocusTarget | undefined): unknown {
  if (!target || typeof target !== 'object') return null;
  return 'current' in target ? target.current : target;
}

function isUsableWebTarget(value: unknown): value is WebElement {
  return (
    isWebElement(value) &&
    value.isConnected &&
    !value.matches(':disabled, [aria-disabled="true"], [hidden], [inert], [aria-hidden="true"]')
  );
}

function focusableElements(root: WebElement): WebElement[] {
  return Array.from(
    root.querySelectorAll(
      'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
  ).filter(element => {
    if (
      !element.isConnected ||
      element.matches(':disabled, [hidden], [inert], [aria-hidden="true"]') ||
      element.closest('[hidden], [inert], [aria-hidden="true"]')
    )
      return false;
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return style?.display !== 'none' && style?.visibility !== 'hidden' && element.tabIndex >= 0;
  });
}

function isolateWebBackground(root: WebElement): () => void {
  const body = root.ownerDocument.body;
  let portal = root;
  while (portal.parentElement && portal.parentElement !== body) portal = portal.parentElement;
  const snapshots: InertSnapshot[] = [];
  for (let index = 0; index < body.children.length; index += 1) {
    const child = body.children[index];
    if (!child || child === portal) continue;
    snapshots.push({
      element: child,
      inert: child.inert,
      ariaHidden: child.getAttribute('aria-hidden'),
    });
    child.inert = true;
    child.setAttribute('aria-hidden', 'true');
  }
  return () => {
    for (const { element, inert, ariaHidden } of snapshots) {
      element.inert = inert;
      if (ariaHidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', ariaHidden);
    }
  };
}

function createCloseDetail(reason: DialogCloseReason): DialogOpenChangeDetail {
  let prevented = false;
  return {
    open: false,
    reason,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
}

/** Native modal dialog with focus management and synchronously cancelable close requests. */
export function Dialog({
  open,
  defaultOpen = dialogContract.props.defaultOpen.default,
  presentation = dialogContract.props.presentation.default,
  size = dialogContract.props.size.default,
  maxWidth,
  fullWidth = dialogContract.props.fullWidth.default,
  responsiveFullscreen = dialogContract.props.responsiveFullscreen.default,
  movable = dialogContract.props.movable.default,
  moveControlsLabel = dialogContract.props.moveControlsLabel.default,
  moveUpLabel = dialogContract.props.moveUpLabel.default,
  moveDownLabel = dialogContract.props.moveDownLabel.default,
  moveLeftLabel = dialogContract.props.moveLeftLabel.default,
  moveRightLabel = dialogContract.props.moveRightLabel.default,
  moveCenterLabel = dialogContract.props.moveCenterLabel.default,
  closeLabel = dialogContract.props.closeLabel.default,
  closeOnAndroidBack = dialogContract.props.closeOnAndroidBack.default,
  closeOnBackdropPress = dialogContract.props.closeOnBackdropPress.default,
  initialFocusTarget,
  returnFocusTarget,
  title,
  description,
  children,
  actions,
  onOpenChange,
  style,
  testID,
  ref,
}: DialogProps) {
  if (maxWidth !== undefined && (!Number.isFinite(maxWidth) || maxWidth <= 0))
    throw new RangeError('Dialog maxWidth must be a positive finite number.');
  if (typeof closeLabel !== 'string' || !closeLabel.trim())
    throw new TypeError('Dialog requires a non-empty closeLabel.');
  for (const [label, value] of Object.entries({
    moveControlsLabel,
    moveUpLabel,
    moveDownLabel,
    moveLeftLabel,
    moveRightLabel,
    moveCenterLabel,
  })) {
    if (typeof value !== 'string' || !value.trim())
      throw new TypeError(`Dialog requires a non-empty ${label}.`);
  }

  const theme = useTheme();
  const dimensions = useWindowDimensions();
  const [viewportSize, setViewportSize] = useState<DialogLayoutSize>({
    width: dimensions.width,
    height: dimensions.height,
  });
  const [surfaceSize, setSurfaceSize] = useState<DialogLayoutSize>({ width: 0, height: 0 });
  const [movement, setMovementState] = useState<DialogOffset>({ x: 0, y: 0 });
  const [movementExpanded, setMovementExpanded] = useState(false);
  const dialogId = useId().replaceAll(':', '');
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [webRoot, setWebRoot] = useState<WebElement | null>(null);
  const [reduceMotion, setReduceMotion] = useState(true);
  const controlled = open !== undefined;
  if (controlled && uncontrolledOpen !== open) setUncontrolledOpen(open);
  const isOpen = controlled ? open : uncontrolledOpen;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const rootRef = useRef<ComponentRef<typeof View>>(null);
  const surfaceRef = useRef<ComponentRef<typeof View>>(null);
  const movementRef = useRef<DialogOffset>({ x: 0, y: 0 });
  const movementBoundsRef = useRef<DialogMovementBounds>({
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  });
  const dragStartRef = useRef<DialogOffset | null>(null);
  const titleRef = useRef<ComponentRef<typeof View>>(null);
  const movementTriggerRef = useRef<ComponentRef<typeof Pressable>>(null);
  const returnTargetRef = useRef<unknown>(null);
  const previousOpen = useRef(false);
  const restoreAfterClose = useRef(false);
  const escapeHandledByChild = useRef(false);
  const bindRootRef = useCallback((node: ComponentRef<typeof View> | null) => {
    rootRef.current = node;
    if (Platform.OS === 'web') setWebRoot(node as unknown as WebElement | null);
  }, []);
  const setMovement = useCallback(
    (next: DialogOffset | ((current: DialogOffset) => DialogOffset)) => {
      const resolved = typeof next === 'function' ? next(movementRef.current) : next;
      movementRef.current = resolved;
      setMovementState(resolved);
    },
    []
  );

  const fullscreen =
    presentation === 'fullscreen' || (responsiveFullscreen && dimensions.width < 640);
  const movementEnabled = isOpen && movable && !fullscreen;
  useEffect(() => {
    if (!movementEnabled) setMovementExpanded(false);
  }, [movementEnabled]);
  const bounds = useMemo(
    () => getDialogMovementBounds(viewportSize, surfaceSize, theme.space.lg),
    [surfaceSize, theme.space.lg, viewportSize]
  );
  movementBoundsRef.current = bounds;

  const onViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const next = {
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    };
    setViewportSize(current => (sameSize(current, next) ? current : next));
  }, []);
  const onSurfaceLayout = useCallback((event: LayoutChangeEvent) => {
    const next = {
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    };
    setSurfaceSize(current => (sameSize(current, next) ? current : next));
  }, []);

  const cancelDrag = useCallback(() => {
    const start = dragStartRef.current;
    if (!start) return;
    dragStartRef.current = null;
    setMovement(start);
  }, [setMovement]);

  const completeDrag = useCallback(
    (gesture: PanResponderGestureState) => {
      const start = dragStartRef.current;
      if (!start) return;
      dragStartRef.current = null;
      setMovement(
        snapDialogMovement(
          { x: start.x + gesture.dx, y: start.y + gesture.dy },
          movementBoundsRef.current
        )
      );
    },
    [setMovement]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => movementEnabled,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          movementEnabled && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
        onPanResponderGrant: () => {
          if (movementEnabled) dragStartRef.current = { ...movementRef.current };
        },
        onPanResponderMove: (_event, gesture) => {
          const start = dragStartRef.current;
          if (!start) return;
          const currentBounds = movementBoundsRef.current;
          setMovement({
            ...clampDialogMovement(
              { x: start.x + gesture.dx, y: start.y + gesture.dy },
              currentBounds
            ),
          });
        },
        onPanResponderRelease: (_event, gesture) => completeDrag(gesture),
        onPanResponderTerminate: cancelDrag,
        onPanResponderTerminationRequest: () => false,
      }),
    [cancelDrag, completeDrag, movementEnabled, setMovement]
  );

  const focusTarget = useCallback((target: unknown) => {
    if (!target || typeof target !== 'object') return false;
    if (Platform.OS === 'web') {
      if (!isUsableWebTarget(target)) return false;
      target.focus();
      return true;
    }
    const handle = findNodeHandle(target as Parameters<typeof findNodeHandle>[0]);
    if (handle === null || handle === undefined) return false;
    void AccessibilityInfo.setAccessibilityFocus(handle);
    return true;
  }, []);

  const getInitialTarget = useCallback(() => {
    const candidate = targetNode(initialFocusTarget);
    const root = rootRef.current as unknown as WebElement | null;
    if (candidate && Platform.OS === 'web' && root && isUsableWebTarget(candidate)) {
      if (root.contains(candidate)) return candidate;
    } else if (candidate && Platform.OS !== 'web') {
      return candidate;
    }
    if (Platform.OS !== 'web') return titleRef.current;
    if (!root) return null;
    return (
      focusableElements(root).find(
        element => !element.closest('[id$="-close"], [id$="-move-trigger"]')
      ) ?? surfaceRef.current
    );
  }, [initialFocusTarget]);

  const restoreFocus = useCallback(() => {
    const requested = targetNode(returnFocusTarget);
    if (focusTarget(requested)) return;
    if (Platform.OS === 'web' && focusTarget(returnTargetRef.current)) return;
  }, [focusTarget, returnFocusTarget]);

  const captureReturnFocus = useCallback(() => {
    const document = Platform.OS === 'web' ? webDocument() : null;
    if (document) {
      returnTargetRef.current =
        document.activeElement === document.body ? null : document.activeElement;
    }
  }, []);

  const requestOpen = useCallback(() => {
    if (isOpenRef.current) return;
    captureReturnFocus();
    onOpenChange?.({ open: true, reason: 'action' });
    if (!controlled) setUncontrolledOpen(true);
  }, [captureReturnFocus, controlled, onOpenChange]);

  const requestClose = useCallback(
    (reason: DialogCloseReason = 'action') => {
      if (!isOpenRef.current) return;
      const detail = createCloseDetail(reason);
      onOpenChange?.(detail);
      if (detail.open === false && detail.defaultPrevented) return;
      if (!controlled) setUncontrolledOpen(false);
    },
    [controlled, onOpenChange]
  );

  const handleModalRequestClose = useCallback(() => {
    if (Platform.OS === 'android') {
      if (closeOnAndroidBack) requestClose('back');
      return;
    }
    if (Platform.OS === 'web') {
      const handled = escapeHandledByChild.current;
      escapeHandledByChild.current = false;
      if (!handled) requestClose('escape');
    }
  }, [closeOnAndroidBack, requestClose]);

  const handleWebKeyDown = useCallback(
    (event: WebKeyboardEvent) => {
      if (!isOpenRef.current) return;
      if (event.key === 'Escape') {
        if (dragStartRef.current) {
          event.preventDefault();
          escapeHandledByChild.current = true;
          cancelDrag();
          return;
        }
        if (!event.defaultPrevented && movementExpanded) {
          event.preventDefault();
          escapeHandledByChild.current = true;
          setMovementExpanded(false);
          focusTarget(movementTriggerRef.current);
          return;
        }
        escapeHandledByChild.current = event.defaultPrevented;
        return;
      }
      if (event.defaultPrevented) return;
      const root = rootRef.current as unknown as WebElement | null;
      if (!root) return;
      if (event.key !== 'Tab') return;
      const candidates = focusableElements(root);
      if (!candidates.length) {
        event.preventDefault();
        focusTarget(surfaceRef.current);
        return;
      }
      const active = root.ownerDocument.activeElement;
      const index = candidates.findIndex(
        candidate => candidate === active || candidate.contains(active)
      );
      if (
        (!event.shiftKey && (index === candidates.length - 1 || index < 0)) ||
        (event.shiftKey && index <= 0)
      ) {
        event.preventDefault();
        (event.shiftKey ? candidates[candidates.length - 1] : candidates[0])?.focus();
      }
    },
    [cancelDrag, focusTarget, movementExpanded]
  );

  const focusInitial = useCallback(() => {
    const target = getInitialTarget();
    if (focusTarget(target)) return;
    focusTarget(surfaceRef.current);
  }, [focusTarget, getInitialTarget]);

  const handleWebFocusIn = useCallback(
    (event: WebFocusEvent) => {
      if (!isOpenRef.current) return;
      const root = rootRef.current as unknown as WebElement | null;
      if (root && isWebElement(event.target) && !root.contains(event.target)) focusInitial();
    },
    [focusInitial]
  );

  useImperativeHandle(ref, () => ({ requestOpen, requestClose: () => requestClose('action') }), [
    requestClose,
    requestOpen,
  ]);

  useLayoutEffect(() => {
    const wasOpen = previousOpen.current;
    if (isOpen && !wasOpen && !returnTargetRef.current) captureReturnFocus();
    if (!isOpen && wasOpen) restoreAfterClose.current = true;
    previousOpen.current = isOpen;
  }, [captureReturnFocus, isOpen]);

  useEffect(() => {
    if (isOpen && Platform.OS === 'web' && webRoot) focusInitial();
  }, [focusInitial, isOpen, webRoot]);

  useEffect(() => {
    const root = Platform.OS === 'web' ? webRoot : null;
    if (!isOpen || Platform.OS !== 'web' || !root) return;
    const document = root.ownerDocument;
    const restoreIsolation = isolateWebBackground(root);
    document.addEventListener('keydown', handleWebKeyDown);
    document.addEventListener('focusin', handleWebFocusIn);
    return () => {
      document.removeEventListener('keydown', handleWebKeyDown);
      document.removeEventListener('focusin', handleWebFocusIn);
      restoreIsolation();
    };
  }, [handleWebFocusIn, handleWebKeyDown, isOpen, webRoot]);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      setReduceMotion(value);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isOpen && restoreAfterClose.current) {
      restoreAfterClose.current = false;
      restoreFocus();
      returnTargetRef.current = null;
    }
  }, [isOpen, restoreFocus]);

  useEffect(() => {
    setViewportSize(current => {
      const next = { width: dimensions.width, height: dimensions.height };
      return sameSize(current, next) ? current : next;
    });
  }, [dimensions.height, dimensions.width]);

  useEffect(() => {
    if (!isOpen || !movable || fullscreen) {
      dragStartRef.current = null;
      setMovement({ x: 0, y: 0 });
    }
  }, [fullscreen, isOpen, movable, setMovement]);

  useEffect(() => {
    if (!isOpen || !movable || fullscreen) return;
    dragStartRef.current = null;
    setMovement(current => snapDialogMovement(current, bounds));
  }, [bounds, fullscreen, isOpen, movable, setMovement]);

  const closeFromBackdrop = useCallback(() => {
    if (closeOnBackdropPress) requestClose('backdrop');
  }, [closeOnBackdropPress, requestClose]);

  const maxSurfaceWidth = Math.max(
    0,
    Math.min(maxWidth ?? namedWidths[size], viewportSize.width - 2 * theme.space.lg)
  );
  const maxSurfaceHeight = Math.max(0, viewportSize.height - 2 * theme.space.lg);
  const baseStyle: StyleProp<ViewStyle> = [
    {
      flexDirection: 'column',
      minWidth: 0,
      maxWidth: fullscreen ? undefined : maxSurfaceWidth,
      maxHeight: fullscreen ? undefined : maxSurfaceHeight,
      alignSelf: 'center',
      borderWidth: fullscreen ? 0 : StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: fullscreen ? 0 : theme.radius.lg,
      backgroundColor: theme.colors.surface,
      ...(fullscreen ? {} : theme.shadow.lg),
    },
    fullscreen || fullWidth ? { width: '100%' } : null,
    fullscreen ? { height: '100%', flex: 1 } : null,
    fullscreen && Platform.OS === 'web'
      ? ({
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
        } as unknown as ViewStyle)
      : null,
    style,
    movementEnabled
      ? {
          transform: [{ translateX: movement.x }, { translateY: movement.y }],
        }
      : null,
  ];
  const sectionPadding = theme.space.xl;
  const SafeAreaContainer = Platform.OS === 'web' ? View : SafeAreaView;
  const moveLeft = stepDialogMovementValue(movement.x, -1, bounds.minX, bounds.maxX);
  const moveRight = stepDialogMovementValue(movement.x, 1, bounds.minX, bounds.maxX);
  const moveUp = stepDialogMovementValue(movement.y, -1, bounds.minY, bounds.maxY);
  const moveDown = stepDialogMovementValue(movement.y, 1, bounds.minY, bounds.maxY);

  return (
    <NativeModal
      visible={isOpen}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={handleModalRequestClose}
      onShow={focusInitial}
      testID={testID ? `${testID}-modal` : undefined}
      aria-labelledby={Platform.OS === 'web' ? titleId : undefined}
      aria-describedby={Platform.OS === 'web' && description ? descriptionId : undefined}
    >
      <View ref={bindRootRef} style={{ flex: 1 }} testID={testID ? `${testID}-root` : undefined}>
        <Pressable
          accessibilityRole="none"
          accessibilityLabel=""
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          accessible={false}
          aria-hidden
          onPress={closeFromBackdrop}
          testID={testID ? `${testID}-backdrop` : undefined}
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
        />
        <SafeAreaContainer style={{ flex: 1 }}>
          <View
            testID={testID ? `${testID}-viewport` : undefined}
            onLayout={onViewportLayout}
            style={{
              flex: 1,
              alignItems: fullscreen ? 'stretch' : 'center',
              justifyContent: fullscreen ? 'flex-start' : 'center',
              padding: fullscreen ? 0 : theme.space.lg,
            }}
            pointerEvents="box-none"
          >
            <View
              ref={surfaceRef}
              nativeID={`${dialogId}-surface`}
              testID={testID ?? 'dialog'}
              onLayout={onSurfaceLayout}
              role={Platform.OS === 'web' ? undefined : 'dialog'}
              accessibilityLabelledBy={titleId}
              accessibilityHint={typeof description === 'string' ? description : undefined}
              accessibilityViewIsModal={Platform.OS === 'ios'}
              tabIndex={Platform.OS === 'web' ? -1 : undefined}
              style={baseStyle}
            >
              <View
                style={{
                  minHeight: 0,
                  flex: fullscreen ? 1 : undefined,
                  flexDirection: 'column',
                }}
              >
                <View
                  nativeID={`${dialogId}-header`}
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: theme.space.sm,
                    padding: sectionPadding,
                    paddingBottom: theme.space.sm,
                    borderTopWidth: theme.space.xs,
                    borderTopColor: theme.colors.primary,
                    borderTopLeftRadius: fullscreen ? 0 : theme.radius.lg,
                    borderTopRightRadius: fullscreen ? 0 : theme.radius.lg,
                  }}
                >
                  <View
                    ref={titleRef}
                    nativeID={titleId}
                    testID={testID ? `${testID}-title` : undefined}
                    accessibilityRole="header"
                    accessible
                    tabIndex={Platform.OS === 'web' ? -1 : undefined}
                    style={{ flex: 1, minWidth: 0 }}
                    {...(movementEnabled ? panResponder.panHandlers : {})}
                  >
                    {typeof title === 'string' || typeof title === 'number' ? (
                      <Text
                        style={{
                          color: theme.colors.fg,
                          fontSize: theme.text.xl,
                          fontWeight: theme.weight.semibold,
                          lineHeight: theme.text.xl * theme.leading.tight,
                        }}
                      >
                        {title}
                      </Text>
                    ) : (
                      title
                    )}
                  </View>
                  {movementEnabled ? (
                    <View nativeID={`${dialogId}-move-trigger`}>
                      <IconButton
                        ref={movementTriggerRef}
                        label={moveControlsLabel}
                        variant="ghost"
                        tone="neutral"
                        accessibilityState={{ expanded: movementExpanded }}
                        testID={testID ? `${testID}-move-trigger` : undefined}
                        onPress={() => setMovementExpanded(current => !current)}
                      >
                        <Icon icon={move} />
                      </IconButton>
                    </View>
                  ) : null}
                  <View nativeID={`${dialogId}-close`}>
                    <IconButton
                      label={closeLabel}
                      variant="ghost"
                      tone="neutral"
                      testID={testID ? `${testID}-close` : undefined}
                      onPress={() => requestClose('close-button')}
                    >
                      <Icon icon={x} />
                    </IconButton>
                  </View>
                </View>
                {movementEnabled && movementExpanded ? (
                  <View
                    nativeID={`${dialogId}-move-controls`}
                    testID={testID ? `${testID}-move-controls` : undefined}
                    role="group"
                    accessibilityLabel={moveControlsLabel}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.space.xs,
                      paddingHorizontal: sectionPadding,
                      paddingBottom: sectionPadding,
                    }}
                  >
                    <IconButton
                      label={moveLeftLabel}
                      variant="ghost"
                      tone="neutral"
                      disabled={moveLeft === movement.x}
                      testID={testID ? `${testID}-move-left` : undefined}
                      style={{ minWidth: 44, minHeight: 44 }}
                      onPress={() =>
                        setMovement(current => ({
                          ...current,
                          x: stepDialogMovementValue(current.x, -1, bounds.minX, bounds.maxX),
                        }))
                      }
                    >
                      <Icon icon={arrowLeft} />
                    </IconButton>
                    <IconButton
                      label={moveUpLabel}
                      variant="ghost"
                      tone="neutral"
                      disabled={moveUp === movement.y}
                      testID={testID ? `${testID}-move-up` : undefined}
                      style={{ minWidth: 44, minHeight: 44 }}
                      onPress={() =>
                        setMovement(current => ({
                          ...current,
                          y: stepDialogMovementValue(current.y, -1, bounds.minY, bounds.maxY),
                        }))
                      }
                    >
                      <Icon icon={arrowUp} />
                    </IconButton>
                    <IconButton
                      label={moveCenterLabel}
                      variant="ghost"
                      tone="neutral"
                      disabled={movement.x === 0 && movement.y === 0}
                      testID={testID ? `${testID}-move-center` : undefined}
                      style={{ minWidth: 44, minHeight: 44 }}
                      onPress={() => setMovement({ x: 0, y: 0 })}
                    >
                      <Icon icon={crosshair} />
                    </IconButton>
                    <IconButton
                      label={moveDownLabel}
                      variant="ghost"
                      tone="neutral"
                      disabled={moveDown === movement.y}
                      testID={testID ? `${testID}-move-down` : undefined}
                      style={{ minWidth: 44, minHeight: 44 }}
                      onPress={() =>
                        setMovement(current => ({
                          ...current,
                          y: stepDialogMovementValue(current.y, 1, bounds.minY, bounds.maxY),
                        }))
                      }
                    >
                      <Icon icon={arrowDown} />
                    </IconButton>
                    <IconButton
                      label={moveRightLabel}
                      variant="ghost"
                      tone="neutral"
                      disabled={moveRight === movement.x}
                      testID={testID ? `${testID}-move-right` : undefined}
                      style={{ minWidth: 44, minHeight: 44 }}
                      onPress={() =>
                        setMovement(current => ({
                          ...current,
                          x: stepDialogMovementValue(current.x, 1, bounds.minX, bounds.maxX),
                        }))
                      }
                    >
                      <Icon icon={arrowRight} />
                    </IconButton>
                  </View>
                ) : null}
                {description ? (
                  <View
                    nativeID={descriptionId}
                    style={{ paddingHorizontal: sectionPadding, paddingBottom: theme.space.sm }}
                  >
                    {typeof description === 'string' || typeof description === 'number' ? (
                      <Text
                        style={{
                          color: theme.colors['fg-muted'],
                          fontSize: theme.text.sm,
                          lineHeight: theme.text.sm * theme.leading.normal,
                        }}
                      >
                        {description}
                      </Text>
                    ) : (
                      description
                    )}
                  </View>
                ) : null}
                <ScrollView
                  testID={testID ? `${testID}-body` : undefined}
                  style={{ flexGrow: fullscreen ? 1 : 0, flexShrink: 1, minHeight: 0 }}
                  contentContainerStyle={{
                    padding: sectionPadding,
                    paddingTop: theme.space.lg,
                  }}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
                {actions ? (
                  <View
                    nativeID="cosmos-dialog-actions"
                    testID={testID ? `${testID}-actions` : undefined}
                    style={{
                      flexShrink: 0,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: theme.space.sm,
                      paddingHorizontal: sectionPadding,
                      paddingVertical: theme.space.lg,
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: theme.colors.border,
                    }}
                  >
                    {actions}
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </SafeAreaContainer>
      </View>
    </NativeModal>
  );
}
