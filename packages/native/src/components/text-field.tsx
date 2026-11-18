import {
  type ContractProps,
  getTextFieldState,
  type TextFieldChangeDetail,
  type TextFieldSubmitDetail,
  type textFieldContract,
} from '@joralvmel/cosmos-core';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { eye } from '@joralvmel/cosmos-icons/eye';
import { eyeOff } from '@joralvmel/cosmos-icons/eye-off';
import { x } from '@joralvmel/cosmos-icons/x';
import { type ComponentRef, useEffect, useId, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  type StyleProp,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { IconColorContext } from '../internal/icon-color.js';
import { useTheme } from '../theme/theme-provider.js';
import { Icon } from './icon.js';

type ContractTextFieldProps = ContractProps<
  typeof textFieldContract,
  'native',
  { IconDefinition: IconDefinition }
>;

export interface TextFieldProps extends ContractTextFieldProps {
  onValueChange?: (detail: TextFieldChangeDetail) => void;
  onSubmitEditing?: (detail: TextFieldSubmitDetail) => void;
  style?: StyleProp<ViewStyle>;
  controlStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helpStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  /** Independent visual hooks; omitted values follow the active theme. */
  appearance?: {
    background?: string;
    text?: string;
    placeholder?: string;
    border?: string;
    focus?: string;
    radius?: number;
    startIconColor?: string;
    startIconFocusColor?: string;
    endIconColor?: string;
    endIconFocusColor?: string;
  };
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const textFieldPropNames = [
  'label',
  'labelHidden',
  'value',
  'defaultValue',
  'type',
  'variant',
  'size',
  'placeholder',
  'helpText',
  'error',
  'invalid',
  'required',
  'disabled',
  'readOnly',
  'minLength',
  'maxLength',
  'autoComplete',
  'inputMode',
  'startIcon',
  'endIcon',
  'iconFocusScope',
  'prefix',
  'suffix',
  'clearable',
  'clearLabel',
  'passwordReveal',
  'revealPasswordLabel',
  'hidePasswordLabel',
] as const satisfies readonly (keyof ContractTextFieldProps)[];

const MIN_TARGET = 44;
// React Native 0.88 documents these hints as available on both platforms.
const commonAutofillHints = [
  'additional-name',
  'address-line1',
  'address-line2',
  'birthdate-day',
  'birthdate-full',
  'birthdate-month',
  'birthdate-year',
  'cc-number',
  'cc-csc',
  'cc-exp',
  'cc-exp-day',
  'cc-exp-month',
  'cc-exp-year',
  'country',
  'honorific-prefix',
  'honorific-suffix',
  'off',
  'name',
  'given-name',
  'family-name',
  'email',
  'tel',
  'username',
  'current-password',
  'new-password',
  'one-time-code',
  'postal-code',
  'street-address',
] as const satisfies readonly NonNullable<TextInputProps['autoComplete']>[];
const iosAutofillHints = [
  'cc-name',
  'cc-given-name',
  'cc-middle-name',
  'cc-family-name',
  'cc-type',
  'nickname',
  'organization',
  'organization-title',
  'url',
] as const satisfies readonly NonNullable<TextInputProps['autoComplete']>[];
const androidAutofillHints = [
  '2fa-app-otp',
  'email-otp',
  'flight-confirmation-code',
  'flight-number',
  'gender',
  'gift-card-number',
  'gift-card-pin',
  'loyalty-account-number',
  'name-family',
  'name-given',
  'name-middle',
  'name-middle-initial',
  'name-prefix',
  'name-suffix',
  'password',
  'password-new',
  'postal-address',
  'postal-address-country',
  'postal-address-dependent-locality',
  'postal-address-extended',
  'postal-address-extended-postal-code',
  'postal-address-locality',
  'postal-address-region',
  'postal-address-unit',
  'promo-code',
  'sms-otp',
  'tel-country-code',
  'tel-national',
  'tel-device',
  'upi-vpa',
  'wifi-password',
  'username-new',
] as const satisfies readonly NonNullable<TextInputProps['autoComplete']>[];
const keyboardTypes = {
  text: 'default',
  email: 'email-address',
  password: 'default',
  tel: 'phone-pad',
  url: 'url',
  search: 'default',
} as const;

function DecorativeIcon({ icon, color }: { icon: IconDefinition; color?: string }) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Icon icon={icon} {...(color ? { stroke: color } : {})} />
    </View>
  );
}

