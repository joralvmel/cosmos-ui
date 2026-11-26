// Minimal DOM stand-ins for the React Native primitives used by the components under test.
import {
  createElement,
  type FocusEventHandler,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type AnyProps = Record<string, unknown> & { children?: ReactNode };

let colorScheme: 'light' | 'dark' | null = 'light';
let reducedMotion = false;
let windowSize = { width: 320, height: 640 };
const layoutOverrides = new Map<string, { x: number; y: number; width: number; height: number }>();
const responderHandlers = new Map<
  string,
  Record<string, (event: unknown, gesture: GestureState) => unknown>
>();
export const __setColorScheme = (value: 'light' | 'dark' | null) => {
  colorScheme = value;
};
export const __setReducedMotion = (value: boolean) => {
  reducedMotion = value;
};
export const useColorScheme = () => colorScheme;
export const Platform = { OS: 'web' as string };
export const __setPlatformOS = (value: string) => {
  Platform.OS = value;
};
export const __setWindowDimensions = (value?: typeof windowSize) => {
  windowSize = value ?? { width: 320, height: 640 };
};
export const __setLayoutForTest = (
  testID: string,
  layout?: { x: number; y: number; width: number; height: number }
) => {
  if (layout) layoutOverrides.set(testID, layout);
  else layoutOverrides.delete(testID);
};
export const __resetLayouts = () => layoutOverrides.clear();
export const processColor = (value: string) => value;
export const unstable_createElement = createElement;
const focusNodes = new Map<number, HTMLElement>();
export const findNodeHandle = (node: HTMLElement) => {
  const tag = focusNodes.size + 1;
  focusNodes.set(tag, node);
  return tag;
};
export const I18nManager = { isRTL: false };
export const useWindowDimensions = () => ({
  ...windowSize,
  scale: 1,
  fontScale: 1,
});

interface GestureState {
  dx: number;
  dy: number;
}

interface PanResponderConfig {
  onStartShouldSetPanResponder?: (event: unknown, gesture: GestureState) => boolean;
  onMoveShouldSetPanResponder?: (event: unknown, gesture: GestureState) => boolean;
  onPanResponderGrant?: (event: unknown, gesture: GestureState) => void;
  onPanResponderMove?: (event: unknown, gesture: GestureState) => void;
  onPanResponderRelease?: (event: unknown, gesture: GestureState) => void;
  onPanResponderTerminate?: (event: unknown, gesture: GestureState) => void;
  onPanResponderTerminationRequest?: (event: unknown, gesture: GestureState) => boolean;
}

export const PanResponder = {
  create: (config: PanResponderConfig) => ({
    panHandlers: {
      onStartShouldSetResponder: (event: unknown, gesture: GestureState) =>
        config.onStartShouldSetPanResponder?.(event, gesture) ?? false,
      onMoveShouldSetResponder: (event: unknown, gesture: GestureState) =>
        config.onMoveShouldSetPanResponder?.(event, gesture) ?? false,
      onResponderGrant: (event: unknown, gesture: GestureState) =>
        config.onPanResponderGrant?.(event, gesture),
      onResponderMove: (event: unknown, gesture: GestureState) =>
        config.onPanResponderMove?.(event, gesture),
      onResponderRelease: (event: unknown, gesture: GestureState) =>
        config.onPanResponderRelease?.(event, gesture),
      onResponderTerminate: (event: unknown, gesture: GestureState) =>
        config.onPanResponderTerminate?.(event, gesture),
      onResponderTerminationRequest: (event: unknown, gesture: GestureState) =>
        config.onPanResponderTerminationRequest?.(event, gesture) ?? true,
    },
  }),
};

export const __dispatchPanResponder = (
  testID: string,
  phase: string,
  gesture: GestureState = { dx: 0, dy: 0 }
) => responderHandlers.get(testID)?.[phase]?.({ nativeEvent: {} }, gesture);
export const __resetPanResponder = () => responderHandlers.clear();
const backPressListeners = new Set<() => boolean>();
export const BackHandler = {
  addEventListener: (_eventName: string, listener: () => boolean) => {
    backPressListeners.add(listener);
    return { remove: () => backPressListeners.delete(listener) };
  },
  __dispatch: () => [...backPressListeners].some(listener => listener()),
  __reset: () => backPressListeners.clear(),
};
export const __accessibilityFocusCalls: number[] = [];
export const __accessibilityFocusedNodes: HTMLElement[] = [];
export const __accessibilityAnnouncements: string[] = [];
export const AccessibilityInfo = {
  isReduceMotionEnabled: () => Promise.resolve(reducedMotion),
  addEventListener: (_eventName: string, _listener: (value: boolean) => void) => ({
    remove: () => {},
  }),
  setAccessibilityFocus: (tag: number) => {
    __accessibilityFocusCalls.push(tag);
    const node = focusNodes.get(tag);
    if (node?.isConnected) {
      __accessibilityFocusedNodes.push(node);
      (node.querySelector<HTMLElement>('button, input, [tabindex]') ?? node).focus();
    }
    return Promise.resolve();
  },
  announceForAccessibility: (announcement: string) => {
    __accessibilityAnnouncements.push(announcement);
  },
};
const modalCloseHandlers = new Set<() => void>();
export const __dispatchModalRequestClose = () => {
  [...modalCloseHandlers].at(-1)?.();
};

const flatten = (style: unknown, state = { pressed: false }): Record<string, unknown> => {
  const value = typeof style === 'function' ? style(state) : style;
  if (Array.isArray(value)) return Object.assign({}, ...value.map(item => flatten(item, state)));
  return (value as Record<string, unknown>) ?? {};
};

const ariaChecked = (value: unknown): 'mixed' | 'true' | 'false' | undefined => {
  if (value === 'mixed') return 'mixed';
  if (value === true) return 'true';
  if (value === false) return 'false';
  return undefined;
};

let pressableRect = { x: 0, y: 0, width: 100, height: 44 };
export const __setPressableRect = (rect?: typeof pressableRect) => {
  pressableRect = rect ?? { x: 0, y: 0, width: 100, height: 44 };
};

export const Pressable = forwardRef<HTMLButtonElement, AnyProps>(
  ({ children, onPress, disabled, style, accessibilityState, ...props }, ref) => {
    const node = useRef<HTMLButtonElement>(null);
    useImperativeHandle(ref, () =>
      Object.assign(node.current as HTMLButtonElement, {
        measureInWindow: (
          callback: (x: number, y: number, width: number, height: number) => void
        ) => callback(pressableRect.x, pressableRect.y, pressableRect.width, pressableRect.height),
      })
    );
    return (
      // biome-ignore lint/a11y/useAriaPropsSupportedByRole: The stand-in role is dynamic for RN Web options.
      <button
        ref={node}
        type="button"
        disabled={Boolean(disabled)}
        onClick={onPress as () => void}
        onFocus={props.onFocus as FocusEventHandler<HTMLButtonElement>}
        onBlur={props.onBlur as FocusEventHandler<HTMLButtonElement>}
        onPointerEnter={event => {
          if (!disabled && event.pointerType === 'mouse')
            (props.onHoverIn as PointerEventHandler<HTMLButtonElement> | undefined)?.(event);
        }}
        onPointerLeave={props.onHoverOut as PointerEventHandler<HTMLButtonElement>}
        id={(props.id ?? props.nativeID) as string}
        role={
          props.accessibilityRole === 'none' || props.accessible === false
            ? undefined
            : ((props.role as string) ?? (props.accessibilityRole as string) ?? 'button')
        }
        tabIndex={
          (props.tabIndex as number | undefined) ?? (props.accessible === false ? -1 : undefined)
        }
        aria-selected={
          props['aria-selected'] === undefined
            ? Boolean((accessibilityState as { selected?: boolean })?.selected) || undefined
            : Boolean(props['aria-selected'])
        }
        aria-describedby={props['aria-describedby'] as string}
        aria-current={props['aria-current'] as 'page' | undefined}
        data-testid={props.testID as string}
        data-role={props.accessibilityRole as string}
        aria-label={props.accessibilityLabel as string}
        aria-hidden={props['aria-hidden'] ? 'true' : undefined}
        aria-checked={ariaChecked(
          props['aria-checked'] ?? (accessibilityState as { checked?: boolean | 'mixed' })?.checked
        )}
        aria-required={props['aria-required'] ? 'true' : undefined}
        aria-invalid={props['aria-invalid'] ? 'true' : undefined}
        aria-description={props.accessibilityHint as string}
        aria-expanded={
          (props['aria-expanded'] as boolean | undefined) ??
          (accessibilityState as { expanded?: boolean })?.expanded
        }
        aria-busy={(accessibilityState as { busy?: boolean })?.busy ? 'true' : undefined}
        aria-disabled={
          props['aria-disabled']
            ? 'true'
            : (accessibilityState as { disabled?: boolean })?.disabled
              ? 'true'
              : undefined
        }
        aria-readonly={props['aria-readonly'] ? 'true' : undefined}
        onKeyDownCapture={props.onKeyDownCapture as KeyboardEventHandler<HTMLButtonElement>}
        onKeyDown={props.onKeyDown as KeyboardEventHandler<HTMLButtonElement>}
        data-style={JSON.stringify(flatten(style))}
        data-hitslop={props.hitSlop as string}
      >
        {children as ReactNode}
      </button>
    );
  }
);

export function Text({ children, style, ...props }: AnyProps) {
  return createElement(
    'span',
    {
      'data-style': JSON.stringify(flatten(style)),
      'data-testid': props.testID as string,
      'aria-live': props.accessibilityLiveRegion,
      id: props.nativeID,
    } as unknown as HTMLAttributes<HTMLSpanElement>,
    children as ReactNode
  );
}

export const View = forwardRef<HTMLDivElement, AnyProps>((props, ref) => {
  const node = useRef<HTMLDivElement>(null);
  const state = props.accessibilityState as { disabled?: boolean; busy?: boolean } | undefined;
  const identifier = props.testID;
  const rect =
    (typeof identifier === 'string' ? layoutOverrides.get(identifier) : undefined) ??
    (flatten(props.style).flex === 1
      ? { x: 0, y: 0, width: windowSize.width, height: windowSize.height }
      : identifier === 'panel'
        ? { x: 0, y: 50, width: 100, height: 80 }
        : { x: 0, y: 0, width: 100, height: 44 });
  const isDialogLayoutTarget =
    props.accessibilityRole === 'dialog' ||
    props.role === 'dialog' ||
    (typeof props.nativeID === 'string' && props.nativeID.endsWith('-surface')) ||
    identifier === 'panel' ||
    (typeof identifier === 'string' && identifier.endsWith('-viewport'));
  if (typeof identifier === 'string') {
    const handlers = Object.fromEntries(
      [
        'onStartShouldSetResponder',
        'onMoveShouldSetResponder',
        'onResponderGrant',
        'onResponderMove',
        'onResponderRelease',
        'onResponderTerminate',
        'onResponderTerminationRequest',
      ]
        .map(name => [name, props[name]])
        .filter(
          (entry): entry is [string, (event: unknown, gesture: GestureState) => unknown] =>
            typeof entry[1] === 'function'
        )
    );
    if (Object.keys(handlers).length) responderHandlers.set(identifier, handlers);
    else responderHandlers.delete(identifier);
  }
  useImperativeHandle(ref, () =>
    Object.assign(node.current as HTMLDivElement, {
      measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) =>
        callback(rect.x, rect.y, rect.width, rect.height),
    })
  );
  useEffect(() => {
    if (isDialogLayoutTarget && typeof props.onLayout === 'function') {
      (props.onLayout as (event: unknown) => void)({ nativeEvent: { layout: rect } });
    }
  }, [isDialogLayoutTarget, props.onLayout, rect]);
  return createElement(
    'div',
    {
      ref: node,
      tabIndex: props.tabIndex,
      id: props.nativeID,
      'data-testid': props.testID,
      'data-role': props.accessibilityRole as string,
      role: (props.role as string) ?? (props.accessibilityRole as string),
      'aria-label': props.accessibilityLabel as string,
      'aria-labelledby': props['aria-labelledby'] as string,
      'aria-describedby': props['aria-describedby'] as string,
      'aria-modal': props['aria-modal'] ? 'true' : undefined,
      'data-accessibility-modal': props.accessibilityViewIsModal,
      'aria-readonly': props['aria-readonly'] ? 'true' : undefined,
      'aria-required': props['aria-required'] ? 'true' : undefined,
      'aria-invalid': props['aria-invalid'] ? 'true' : undefined,
      'aria-disabled': props['aria-disabled'] ? 'true' : state?.disabled ? 'true' : undefined,
      'data-popover-host': flatten(props.style).flex === 1 ? 'true' : undefined,
      'aria-busy': state?.busy ? 'true' : undefined,
      'aria-hidden': props['aria-hidden'],
      'data-hidden-ios': props.accessibilityElementsHidden,
      'data-hidden-android': props.importantForAccessibility,
      'data-style': JSON.stringify(flatten(props.style)),
      onTouchStartCapture: props.onTouchStartCapture,
      onTouchMoveCapture: props.onTouchMoveCapture,
      onTouchEndCapture: props.onTouchEndCapture,
      onKeyDown: (event: { key: string }) =>
        (props.onKeyDown as ((event: unknown) => void) | undefined)?.(event),
      onKeyDownCapture: (event: unknown) =>
        (props.onKeyDownCapture as ((event: unknown) => void) | undefined)?.(event),
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      onPointerEnter: props.onPointerEnter,
      onPointerLeave: props.onPointerLeave,
    } as unknown as HTMLAttributes<HTMLDivElement>,
    props.children as ReactNode
  );
});

