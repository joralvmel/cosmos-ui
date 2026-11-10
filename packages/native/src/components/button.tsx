import {
  type ButtonPressDetail,
  buttonContract,
  type ContractProps,
  getPressableState,
} from '@joralvmel/cosmos-core';
import type { NativeTheme } from '@joralvmel/cosmos-tokens/native';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableStateCallbackType,
  type StyleProp,
  Text,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';

type ContractButtonProps = ContractProps<typeof buttonContract, 'native'>;

export interface ButtonProps extends ContractButtonProps {
  children?: ReactNode;
  /** Called when the button is activated (same detail as the web `cosm-press` event). */
  onPress?: (detail: ButtonPressDetail) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Props handled by the native button; checked against the contract by the drift test. */
export const buttonPropNames = [
  'variant',
  'tone',
  'size',
  'disabled',
  'loading',
  'fullWidth',
  'label',
] as const satisfies readonly (keyof ContractButtonProps)[];

const MIN_TOUCH_TARGET = 44;

function palette(theme: NativeTheme, tone: NonNullable<ButtonProps['tone']>) {
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

/** Native button with the same contract as `<cosm-button>`. */
export function Button({
  variant = buttonContract.props.variant.default,
  tone = buttonContract.props.tone.default,
  size = buttonContract.props.size.default,
  disabled = buttonContract.props.disabled.default,
  loading = buttonContract.props.loading.default,
  fullWidth = buttonContract.props.fullWidth.default,
  label,
  children,
  onPress,
  style,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const state = getPressableState({ disabled, loading });
  const colors = palette(theme, tone);
  const height = theme.control[size];
  const background =
    variant === 'solid' ? colors.solid : variant === 'soft' ? colors.subtle : 'transparent';
  const foreground = variant === 'solid' ? colors.onSolid : colors.text;
  const padding = { sm: theme.space.md, md: theme.space.lg, lg: theme.space.xl }[size];
  const slop = Math.max(0, (MIN_TOUCH_TARGET - height) / 2);

  const containerStyle = ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
    {
      minHeight: height,
      paddingHorizontal: padding,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: variant === 'outline' ? theme.colors['border-strong'] : 'transparent',
      backgroundColor: background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.space.sm,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
    },
    style,
  ];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: state.disabled, busy: state.busy }}
      disabled={!state.interactive}
      hitSlop={slop}
      onPress={state.interactive ? () => onPress?.({ source: 'pointer' }) : undefined}
      style={containerStyle}
    >
      {loading ? <ActivityIndicator size="small" color={foreground} /> : null}
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          style={{
            color: foreground,
            fontSize: size === 'lg' ? theme.text.md : theme.text.sm,
            fontWeight: theme.weight.semibold,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
