import {
  type ContractProps,
  type SwitchCheckedChangeDetail,
  switchContract,
} from '@joralvmel/cosmos-core';
import { useState } from 'react';
import {
  Switch as NativeSwitch,
  Platform,
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';

type ContractSwitchProps = ContractProps<typeof switchContract, 'native'>;

export interface SwitchProps extends ContractSwitchProps {
  onCheckedChange?: (detail: SwitchCheckedChangeDetail) => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helpTextStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const switchPropNames = [
  'label',
  'hideLabel',
  'checked',
  'defaultChecked',
  'disabled',
  'invalid',
  'helpText',
] as const satisfies readonly (keyof ContractSwitchProps)[];

const MIN_TOUCH_TARGET = 44;

/** Native binary switch with controlled proposals and the platform's system-sized control. */
export function Switch({
  label,
  hideLabel = switchContract.props.hideLabel.default,
  checked,
  defaultChecked = switchContract.props.defaultChecked.default,
  disabled = switchContract.props.disabled.default,
  invalid = switchContract.props.invalid.default,
  helpText,
  onCheckedChange,
  style,
  labelStyle,
  helpTextStyle,
  testID,
}: SwitchProps) {
  const theme = useTheme();
  const [ownedChecked, setOwnedChecked] = useState(defaultChecked);
  const [, setControlledRevision] = useState(0);
  const controlled = checked !== undefined;
  const currentChecked = controlled ? checked : ownedChecked;
  // React Native Web uses a separate color for the active thumb.
  const webColors = Platform.OS === 'web' ? { activeThumbColor: theme.colors['primary-fg'] } : {};

  if (typeof label !== 'string' || !label.trim()) {
    throw new TypeError('Switch requires a non-empty label.');
  }
  if (typeof defaultChecked !== 'boolean') {
    throw new TypeError('Switch defaultChecked must be a boolean.');
  }
  if (typeof checked !== 'undefined' && typeof checked !== 'boolean') {
    throw new TypeError('Switch checked must be a boolean.');
  }

  const handleValueChange = (next: boolean) => {
    if (disabled) return;
    if (!controlled) setOwnedChecked(next);
    else setControlledRevision(revision => revision + 1);
    onCheckedChange?.({ checked: next });
  };
  const textStyle = {
    color: theme.colors.fg,
    fontSize: theme.text.md,
  } satisfies TextStyle;

  return (
    <View
      testID={testID}
      style={[
        style,
        {
          minHeight: MIN_TOUCH_TARGET,
          gap: theme.space['2xs'],
          opacity: disabled ? 0.56 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
        <NativeSwitch
          {...webColors}
          testID={testID ? `${testID}-control` : undefined}
          accessibilityLabel={label}
          accessibilityHint={helpText || undefined}
          value={currentChecked}
          disabled={disabled}
          trackColor={{
            false: invalid ? theme.colors.danger : theme.colors['border-strong'],
            true: invalid ? theme.colors.danger : theme.colors.primary,
          }}
          thumbColor={currentChecked ? theme.colors['primary-fg'] : theme.colors.bg}
          ios_backgroundColor={invalid ? theme.colors.danger : theme.colors['border-strong']}
          onValueChange={handleValueChange}
          style={{ minHeight: MIN_TOUCH_TARGET, minWidth: MIN_TOUCH_TARGET }}
        />
        {!hideLabel ? (
          <Text style={[textStyle, { flexShrink: 1 }, labelStyle]}>{label}</Text>
        ) : null}
      </View>
      {helpText ? (
        <Text
          style={[
            {
              color: theme.colors['fg-muted'],
              fontSize: theme.text.sm,
            },
            helpTextStyle,
          ]}
        >
          {helpText}
        </Text>
      ) : null}
    </View>
  );
}