export const ScrollView = View;
export const SafeAreaView = View;

export function Modal(props: AnyProps) {
  const visible = Boolean(props.visible);
  const onRequestClose = props.onRequestClose as (() => void) | undefined;
  const onShow = props.onShow as (() => void) | undefined;
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!visible) return;
    const host = document.createElement('div');
    host.dataset.nativeModalPortal = 'true';
    document.body.append(host);
    setPortal(host);
    if (onRequestClose) modalCloseHandlers.add(onRequestClose);
    const requestEscapeClose = (event: KeyboardEvent) => {
      if (Platform.OS === 'web' && event.key === 'Escape') {
        event.stopPropagation();
        onRequestClose?.();
      }
    };
    document.addEventListener('keyup', requestEscapeClose);
    return () => {
      document.removeEventListener('keyup', requestEscapeClose);
      if (onRequestClose) modalCloseHandlers.delete(onRequestClose);
      setPortal(null);
      host.remove();
    };
  }, [visible, onRequestClose]);
  useEffect(() => {
    if (visible && portal) onShow?.();
  }, [onShow, portal, visible]);
  if (!visible || !portal) return null;
  return createPortal(
    createElement(
      'div',
      {
        'data-modal': 'true',
        'data-testid': props.testID,
        'data-animation-type': props.animationType,
        role: Platform.OS === 'web' ? 'dialog' : undefined,
        'aria-modal': Platform.OS === 'web' ? 'true' : undefined,
        'aria-labelledby': props['aria-labelledby'],
        'aria-describedby': props['aria-describedby'],
      },
      props.children as ReactNode
    ),
    portal
  );
}

