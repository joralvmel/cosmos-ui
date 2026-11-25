import {
  type ContractProps,
  getListboxOptions,
  type ListboxSelectionChangeDetail,
  type SelectChangeDetail,
  type SelectItems,
  type SelectValue,
  selectContract,
  validateSelectValue,
} from '@joralvmel/cosmos-core';
import { chevronDown } from '@joralvmel/cosmos-icons/chevron-down';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';
import { Icon } from './icon.js';
import { Listbox } from './listbox.js';
import { Popover, type PopoverHandle } from './popover.js';

type ContractSelectProps = ContractProps<
  typeof selectContract,
  'native',
  {
    SelectItems: SelectItems;
    SelectValue: SelectValue;
  }
>;

export interface SelectProps extends ContractSelectProps {
  onValueChange?: (detail: SelectChangeDetail) => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const selectPropNames = [
  'label',
  'items',
  'value',
  'defaultValue',
  'placeholder',
  'variant',
  'size',
  'disabled',
  'required',
  'invalid',
  'helpText',
  'errorText',
] as const satisfies readonly (keyof ContractSelectProps)[];

const sizes = ['sm', 'md', 'lg'] as const;
const MIN_TOUCH_TARGET = 44;

/** Selects one value from flat options using Cosmos popup and listbox behavior. */
export function Select({
  label,
  items,
  value,
  defaultValue = null,
  placeholder,
  variant = selectContract.props.variant.default,
  size = selectContract.props.size.default,
  disabled = selectContract.props.disabled.default,
  required = selectContract.props.required.default,
  invalid = selectContract.props.invalid.default,
  helpText,
  errorText,
  onValueChange,
  style,
  labelStyle,
  triggerStyle,
  testID,
}: SelectProps) {
  const theme = useTheme();
  const popover = useRef<PopoverHandle>(null);
  const [ownedValue, setOwnedValue] = useState<SelectValue>(defaultValue);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const options = useMemo(() => getListboxOptions(items), [items]);
  const currentValue = value === undefined ? ownedValue : value;
  const selected = options.find(option => option.value === currentValue);
  const currentInvalid = invalid || Boolean(errorText);

  if (typeof label !== 'string' || !label.trim()) {
    throw new TypeError('Select requires a non-empty label.');
  }
  if (typeof placeholder !== 'string' || !placeholder.trim()) {
    throw new TypeError('Select requires a non-empty placeholder.');
  }
  if (!['outlined', 'filled'].includes(variant)) {
    throw new TypeError('Select variant must be outlined or filled.');
  }
  if (!sizes.includes(size)) throw new TypeError('Select size must be sm, md, or lg.');
  if (options.length === 0) throw new TypeError('Select requires at least one option.');
  validateSelectValue(currentValue, options, 'value');
  validateSelectValue(defaultValue, options, 'defaultValue');

  const changeValue = (nextValue: SelectValue) => {
    if (nextValue === currentValue || disabled) return;
    if (value === undefined) setOwnedValue(nextValue);
    onValueChange?.({ value: nextValue });
  };

  const selectOption = (detail: ListboxSelectionChangeDetail) => {
    changeValue(detail.value);
    popover.current?.requestClose();
  };

  useEffect(() => {
    if (disabled && expanded) popover.current?.requestClose();
  }, [disabled, expanded]);

  const controlHeight = Math.max(MIN_TOUCH_TARGET, theme.control[size]);
  const customTriggerStyle = StyleSheet.flatten(triggerStyle);
  const customMinHeight = customTriggerStyle?.minHeight;
  if (customMinHeight !== undefined && typeof customMinHeight !== 'number') {
    throw new TypeError('Select triggerStyle.minHeight must be a number.');
  }
  const triggerMinHeight = Math.max(MIN_TOUCH_TARGET, controlHeight, customMinHeight ?? 0);
  const textSize = theme.text[size];
  const description = errorText || helpText;
  const optionValues = currentValue === null ? [] : [currentValue];

  return (
    <View testID={testID} style={[{ gap: theme.space.xs }, style]}>
      <Text
        accessible={false}
        style={[{ color: theme.colors.fg, fontSize: theme.text.sm, fontWeight: '500' }, labelStyle]}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
        <View style={{ flex: 1 }}>
          <Popover
            ref={popover}
            gap={4}
            panelStyle={{
              padding: 0,
              minWidth: 240,
              borderColor: theme.colors['border-strong'],
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.bg,
            }}
            onOpenChange={detail => {
              if (detail.open) setExpanded(true);
              else setExpanded(false);
            }}
            trigger={triggerProps => (
              <Pressable
                {...triggerProps}
                testID={testID ? `${testID}-trigger` : undefined}
                disabled={disabled}
                accessibilityRole="combobox"
                accessibilityLabel={`${label}, ${selected?.label ?? placeholder}`}
                accessibilityHint={description || (required ? 'Required' : undefined)}
                accessibilityValue={{ text: selected?.label ?? placeholder }}
                accessibilityState={{ disabled, expanded }}
                aria-expanded={expanded}
                aria-invalid={currentInvalid ? 'true' : 'false'}
                aria-required={required ? 'true' : 'false'}
                onHoverIn={() => setHovered(true)}
                onHoverOut={() => setHovered(false)}
                style={({ pressed }) => {
                  const borderColor = currentInvalid
                    ? theme.colors.danger
                    : expanded
                      ? theme.colors['focus-ring']
                      : !disabled && hovered
                        ? theme.colors.primary
                        : theme.colors['border-strong'];
                  return [
                    {
                      minHeight: controlHeight,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: theme.space.sm,
                      paddingHorizontal: theme.space.md,
                      paddingVertical: theme.space.xs,
                      borderWidth: 1,
                      borderColor,
                      borderRadius: theme.radius.md,
                      backgroundColor: expanded
                        ? theme.colors['primary-subtle']
                        : variant === 'filled'
                          ? theme.colors['surface-raised']
                          : theme.colors.bg,
                      opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
                    },
                    triggerStyle,
                    { minHeight: triggerMinHeight },
                  ];
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    color: selected ? theme.colors.fg : theme.colors['fg-muted'],
                    fontSize: textSize,
                  }}
                >
                  {selected?.label ?? placeholder}
                </Text>
                <View
                  testID={testID ? `${testID}-chevron` : undefined}
                  style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                >
                  <Icon icon={chevronDown} stroke={theme.colors.fg} size={18} />
                </View>
              </Pressable>
            )}
          >
            <Listbox
              label={label}
              labelHidden
              items={items}
              selectedValues={optionValues}
              selectionMode="single"
              size={size}
              variant="plain"
              onSelectionChange={selectOption}
              testID={testID ? `${testID}-listbox` : undefined}
              appearance={{ background: theme.colors.bg, maxHeight: 320 }}
            />
          </Popover>
        </View>
      </View>
      {description ? (
        <Text
          accessibilityLiveRegion={errorText ? 'polite' : 'none'}
          style={{
            color: errorText ? theme.colors.danger : theme.colors['fg-muted'],
            fontSize: theme.text.sm,
          }}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}
