import {
  type CheckboxCheckedChangeDetail,
  type ContractProps,
  checkboxContract,
  validateSize,
} from '@joralvmel/cosmos-core';
import { check } from '@joralvmel/cosmos-icons/check';
import { minus } from '@joralvmel/cosmos-icons/minus';
import { type ReactNode, useState } from 'react';
import {
  Platform,
  Pressable,
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';
import { Icon } from './icon.js';

type ContractCheckboxProps = ContractProps<typeof checkboxContract, 'native'>;

export interface CheckboxProps extends ContractCheckboxProps {
  children?: ReactNode;
  onCheckedChange?: (detail: CheckboxCheckedChangeDetail) => void;
  style?: StyleProp<ViewStyle>;
  boxStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helpTextStyle?: StyleProp<TextStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const checkboxPropNames = [
  'label',
  'hideLabel',
  'checked',
  'defaultChecked',
  'indeterminate',
  'size',
  'disabled',
  'required',
  'invalid',
  'helpText',
  'errorText',
] as const satisfies readonly (keyof ContractCheckboxProps)[];

const MIN_TOUCH_TARGET = 44;
const sizeDimensions = { sm: 16, md: 20, lg: 24 } as const;

interface WebKeyEvent {
  key: string;
  defaultPrevented?: boolean;
  preventDefault(): void;
}

function indicator(icon: typeof check | typeof minus, color: string, dimension: number) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Icon icon={icon} size={Math.min(16, dimension * 0.72)} stroke={color} />
    </View>
  );
}

/** Native checkbox with controlled/autonomous state and a minimum 44pt touch target. */
export function Checkbox({
  label,
  hideLabel = checkboxContract.props.hideLabel.default,
  checked,
  defaultChecked = checkboxContract.props.defaultChecked.default,
  indeterminate = checkboxContract.props.indeterminate.default,
  size = checkboxContract.props.size.default,
  disabled = checkboxContract.props.disabled.default,
  required = checkboxContract.props.required.default,
  invalid = checkboxContract.props.invalid.default,
  helpText,
  errorText,
  children,
  onCheckedChange,
  style,
  boxStyle,
  labelStyle,
  helpTextStyle,
  errorTextStyle,
  testID,
}: CheckboxProps) {
  const theme = useTheme();
  const [ownedChecked, setOwnedChecked] = useState(defaultChecked);
  const [mixedState, setMixedState] = useState({ indeterminate, dismissed: false });
  const [focused, setFocused] = useState(false);
  if (mixedState.indeterminate !== indeterminate) {
    setMixedState({ indeterminate, dismissed: false });
  }
  const controlled = checked !== undefined;
  const currentChecked = controlled ? checked : ownedChecked;
  const currentIndeterminate = Boolean(indeterminate && !mixedState.dismissed);
  const currentInvalid = invalid || Boolean(errorText);
  const dimension = typeof size === 'number' ? size : sizeDimensions[size];
  const description = [helpText, errorText].filter(Boolean).join('. ');
  const activate = () => {
    if (disabled) return;
    const next = !currentChecked;
    if (!controlled) {
      setOwnedChecked(next);
      setMixedState({ indeterminate, dismissed: true });
    }
    onCheckedChange?.({ checked: next });
  };
  const handleWebKeyDown = (event: unknown) => {
    if (Platform.OS !== 'web' || disabled) return;
    const keyEvent = event as WebKeyEvent;
    if (keyEvent.defaultPrevented || keyEvent.key !== ' ') return;
    keyEvent.preventDefault();
    activate();
  };

  if (typeof label !== 'string' || !label.trim()) {
    throw new TypeError('Checkbox requires a non-empty label.');
  }
  validateSize(size, 'Checkbox');
  if (typeof defaultChecked !== 'boolean') {
    throw new TypeError('Checkbox defaultChecked must be a boolean.');
  }
  if (typeof checked !== 'undefined' && typeof checked !== 'boolean') {
    throw new TypeError('Checkbox checked must be a boolean.');
  }

  const webAccessibility =
    Platform.OS === 'web'
      ? {
          'aria-checked': currentIndeterminate ? ('mixed' as const) : currentChecked,
          'aria-required': required || undefined,
          'aria-invalid': currentInvalid || undefined,
          'aria-describedby': description || undefined,
        }
      : {};
  const descriptionStyle = {
    color: theme.colors['fg-muted'],
    fontSize: theme.text.sm,
    marginTop: theme.space.xs,
  } satisfies TextStyle;

  return (
    <View style={style}>
      <Pressable
        testID={testID}
        accessible
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityHint={description || undefined}
        accessibilityState={{
          checked: currentIndeterminate ? 'mixed' : currentChecked,
          disabled,
        }}
        {...webAccessibility}
        disabled={disabled}
        hitSlop={4}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPress={activate}
        onKeyDown={handleWebKeyDown}
        style={[
          {
            minWidth: MIN_TOUCH_TARGET,
            minHeight: MIN_TOUCH_TARGET,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.sm,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
          style={[
            {
              width: dimension,
              height: dimension,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: currentInvalid
                ? theme.colors.danger
                : currentChecked || currentIndeterminate
                  ? theme.colors.primary
                  : theme.colors['border-strong'],
              borderRadius: theme.radius.sm,
              backgroundColor:
                currentChecked || currentIndeterminate ? theme.colors.primary : theme.colors.bg,
              ...(Platform.OS === 'web' && focused
                ? {
                    outlineWidth: 2,
                    outlineStyle: 'solid' as const,
                    outlineColor: theme.colors['focus-ring'],
                    outlineOffset: 2,
                  }
                : {}),
            },
            boxStyle,
          ]}
        >
          {currentIndeterminate
            ? indicator(minus, theme.colors['primary-fg'], dimension)
            : currentChecked
              ? indicator(check, theme.colors['primary-fg'], dimension)
              : null}
        </View>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          {!hideLabel && (
            <Text
              accessible={false}
              style={[{ color: theme.colors.fg, fontSize: theme.text.md }, labelStyle]}
            >
              {label}
              {required ? ' *' : ''}
            </Text>
          )}
          {typeof children === 'string' || typeof children === 'number' ? (
            <Text accessible={false} style={{ color: theme.colors.fg, fontSize: theme.text.md }}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      </Pressable>
      {helpText ? <Text style={[descriptionStyle, helpTextStyle]}>{helpText}</Text> : null}
      {errorText ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[{ ...descriptionStyle, color: theme.colors.danger }, errorTextStyle]}
        >
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}