export const TextInput = forwardRef<HTMLInputElement, AnyProps>((props, ref) => {
  const state = props.accessibilityState as { disabled?: boolean } | undefined;
  const commonProps = {
    ref,
    value: props.value,
    readOnly: !props.editable,
    disabled: props.disabled,
    'aria-disabled': state?.disabled ? 'true' : undefined,
    'aria-label': props.accessibilityLabel,
    'aria-description': props.accessibilityHint,
    'aria-required': props['aria-required'],
    'aria-invalid': props['aria-invalid'],
    'aria-readonly': props['aria-readonly'],
    'aria-describedby': props['aria-describedby'],
    placeholder: props.placeholder,
    maxLength: props.maxLength,
    type: props.secureTextEntry ? 'password' : 'text',
    'data-keyboard': props.keyboardType,
    'data-input-mode': props.inputMode,
    'data-autocomplete': props.autoComplete,
    'data-placeholder-color': props.placeholderTextColor,
    'data-style': JSON.stringify(flatten(props.style)),
    'data-testid': props.testID,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    onInput: (event: { currentTarget: HTMLInputElement }) =>
      (props.onChangeText as ((value: string) => void) | undefined)?.(event.currentTarget.value),
    onKeyDown: (event: { key: string }) => {
      if (event.key === 'Enter') (props.onSubmitEditing as (() => void) | undefined)?.();
    },
  };
  if (props.multiline) {
    return createElement('textarea', {
      ...commonProps,
      rows: props.numberOfLines,
      'data-submit-behavior': props.submitBehavior,
    } as unknown as HTMLAttributes<HTMLTextAreaElement>);
  }
  return createElement('input', commonProps);
});

