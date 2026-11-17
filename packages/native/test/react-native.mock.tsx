// Minimal DOM stand-ins for the React Native primitives used by the components under test.
import {
  createElement,
  type FocusEventHandler,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

type AnyProps = Record<string, unknown> & { children?: ReactNode };

let colorScheme: 'light' | 'dark' | null = 'light';
export const __setColorScheme = (value: 'light' | 'dark' | null) => {
  colorScheme = value;
};
export const useColorScheme = () => colorScheme;
export const Platform = { OS: 'web' as string };
export const __setPlatformOS = (value: string) => {
  Platform.OS = value;
};
export const processColor = (value: string) => value;
export const unstable_createElement = createElement;
const focusNodes = new Map<number, HTMLElement>();
export const findNodeHandle = (node: HTMLElement) => {
  const tag = focusNodes.size + 1;
  focusNodes.set(tag, node);
  return tag;
};
export const I18nManager = { isRTL: false };
export const useWindowDimensions = () => ({ width: 320, height: 640, scale: 1, fontScale: 1 });
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
export const AccessibilityInfo = {
  setAccessibilityFocus: (tag: number) => {
    __accessibilityFocusCalls.push(tag);
    const node = focusNodes.get(tag);
    if (node?.isConnected) {
      (node.querySelector<HTMLElement>('button, input, [tabindex]') ?? node).focus();
    }
    return Promise.resolve();
  },
};

const flatten = (style: unknown, state = { pressed: false }): Record<string, unknown> => {
  const value = typeof style === 'function' ? style(state) : style;
  if (Array.isArray(value)) return Object.assign({}, ...value.map(item => flatten(item, state)));
  return (value as Record<string, unknown>) ?? {};
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
        id={props.id as string}
        role={(props.role as string) ?? (props.accessibilityRole as string)}
        tabIndex={props.tabIndex as number}
        aria-selected={
          props['aria-selected'] === undefined
            ? Boolean((accessibilityState as { selected?: boolean })?.selected) || undefined
            : Boolean(props['aria-selected'])
        }
        aria-describedby={props['aria-describedby'] as string}
        data-testid={props.testID as string}
        data-role={props.accessibilityRole as string}
        aria-label={props.accessibilityLabel as string}
        aria-expanded={(accessibilityState as { expanded?: boolean })?.expanded ? 'true' : 'false'}
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
    flatten(props.style).flex === 1
      ? { x: 0, y: 0, width: 320, height: 640 }
      : identifier === 'panel'
        ? { x: 0, y: 50, width: 100, height: 80 }
        : { x: 0, y: 0, width: 100, height: 44 };
  useImperativeHandle(ref, () =>
    Object.assign(node.current as HTMLDivElement, {
      measureInWindow: (callback: (x: number, y: number, width: number, height: number) => void) =>
        callback(rect.x, rect.y, rect.width, rect.height),
    })
  );
  useEffect(() => {
    if (props.testID === 'panel' && typeof props.onLayout === 'function') {
      (props.onLayout as (event: unknown) => void)({
        nativeEvent: { layout: { width: 100, height: 80 } },
      });
    }
  }, [props.testID, props.onLayout]);
  return createElement(
    'div',
    {
      ref: node,
      tabIndex: props.tabIndex,
      'data-testid': props.testID,
      role: props.role as string,
      'aria-label': props.accessibilityLabel as string,
      'aria-labelledby': props['aria-labelledby'] as string,
      'aria-readonly': props['aria-readonly'] ? 'true' : undefined,
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
    } as unknown as HTMLAttributes<HTMLDivElement>,
    props.children as ReactNode
  );
});

export const ScrollView = View;

export const TextInput = forwardRef<HTMLInputElement, AnyProps>((props, ref) => {
  const state = props.accessibilityState as { disabled?: boolean } | undefined;
  return createElement('input', {
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
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    onInput: (event: { currentTarget: HTMLInputElement }) =>
      (props.onChangeText as ((value: string) => void) | undefined)?.(event.currentTarget.value),
    onKeyDown: (event: { key: string }) => {
      if (event.key === 'Enter') (props.onSubmitEditing as (() => void) | undefined)?.();
    },
  });
});

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

export const StyleSheet = { create: <T,>(styles: T) => styles, flatten };
