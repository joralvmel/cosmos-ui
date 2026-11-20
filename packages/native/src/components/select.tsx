import {
  type ContractProps,
  getListboxOptions,
  type ListboxItem,
  type ListboxSelectionChangeDetail,
  type SelectChangeDetail,
  type SelectValue,
  selectContract,
  validateSelectValue,
} from '@joralvmel/cosmos-core';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { chevronDown } from '@joralvmel/cosmos-icons/chevron-down';
import { x } from '@joralvmel/cosmos-icons/x';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  type StyleProp,
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
    ListboxItems: readonly ListboxItem<IconDefinition>[];
    SelectValue: SelectValue;
  }
>;

export interface SelectProps extends ContractSelectProps {
  onValueChange?: (detail: SelectChangeDetail) => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const selectPropNames = [
  'label',
  'items',
  'value',
  'defaultValue',
  'placeholder',
  'size',
  'disabled',
  'required',
  'invalid',
  'helpText',
  'errorText',
  'clearable',
  'clearLabel',
] as const satisfies readonly (keyof ContractSelectProps)[];

const sizes = ['sm', 'md', 'lg'] as const;

/** Selects one value from grouped options using Cosmos popup and listbox behavior. */
export function Select({
  label,
  items,
  value,
  defaultValue = null,
  placeholder,
  size = selectContract.props.size.default,
  disabled = selectContract.props.disabled.default,
  required = selectContract.props.required.default,
  invalid = selectContract.props.invalid.default,
  helpText,
  errorText,
  clearable = selectContract.props.clearable.default,
  clearLabel,
  onValueChange,
  style,
  labelStyle,
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
  if (!sizes.includes(size)) throw new TypeError('Select size must be sm, md, or lg.');
  if (options.length === 0) throw new TypeError('Select requires at least one option.');
  if (clearable && !clearLabel?.trim()) {
    throw new TypeError('Select requires a non-empty clearLabel when clearable.');
  }
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

  const clearValue = () => {
    changeValue(null);
    popover.current?.requestClose();
  };

  useEffect(() => {
    if (disabled && expanded) popover.current?.requestClose();
  }, [disabled, expanded]);

  const controlHeight = Math.max(44, theme.control[size]);
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
                  return {
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
                    backgroundColor: expanded ? theme.colors['primary-subtle'] : theme.colors.bg,
                    opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
                  };
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
        {clearable && selected ? (
          <Pressable
            testID={testID ? `${testID}-clear` : undefined}
            disabled={disabled}
            onPress={clearValue}
            accessibilityRole="button"
            accessibilityLabel={clearLabel}
            accessibilityState={{ disabled }}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.sm,
              opacity: disabled ? 0.55 : pressed ? 0.7 : 1,
            })}
          >
            <Icon icon={x} stroke={theme.colors['fg-muted']} size={18} />
          </Pressable>
        ) : null}
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