export function Switch({ ...props }: AnyProps) {
  const accessibilityState = props.accessibilityState as
    | { checked?: boolean; disabled?: boolean }
    | undefined;
  const disabled = Boolean(props.disabled ?? accessibilityState?.disabled);
  const checked = Boolean(props.value ?? accessibilityState?.checked);
  return createElement('input', {
    type: 'checkbox',
    role: 'switch',
    checked,
    disabled,
    'data-testid': props.testID,
    'data-role': props.accessibilityRole,
    'data-style': JSON.stringify(flatten(props.style)),
    'data-track-color': JSON.stringify(props.trackColor),
    'data-thumb-color': props.thumbColor,
    'data-active-thumb-color': props.activeThumbColor,
    'aria-label': props.accessibilityLabel,
    'aria-description': props.accessibilityHint,
    'aria-checked': String(checked),
    'aria-disabled': disabled ? 'true' : undefined,
    onChange: (event: { currentTarget: HTMLInputElement }) =>
      (props.onValueChange as ((value: boolean) => void) | undefined)?.(
        event.currentTarget.checked
      ),
  });
}

export function ActivityIndicator() {
  return createElement('span', { 'data-testid': 'activity-indicator' });
}

export function Path(props: AnyProps) {
  return createElement('path', props);
}