/**
 * Single-line native text field. Only maxLength is enforced; consumers own other validation.
 * On iOS/Android, RN exposes no required or invalid accessibility state. Include localized
 * required information in label/helpText and provide an error message for invalid fields.
 * Help and errors are supplied as accessibility hints and separately readable text; hint and
 * live-region announcements depend on platform and screen-reader settings.
 * autoComplete accepts RN 0.88 documented hints for the current platform; some need iOS 17+.
 */
export function TextField({
  label,
  labelHidden = false,
  value,
  defaultValue = '',
  type = 'text',
  variant = 'outlined',
  size = 'md',
  placeholder,
  helpText,
  error,
  invalid = false,
  required = false,
  disabled = false,
  readOnly = false,
  minLength,
  maxLength,
  autoComplete,
  inputMode,
  startIcon,
  endIcon,
  iconFocusScope = 'control',
  prefix,
  suffix,
  clearable = false,
  clearLabel,
  passwordReveal = false,
  revealPasswordLabel,
  hidePasswordLabel,
  onValueChange,
  onSubmitEditing,
  style,
  controlStyle,
  inputStyle,
  labelStyle,
  helpStyle,
  errorStyle,
  appearance,
  testID,
}: TextFieldProps) {
  const theme = useTheme();
  const [ownedValue, setOwnedValue] = useState(defaultValue);
  const [, forceRender] = useState(0);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusedAction, setFocusedAction] = useState<'clear' | 'reveal' | null>(null);
  const [revealed, setRevealed] = useState(false);
  const descriptionId = useId();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const currentValue = value !== undefined ? value : ownedValue;
  const state = getTextFieldState({
    value: currentValue,
    disabled,
    readOnly,
    invalid,
    error,
    clearable,
    passwordReveal,
    type,
  });
  if (
    (typeof size === 'number' && (!Number.isFinite(size) || size <= 0)) ||
    (typeof size !== 'number' && size !== 'sm' && size !== 'md' && size !== 'lg')
  ) {
    throw new TypeError('TextField size must be sm, md, lg or a positive finite number.');
  }
  if (typeof label !== 'string' || !label.trim())
    throw new TypeError('Text field requires a non-empty label.');
  if (iconFocusScope !== 'control' && iconFocusScope !== 'input')
    throw new TypeError('Text field iconFocusScope must be control or input.');
  if (clearable && !clearLabel?.trim())
    throw new TypeError('Text field requires clearLabel when clearable is enabled.');
  if (passwordReveal && (!revealPasswordLabel?.trim() || !hidePasswordLabel?.trim()))
    throw new TypeError(
      'Text field requires revealPasswordLabel and hidePasswordLabel when passwordReveal is enabled.'
    );
  for (const [name, length] of [
    ['minLength', minLength],
    ['maxLength', maxLength],
  ] as const) {
    if (length !== undefined && (!Number.isInteger(length) || length < 0))
      throw new TypeError(`Text field ${name} must be a nonnegative integer.`);
  }
  const allowedHints: readonly NonNullable<TextInputProps['autoComplete']>[] = [
    ...commonAutofillHints,
    ...(Platform.OS !== 'android' ? iosAutofillHints : []),
    ...(Platform.OS !== 'ios' ? androidAutofillHints : []),
  ];
  const nativeAutoComplete = allowedHints.find(hint => hint === autoComplete);
  if (autoComplete !== undefined && !nativeAutoComplete)
    throw new TypeError(
      `Unsupported text field autoComplete hint for ${Platform.OS}: ${autoComplete}`
    );
  const height = Math.max(MIN_TARGET, typeof size === 'number' ? size : theme.control[size]);
  const description = [helpText, error].filter(Boolean).join('. ');
  useEffect(() => {
    if (type !== 'password' || disabled || readOnly || !passwordReveal) setRevealed(false);
  }, [type, disabled, readOnly, passwordReveal]);
  const actionFocused =
    (focusedAction === 'clear' && state.showClearAction) ||
    (focusedAction === 'reveal' && state.showPasswordReveal);
  useEffect(() => {
    if (!actionFocused) setFocusedAction(null);
  }, [actionFocused]);
  useEffect(() => {
    if (disabled) {
      setFocused(false);
      setFocusedAction(null);
      setHovered(false);
    }
  }, [disabled]);
  const controlFocused = !disabled && (focused || actionFocused);
  const iconsFocused = !disabled && (focused || (iconFocusScope === 'control' && actionFocused));
  const startIconColor =
    (iconsFocused ? appearance?.startIconFocusColor : undefined) ?? appearance?.startIconColor;
  const endIconColor =
    (iconsFocused ? appearance?.endIconFocusColor : undefined) ?? appearance?.endIconColor;
  const webSemantics =
    Platform.OS === 'web'
      ? {
          'aria-required': required || undefined,
          'aria-invalid': state.invalid,
          'aria-readonly': readOnly || undefined,
          'aria-describedby':
            [helpText && `${descriptionId}-help`, error && `${descriptionId}-error`]
              .filter(Boolean)
              .join(' ') || undefined,
          disabled,
        }
      : {};
  const propose = (next: string) => {
    if (!state.editable) return;
    if (value === undefined) setOwnedValue(next);
    else forceRender(previous => previous + 1);
    onValueChange?.({ value: next });
  };
  const decoration = {
    color: appearance?.text ?? theme.colors.fg,
    fontSize: theme.text.md,
    flexShrink: 1,
    maxWidth: '25%',
  } satisfies TextStyle;
  const actionStyle: ViewStyle = {
    minWidth: MIN_TARGET,
    minHeight: MIN_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
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
        onPointerEnter={event => {
          if (event.nativeEvent.pointerType === 'mouse') setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        style={[
          {
            minHeight: height,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.xs,
            paddingHorizontal: theme.space.sm,
            borderWidth: 1,
            borderColor: controlFocused
              ? (appearance?.focus ?? theme.colors.primary)
              : state.invalid
                ? theme.colors.danger
                : (appearance?.border ??
                  theme.colors[hovered && !disabled ? 'primary' : 'border-strong']),
            borderRadius: appearance?.radius ?? theme.radius.md,
            ...(Platform.OS === 'web'
              ? {
                  outlineWidth: controlFocused ? 2 : 0,
                  outlineOffset: -2,
                  outlineStyle: 'solid',
                  outlineColor: appearance?.focus ?? theme.colors.primary,
                }
              : {}),
            backgroundColor:
              appearance?.background ??
              (controlFocused
                ? theme.colors['primary-subtle']
                : variant === 'filled'
                  ? theme.colors['surface-raised']
                  : theme.colors.bg),
            opacity: disabled ? 0.5 : 1,
          },
          controlStyle,
        ]}
      >
        {startIcon && (
          <IconColorContext value={startIconColor}>
            <DecorativeIcon icon={startIcon} />
          </IconColorContext>
        )}
        {prefix && (
          <Text accessible={false} numberOfLines={1} ellipsizeMode="tail" style={decoration}>
            {prefix}
          </Text>
        )}
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          accessibilityHint={description || undefined}
          accessibilityState={{ disabled }}
          {...webSemantics}
          value={currentValue}
          editable={state.editable}
          placeholder={placeholder}
          placeholderTextColor={appearance?.placeholder ?? theme.colors['fg-muted']}
          keyboardType={keyboardTypes[type]}
          inputMode={inputMode}
          autoComplete={nativeAutoComplete}
          maxLength={maxLength}
          secureTextEntry={type === 'password' && !revealed}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeText={propose}
          onSubmitEditing={() => onSubmitEditing?.({ value: currentValue })}
          style={[
            {
              flex: 1,
              minWidth: MIN_TARGET,
              minHeight: MIN_TARGET,
              // Browsers can still paint an auto outline when its computed width is zero.
              outlineWidth: Platform.OS === 'web' ? 0 : undefined,
              outlineStyle: Platform.OS === 'web' ? 'solid' : undefined,
              color: appearance?.text ?? theme.colors.fg,
              fontSize: theme.text.md,
              paddingVertical: theme.space.sm,
            },
            inputStyle,
          ]}
        />
        {suffix && (
          <Text accessible={false} numberOfLines={1} ellipsizeMode="tail" style={decoration}>
            {suffix}
          </Text>
        )}
        {endIcon && (
          <IconColorContext value={endIconColor}>
            <DecorativeIcon icon={endIcon} />
          </IconColorContext>
        )}
        {state.showClearAction && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={clearLabel}
            style={actionStyle}
            onFocus={() => setFocusedAction('clear')}
            onBlur={() => setFocusedAction(current => (current === 'clear' ? null : current))}
            onPress={() => {
              propose('');
              inputRef.current?.focus();
            }}
          >
            <DecorativeIcon icon={x} color={decoration.color} />
          </Pressable>
        )}
        {state.showPasswordReveal && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? hidePasswordLabel : revealPasswordLabel}
            style={actionStyle}
            onFocus={() => setFocusedAction('reveal')}
            onBlur={() => setFocusedAction(current => (current === 'reveal' ? null : current))}
            onPress={() => setRevealed(previous => !previous)}
          >
            <DecorativeIcon icon={revealed ? eyeOff : eye} color={decoration.color} />
          </Pressable>
        )}
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
