// Minimal DOM stand-ins for the React Native primitives used by the components under test.
import { createElement, type ReactNode } from 'react';

type AnyProps = Record<string, unknown> & { children?: ReactNode };

let colorScheme: 'light' | 'dark' | null = 'light';
export const __setColorScheme = (value: 'light' | 'dark' | null) => {
  colorScheme = value;
};
export const useColorScheme = () => colorScheme;
export const Platform = { OS: 'web' };
export const processColor = (value: string) => value;
export const unstable_createElement = createElement;

const flatten = (style: unknown, state = { pressed: false }): Record<string, unknown> => {
  const value = typeof style === 'function' ? style(state) : style;
  if (Array.isArray(value)) return Object.assign({}, ...value.map(item => flatten(item, state)));
  return (value as Record<string, unknown>) ?? {};
};

export function Pressable({ children, onPress, disabled, style, ...props }: AnyProps) {
  return createElement(
    'button',
    {
      type: 'button',
      disabled: Boolean(disabled),
      onClick: onPress as () => void,
      'data-testid': props.testID,
      'data-role': props.accessibilityRole,
      'aria-label': props.accessibilityLabel,
      'aria-busy': (props.accessibilityState as { busy?: boolean })?.busy ? 'true' : undefined,
      'aria-disabled': (props.accessibilityState as { disabled?: boolean })?.disabled
        ? 'true'
        : undefined,
      'data-style': JSON.stringify(flatten(style)),
      'data-hitslop': props.hitSlop,
    },
    children
  );
}

export function Text({ children, style }: AnyProps) {
  return createElement('span', { 'data-style': JSON.stringify(flatten(style)) }, children);
}

export function View({ children, ...props }: AnyProps) {
  const state = props.accessibilityState as { disabled?: boolean; busy?: boolean } | undefined;
  return createElement(
    'div',
    {
      'data-testid': props.testID,
      'aria-disabled': state?.disabled ? 'true' : undefined,
      'aria-busy': state?.busy ? 'true' : undefined,
    },
    children
  );
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

export const StyleSheet = { create: <T,>(styles: T) => styles };