export function Circle(props: AnyProps) {
  return createElement('circle', props);
}

export function Ellipse(props: AnyProps) {
  return createElement('ellipse', props);
}

export function Line(props: AnyProps) {
  return createElement('line', props);
}

export function Polyline(props: AnyProps) {
  return createElement('polyline', props);
}

export function Polygon(props: AnyProps) {
  return createElement('polygon', props);
}

export function Rect(props: AnyProps) {
  return createElement('rect', props);
}

export function Svg({ children, accessibilityLabel, accessibilityRole, ...props }: AnyProps) {
  const domProps = { ...props };
  delete domProps.accessible;
  delete domProps.accessibilityElementsHidden;
  delete domProps.importantForAccessibility;
  return createElement(
    'svg',
    {
      ...domProps,
      'aria-label': accessibilityLabel ?? props['aria-label'],
      role: accessibilityRole === 'image' ? 'img' : (accessibilityRole ?? props.role),
      'data-accessible': props.accessible === undefined ? undefined : String(props.accessible),
      'data-hidden-ios':
        props.accessibilityElementsHidden === undefined
          ? undefined
          : String(props.accessibilityElementsHidden),
      'data-hidden-android': props.importantForAccessibility,
    },
    children
  );
}

export const StyleSheet = {
  create: <T,>(styles: T) => styles,
  flatten,
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
};
