import { badgeContract, type ContractProps } from '@joralvmel/cosmos-core';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import {
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';
import { Icon } from './icon.js';

type ContractBadgeProps = ContractProps<
  typeof badgeContract,
  'native',
  { IconDefinition: IconDefinition }
>;

export interface BadgeProps extends ContractBadgeProps {
  children: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const badgePropNames = [
  'variant',
  'tone',
  'size',
  'startIcon',
] as const satisfies readonly (keyof ContractBadgeProps)[];

/** Static native status/category label; content and announcements remain caller-owned. */
export function Badge({
  variant = badgeContract.props.variant.default,
  tone = badgeContract.props.tone.default,
  size = badgeContract.props.size.default,
  startIcon,
  children,
  style,
  textStyle,
  testID,
}: BadgeProps) {
  const theme = useTheme();
  if (typeof children !== 'string')
    throw new TypeError('Badge requires its label or count as string children.');

  const intent =
    tone === 'neutral'
      ? {
          text: theme.colors.fg,
          soft: theme.colors['surface-raised'],
          solid: theme.colors.fg,
          solidText: theme.colors.bg,
          border: theme.colors['border-strong'],
        }
      : {
          text: theme.colors[`${tone}-text`],
          soft: theme.colors[`${tone}-subtle`],
          solid: theme.colors[tone],
          solidText: theme.colors[`${tone}-fg`],
          border: theme.colors[`${tone}-text`],
        };
  const foreground = variant === 'solid' ? intent.solidText : intent.text;
  const overrideColor = StyleSheet.flatten(textStyle)?.color;
  const iconColor = typeof overrideColor === 'string' ? overrideColor : foreground;
  const fontSize = { sm: theme.text.xs, md: theme.text.sm, lg: theme.text.md }[size];
  const horizontalPadding = {
    sm: theme.space.xs,
    md: theme.space.sm,
    lg: theme.space.md,
  }[size];
  const verticalPadding = {
    sm: theme.space['2xs'],
    md: theme.space.xs,
    lg: theme.space.sm,
  }[size];
  const gap = size === 'lg' ? theme.space.xs : theme.space['2xs'];

  return (
    <View
      testID={testID}
      style={[
        {
          alignSelf: 'flex-start',
          alignItems: 'center',
          flexDirection: 'row',
          gap,
          maxWidth: '100%',
          paddingHorizontal: horizontalPadding,
          paddingVertical: verticalPadding,
          borderWidth: 1,
          borderColor: variant === 'outline' ? intent.border : 'transparent',
          borderRadius: theme.radius.md,
          backgroundColor:
            variant === 'solid' ? intent.solid : variant === 'soft' ? intent.soft : 'transparent',
        },
        style,
      ]}
    >
      {startIcon ? (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Icon icon={startIcon} size={size} stroke={iconColor} />
        </View>
      ) : null}
      <Text
        style={[
          {
            color: foreground,
            fontSize,
            fontWeight: theme.weight.medium,
            fontFamily: theme.fontFamily.sans,
            flexShrink: 1,
            flexWrap: 'wrap',
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}
