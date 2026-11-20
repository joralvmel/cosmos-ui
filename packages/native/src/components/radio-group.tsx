import {
  type ContractProps,
  getRadioGroupInitialActive,
  moveRadioGroupActive,
  type RadioGroupChangeDetail,
  type RadioGroupReferences,
  radioGroupContract,
  validateRadioGroupOptions,
  validateRadioGroupValue,
  validateSize,
} from '@joralvmel/cosmos-core';
import { useEffect, useId, useState } from 'react';
import {
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';

type ContractRadioGroupProps = ContractProps<
  typeof radioGroupContract,
  'native',
  RadioGroupReferences
>;

export interface RadioGroupProps extends ContractRadioGroupProps {
  onValueChange?: (detail: RadioGroupChangeDetail) => void;
  style?: StyleProp<ViewStyle>;
  optionStyle?: StyleProp<ViewStyle>;
  controlStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  helpTextStyle?: StyleProp<TextStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const radioGroupPropNames = [
  'label',
  'options',
  'value',
  'defaultValue',
  'orientation',
  'size',
  'disabled',
  'required',
  'invalid',
  'helpText',
  'errorText',
] as const satisfies readonly (keyof ContractRadioGroupProps)[];

const MIN_TOUCH_TARGET = 44;
const sizeDimensions = { sm: 16, md: 20, lg: 24 } as const;

interface WebKeyEvent {
  key: string;
  defaultPrevented?: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}

interface WebFocusTarget {
  focus(): void;
}

interface WebDocument {
  getElementById(id: string): WebFocusTarget | null;
}

function focusWebOption(id: string) {
  if (Platform.OS !== 'web') return;
  const browserDocument = (globalThis as { document?: WebDocument }).document;
  browserDocument?.getElementById(id)?.focus();
}

/** Selects one accessible option with a minimum 44-point target. */
export function RadioGroup({
  label,
  options,
  value,
  defaultValue = null,
  orientation = radioGroupContract.props.orientation.default,
  size = radioGroupContract.props.size.default,
  disabled = radioGroupContract.props.disabled.default,
  required = radioGroupContract.props.required.default,
  invalid = radioGroupContract.props.invalid.default,
  helpText,
  errorText,
  onValueChange,
  style,
  optionStyle,
  controlStyle,
  labelStyle,
  descriptionStyle,
  helpTextStyle,
  errorTextStyle,
  testID,
}: RadioGroupProps) {
  const theme = useTheme();
  const id = useId();
  const [ownedValue, setOwnedValue] = useState(value ?? defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? (value ?? null) : ownedValue;
  const [activeValue, setActiveValue] = useState(() =>
    getRadioGroupInitialActive(options, currentValue)
  );
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const [focusVisible, setFocusVisible] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const controlDimensions = StyleSheet.flatten(controlStyle);
  validateSize(size, 'RadioGroup');
  const dimension = typeof size === 'number' ? size : sizeDimensions[size];
  const controlWidth = controlDimensions?.width ?? dimension;
  const controlHeight = controlDimensions?.height ?? dimension;
  const dotSize =
    typeof controlWidth === 'number' && typeof controlHeight === 'number'
      ? Math.min(controlWidth, controlHeight) * 0.48
      : dimension * 0.48;
  const currentInvalid = invalid || Boolean(errorText);
  const describedBy = [helpText ? `${id}-help` : '', errorText ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ');
  const initialActive = getRadioGroupInitialActive(options, currentValue);

  useEffect(() => {
    if (disabled) setHoveredValue(null);
  }, [disabled]);

  useEffect(() => {
    if (!focusedValue) {
      setActiveValue(initialActive);
    } else if (
      !activeValue ||
      !options.some(option => option.value === activeValue && !option.disabled)
    ) {
      setActiveValue(initialActive);
    }
  }, [activeValue, focusedValue, initialActive, options]);

  if (typeof label !== 'string' || !label.trim()) {
    throw new TypeError('RadioGroup requires a non-empty label.');
  }
  if (orientation !== 'vertical' && orientation !== 'horizontal') {
    throw new TypeError('RadioGroup orientation must be vertical or horizontal.');
  }
  validateRadioGroupOptions(options);
  validateRadioGroupValue(currentValue, options, 'value');
  validateRadioGroupValue(defaultValue, options, 'defaultValue');

  const select = (nextValue: string) => {
    const option = options.find(candidate => candidate.value === nextValue);
    if (!option || disabled || option.disabled || nextValue === currentValue) return;
    setActiveValue(nextValue);
    if (!controlled) setOwnedValue(nextValue);
    onValueChange?.({ value: nextValue });
  };

  const handleKeyDown = (event: unknown, currentOptionValue: string) => {
    if (Platform.OS !== 'web' || disabled) return;
    const keyEvent = event as WebKeyEvent;
    if (keyEvent.defaultPrevented) return;
    const direction =
      keyEvent.key === 'ArrowRight' || keyEvent.key === 'ArrowDown'
        ? 1
        : keyEvent.key === 'ArrowLeft' || keyEvent.key === 'ArrowUp'
          ? -1
          : 0;
    if (direction === 0 && keyEvent.key !== ' ') return;
    setFocusVisible(true);
    keyEvent.preventDefault();
    keyEvent.stopPropagation();
    if (direction === 0) {
      select(currentOptionValue);
      return;
    }
    const nextValue = moveRadioGroupActive(options, currentOptionValue, direction);
    if (!nextValue) return;
    setActiveValue(nextValue);
    focusWebOption(`${id}-option-${options.findIndex(option => option.value === nextValue)}`);
    setFocusVisible(true);
    select(nextValue);
  };

  const groupDescription = [helpText, errorText].filter(Boolean).join('. ');
  const tabStopValue = focusedValue ? activeValue : initialActive;
  const groupStyle = {
    minWidth: 0,
  } satisfies ViewStyle;

  return (
    <View
      testID={testID}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      accessibilityHint={groupDescription || undefined}
      accessibilityState={{ disabled }}
      {...(Platform.OS === 'web'
        ? {
            'aria-required': required || undefined,
            'aria-invalid': currentInvalid || undefined,
            'aria-describedby': describedBy || undefined,
          }
        : {})}
      style={[groupStyle, style]}
    >
      <Text style={[{ color: theme.colors.fg, fontSize: theme.text.md }, labelStyle]}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <View
        style={[
          {
            minWidth: 0,
            flexDirection: orientation === 'horizontal' ? 'row' : 'column',
            flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
            gap: theme.space.xs,
          },
        ]}
      >
        {options.map((option, index) => {
          const optionDisabled = disabled || option.disabled === true;
          const checked = currentValue === option.value;
          const hovered = hoveredValue === option.value && !optionDisabled && !currentInvalid;
          const boundaryColor = currentInvalid
            ? theme.colors.danger
            : checked
              ? theme.colors[hovered ? 'primary-hover' : 'primary']
              : theme.colors[hovered ? 'primary' : 'border-strong'];
          const optionDescriptionId = `${id}-description-${index}`;
          const tabIndex: 0 | -1 = !optionDisabled && tabStopValue === option.value ? 0 : -1;
          const optionAccessibility =
            Platform.OS === 'web'
              ? {
                  'aria-checked': checked,
                  'aria-disabled': optionDisabled || undefined,
                  'aria-describedby': option.description ? optionDescriptionId : undefined,
                  tabIndex,
                }
              : {};
          return (
            <Pressable
              key={option.value}
              testID={testID ? `${testID}-option-${option.value}` : undefined}
              nativeID={`${id}-option-${index}`}
              accessible
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              accessibilityState={{ checked, disabled: optionDisabled }}
              {...optionAccessibility}
              disabled={optionDisabled}
              hitSlop={4}
              onPress={() => select(option.value)}
              onFocus={event => {
                setFocusedValue(option.value);
                setActiveValue(option.value);
                if (Platform.OS === 'web') {
                  const target = event.currentTarget as { matches?(selector: string): boolean };
                  setFocusVisible(target.matches?.(':focus-visible') === true);
                }
              }}
              onBlur={() => {
                setFocusedValue(null);
                setFocusVisible(false);
                setActiveValue(initialActive);
              }}
              onHoverIn={() => setHoveredValue(option.value)}
              onHoverOut={() =>
                setHoveredValue(current => (current === option.value ? null : current))
              }
              onKeyDown={event => handleKeyDown(event, option.value)}
              style={[
                {
                  minWidth: MIN_TOUCH_TARGET,
                  minHeight: MIN_TOUCH_TARGET,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.space.sm,
                  opacity: optionDisabled ? 0.5 : 1,
                  ...(Platform.OS === 'web' &&
                  focusVisible &&
                  focusedValue === option.value &&
                  !optionDisabled
                    ? {
                        outlineWidth: 2,
                        outlineStyle: 'solid' as const,
                        outlineColor: theme.colors['focus-ring'],
                        outlineOffset: 2,
                        borderRadius: theme.radius.sm,
                      }
                    : {}),
                },
                optionStyle,
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
                    borderColor: boundaryColor,
                    borderRadius: theme.radius.full,
                    backgroundColor: theme.colors.bg,
                  },
                  controlStyle,
                ]}
              >
                {checked ? (
                  <View
                    style={{
                      width: dotSize,
                      height: dotSize,
                      borderRadius: theme.radius.full,
                      backgroundColor: currentInvalid ? theme.colors.danger : theme.colors.primary,
                    }}
                  />
                ) : null}
              </View>
              <View style={{ minWidth: 0, flex: 1 }}>
                <Text
                  accessible={false}
                  style={{ color: theme.colors.fg, fontSize: theme.text.md }}
                >
                  {option.label}
                </Text>
                {option.description ? (
                  <Text
                    nativeID={optionDescriptionId}
                    accessible={false}
                    style={[
                      {
                        color: theme.colors['fg-muted'],
                        fontSize: theme.text.sm,
                      },
                      descriptionStyle,
                    ]}
                  >
                    {option.description}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {helpText ? (
        <Text
          nativeID={`${id}-help`}
          style={[
            { color: theme.colors['fg-muted'], fontSize: theme.text.sm, marginTop: theme.space.xs },
            helpTextStyle,
          ]}
        >
          {helpText}
        </Text>
      ) : null}
      {errorText ? (
        <Text
          nativeID={`${id}-error`}
          accessibilityLiveRegion="polite"
          style={[
            { color: theme.colors.danger, fontSize: theme.text.sm, marginTop: theme.space.xs },
            errorTextStyle,
          ]}
        >
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}
