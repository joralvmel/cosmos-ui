import {
  type ContractProps,
  type TextareaChangeDetail,
  textareaContract,
} from '@joralvmel/cosmos-core';
import { type ComponentRef, useId, useRef, useState } from 'react';
import {
  Platform,
  type StyleProp,
  Text,
  TextInput,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';

type ContractTextareaProps = ContractProps<typeof textareaContract, 'native'>;

/** Theme-token overrides for the multiline control. */
export interface TextareaAppearance {
  background?: string;
  text?: string;
  placeholder?: string;
  border?: string;
  focus?: string;
  radius?: number;
}

export interface TextareaProps extends ContractTextareaProps {
  /** Receives the contract detail; controlled values wait for the owner. */
  onValueChange?: (detail: TextareaChangeDetail) => void;
  /** Style for the outer label/control/messages. */
  style?: StyleProp<ViewStyle>;
  /** Style for the native multiline editor. */
  inputStyle?: StyleProp<TextStyle>;
  /** Style for the visible accessible label. */
  labelStyle?: StyleProp<TextStyle>;
  /** Style for supporting text. */
  helpStyle?: StyleProp<TextStyle>;
  /** Style for error text. */
  errorStyle?: StyleProp<TextStyle>;
  /** Theme-derived color and radius overrides. */
  appearance?: TextareaAppearance;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const textareaPropNames = [
  'label',
  'labelHidden',
  'value',
  'defaultValue',
  'rows',
  'variant',
  'size',
  'placeholder',
  'helpText',
  'error',
  'invalid',
  'required',
  'disabled',
  'readOnly',
  'maxLength',
] as const satisfies readonly (keyof ContractTextareaProps)[];

const MIN_TOUCH_TARGET = 44;

/** Multiline native text input. */
export function Textarea({
  label,
  labelHidden = textareaContract.props.labelHidden.default,
  value,
  defaultValue = textareaContract.props.defaultValue.default,
  rows = textareaContract.props.rows.default,
  variant = textareaContract.props.variant.default,
  size = textareaContract.props.size.default,
  placeholder,
  helpText,
  error,
  invalid = textareaContract.props.invalid.default,
  required = textareaContract.props.required.default,
  disabled = textareaContract.props.disabled.default,
  readOnly = textareaContract.props.readOnly.default,
  maxLength,
  onValueChange,
  style,
  inputStyle,
  labelStyle,
  helpStyle,
  errorStyle,
  appearance,
  testID,
}: TextareaProps) {
  const theme = useTheme();
  const [ownedValue, setOwnedValue] = useState(defaultValue);
  const [, forceRender] = useState(0);
  const [focused, setFocused] = useState(false);
  const descriptionId = useId();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const currentValue = value !== undefined ? value : ownedValue;
  const isInvalid = invalid || Boolean(error);
  const description = [required ? 'Required' : '', helpText, error].filter(Boolean).join('. ');
  const fontSize = theme.text[size];
  const lineHeight = fontSize * 1.5;
  const padding = theme.space.sm;
  const webSemantics =
    Platform.OS === 'web'
      ? {
          disabled,
          'aria-required': required || undefined,
          'aria-invalid': isInvalid,
          'aria-readonly': readOnly || undefined,
          'aria-describedby':
            [helpText && `${descriptionId}-help`, error && `${descriptionId}-error`]
              .filter(Boolean)
              .join(' ') || undefined,
        }
      : {};

  if (typeof label !== 'string' || !label.trim())
    throw new TypeError('Textarea requires a non-empty label.');
  if (!Number.isInteger(rows) || rows < 1)
    throw new TypeError('Textarea rows must be a positive integer.');
  if (maxLength !== undefined && (!Number.isInteger(maxLength) || maxLength < 0))
    throw new TypeError('Textarea maxLength must be a nonnegative integer.');

  const propose = (nextValue: string) => {
    if (disabled || readOnly) return;
    if (value === undefined) setOwnedValue(nextValue);
    else forceRender(previous => previous + 1);
    onValueChange?.({ value: nextValue });
  };

  return (
    <View testID={testID} style={style}>
      {!labelHidden && (
        <Text
          accessible={false}
          style={[
            { color: theme.colors.fg, fontSize: theme.text.sm, marginBottom: theme.space.xs },
            labelStyle,
          ]}
        >
          {label}
          {required ? ' *' : ''}
        </Text>
      )}
      <View
        style={[
          {
            minHeight: Math.max(MIN_TOUCH_TARGET, rows * lineHeight + padding * 2),
            borderWidth: 1,
            borderColor: focused
              ? (appearance?.focus ?? theme.colors.primary)
              : isInvalid
                ? theme.colors.danger
                : (appearance?.border ?? theme.colors['border-strong']),
            borderRadius: appearance?.radius ?? theme.radius.md,
            backgroundColor:
              appearance?.background ??
              (variant === 'filled' ? theme.colors['surface-raised'] : theme.colors.bg),
            ...(Platform.OS === 'web'
              ? {
                  outlineWidth: focused ? 2 : 0,
                  outlineOffset: -2,
                  outlineStyle: 'solid' as const,
                  outlineColor: appearance?.focus ?? theme.colors.primary,
                }
              : {}),
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          testID={testID ? `${testID}-input` : undefined}
          accessibilityLabel={label}
          accessibilityHint={description || undefined}
          accessibilityState={{ disabled }}
          {...webSemantics}
          value={currentValue}
          editable={!disabled && !readOnly}
          multiline
          numberOfLines={rows}
          submitBehavior="newline"
          textAlignVertical="top"
          placeholder={placeholder}
          placeholderTextColor={appearance?.placeholder ?? theme.colors['fg-muted']}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={propose}
          style={[
            {
              minHeight: Math.max(MIN_TOUCH_TARGET - 2, rows * lineHeight),
              paddingVertical: padding,
              paddingHorizontal: theme.space.md,
              color: appearance?.text ?? theme.colors.fg,
              fontSize,
              lineHeight,
              textAlignVertical: 'top',
              ...(Platform.OS === 'web'
                ? {
                    outlineWidth: 0,
                    outlineStyle: 'solid' as const,
                  }
                : {}),
            },
            inputStyle,
          ]}
        />
      </View>
      {helpText && (
        <Text
          nativeID={`${descriptionId}-help`}
          style={[
            { color: theme.colors['fg-muted'], fontSize: theme.text.sm, marginTop: theme.space.xs },
            helpStyle,
          ]}
        >
          {helpText}
        </Text>
      )}
      {error && (
        <Text
          nativeID={`${descriptionId}-error`}
          accessibilityLiveRegion="polite"
          style={[
            { color: theme.colors.danger, fontSize: theme.text.sm, marginTop: theme.space.xs },
            errorStyle,
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
