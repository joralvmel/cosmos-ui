import {
  type ButtonPressDetail,
  type ContractProps,
  type IconButtonPressedChangeDetail,
  iconButtonContract,
} from '@joralvmel/cosmos-core';
import type { NativeTheme } from '@joralvmel/cosmos-tokens/native';
import type { ComponentRef, ReactNode, Ref } from 'react';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  type PressableStateCallbackType,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { IconColorContext } from '../internal/icon-color.js';
import { useTheme } from '../theme/theme-provider.js';

type ContractIconButtonProps = ContractProps<typeof iconButtonContract, 'native'>;

export interface IconButtonProps extends ContractIconButtonProps {
  children?: ReactNode;
  /** Called on each enabled activation with the same detail as the shared press event. */
  onPress?: (detail: ButtonPressDetail) => void;
  /** Receives the proposed next value; controlled state changes only when the owner updates it. */
  onPressedChange?: (detail: IconButtonPressedChangeDetail) => void;
  /** Native Pressable layout customization. The 44pt minimum touch target is retained. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Host ref and expanded state for composition with anchored surfaces. */
  ref?: Ref<ComponentRef<typeof Pressable>>;
  accessibilityState?: { expanded?: boolean };
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const iconButtonPropNames = [
  'label',
  'mode',
  'variant',
  'tone',
  'size',
  'disabled',
  'pressed',
  'defaultPressed',
] as const satisfies readonly (keyof ContractIconButtonProps)[];

const MIN_TOUCH_TARGET = 44;

function palette(theme: NativeTheme, tone: NonNullable<IconButtonProps['tone']>) {
  const { colors } = theme;
  if (tone === 'neutral') {
    return {
      solid: colors.fg,
      onSolid: colors.bg,
      subtle: colors['surface-raised'],
      text: colors.fg,
    };
  }
  return {
    solid: colors[tone],
    onSolid: colors[`${tone}-fg`],
    subtle: colors[`${tone}-subtle`],
    text: colors[`${tone}-text`],
  };
}

/** Native icon button with the same contract as `<cosm-icon-button>`. */
export function IconButton({
  label,
  mode = iconButtonContract.props.mode.default,
  variant = iconButtonContract.props.variant.default,
  tone = iconButtonContract.props.tone.default,
  size = iconButtonContract.props.size.default,
  disabled = iconButtonContract.props.disabled.default,
  pressed,
  defaultPressed = iconButtonContract.props.defaultPressed.default,
  children,
  onPress,
  onPressedChange,
  style,
  testID,
  ref,
  accessibilityState,
}: IconButtonProps) {
  if (typeof label !== 'string' || !label.trim()) {
    throw new TypeError('IconButton requires a non-empty "label".');
  }

  const theme = useTheme();
  const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed);
  const controlled = pressed !== undefined;
  const currentPressed = controlled ? pressed : uncontrolledPressed;
  const selected = mode === 'toggle' && currentPressed;
  const colors = palette(theme, tone);
  const background =
    variant === 'solid' ? colors.solid : variant === 'soft' ? colors.subtle : 'transparent';
  const foreground = variant === 'solid' ? colors.onSolid : colors.text;
  const dimension = theme.control[size];
  const customStyle = StyleSheet.flatten(style);
  const minHeight = Math.max(
    MIN_TOUCH_TARGET,
    typeof customStyle?.minHeight === 'number' ? customStyle.minHeight : 0
  );
  const minWidth = Math.max(
    MIN_TOUCH_TARGET,
    typeof customStyle?.minWidth === 'number' ? customStyle.minWidth : 0
  );
  const active = !disabled;
  const accessibility =
    Platform.OS === 'web'
      ? {
          accessibilityRole: 'button' as const,
          accessibilityState: { disabled, ...accessibilityState },
          'aria-expanded': accessibilityState?.expanded,
          'aria-pressed': mode === 'toggle' ? currentPressed : undefined,
        }
      : {
          accessibilityRole: mode === 'toggle' ? ('togglebutton' as const) : ('button' as const),
          accessibilityState: {
            disabled,
            ...accessibilityState,
            checked: mode === 'toggle' ? currentPressed : undefined,
          },
        };

  const pressableStyle = ({
    pressed: isPressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> => [
    style,
    {
      minWidth,
      minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : isPressed ? 0.85 : 1,
    },
  ];

  return (
    <Pressable
      ref={ref}
      testID={testID}
      accessibilityLabel={label}
      {...accessibility}
      accessible
      disabled={disabled}
      onPress={
        active
          ? () => {
              onPress?.({ source: 'pointer' });
              if (mode === 'toggle') {
                const nextPressed = !currentPressed;
                onPressedChange?.({ pressed: nextPressed });
                if (!controlled) setUncontrolledPressed(nextPressed);
              }
            }
          : undefined
      }
      style={pressableStyle}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        aria-hidden
        style={{
          width: dimension,
          height: dimension,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.md,
          borderWidth: selected ? 2 : 1,
          borderColor: selected
            ? foreground
            : variant === 'outline'
              ? theme.colors['border-strong']
              : 'transparent',
          backgroundColor: background,
        }}
      >
        <IconColorContext.Provider value={foreground}>{children}</IconColorContext.Provider>
      </View>
    </Pressable>
  );
}
