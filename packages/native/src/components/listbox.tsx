import {
  type ContractProps,
  findListboxMatch,
  getListboxInitialActive,
  getListboxOptions,
  getListboxSelection,
  type ListboxGroup,
  type ListboxItem,
  type ListboxOption,
  type ListboxSelectionChangeDetail,
  listboxContract,
  moveListboxActive,
  validateListboxSize,
  validateListboxValues,
} from '@joralvmel/cosmos-core';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { check } from '@joralvmel/cosmos-icons/check';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/theme-provider.js';
import { Icon } from './icon.js';

type ContractListboxProps = ContractProps<
  typeof listboxContract,
  'native',
  {
    ListboxItems: readonly ListboxItem<IconDefinition>[];
    ListboxValues: readonly string[];
  }
>;

/** Theme-token overrides for a listbox surface and its options. */
export interface ListboxAppearance {
  background?: string;
  text?: string;
  border?: string;
  radius?: number;
  optionPadding?: number;
  gap?: number;
  fontSize?: number;
  descriptionColor?: string;
  selectedBackground?: string;
  selectedColor?: string;
  focus?: string;
  maxHeight?: number;
}

export interface ListboxProps extends ContractListboxProps {
  /** Receives the contract proposal detail; controlled selection waits for the owner. */
  onSelectionChange?: (detail: ListboxSelectionChangeDetail) => void;
  /** Style for the outer surface. */
  style?: StyleProp<ViewStyle>;
  /** Style for the scrollable option collection. */
  listStyle?: StyleProp<ViewStyle>;
  /** Style applied to each option row before selected/focused state styles. */
  optionStyle?: StyleProp<ViewStyle>;
  /** Additional style for selected option rows. */
  selectedStyle?: StyleProp<ViewStyle>;
  /** Style for the visible accessible label. */
  labelStyle?: StyleProp<TextStyle>;
  /** Style for option descriptions. */
  descriptionStyle?: StyleProp<TextStyle>;
  /** Theme-derived color, radius, spacing and maximum-height overrides. */
  appearance?: ListboxAppearance;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const listboxPropNames = [
  'label',
  'labelHidden',
  'items',
  'selectionMode',
  'selectedValues',
  'defaultSelectedValues',
  'variant',
  'size',
  'disabled',
  'readOnly',
  'locale',
] as const satisfies readonly (keyof ContractListboxProps)[];

interface WebKeyEvent {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  defaultPrevented?: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}

interface WebOptionNode {
  focus(): void;
  scrollIntoView?: (options?: { block?: 'nearest' }) => void;
}

interface WebDocument {
  getElementById(id: string): WebOptionNode | null;
}

interface WebFocusEvent {
  relatedTarget?: unknown;
}

interface WebFocusTarget {
  closest?(selector: string): unknown | null;
}

const MIN_TOUCH_TARGET = 44;
const TYPEAHEAD_INTERVAL = 700;

const sizes = {
  sm: { text: 'sm' },
  md: { text: 'md' },
  lg: { text: 'lg' },
} as const;

function isGroup<Icon>(item: ListboxItem<Icon>): item is ListboxGroup<Icon> {
  return 'options' in item;
}

function equalValues(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function focusWebOption(id: string) {
  if (Platform.OS !== 'web') return;
  const browserDocument = (globalThis as { document?: WebDocument }).document;
  if (!browserDocument) return;
  const option = browserDocument.getElementById(id);
  option?.focus();
  option?.scrollIntoView?.({ block: 'nearest' });
}

function decorativeIcon(icon: IconDefinition, color: string, size: number) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <Icon icon={icon} stroke={color} size={size} />
    </View>
  );
}

/** Selects one or more options with independent focus and selected values. */
export function Listbox({
  label,
  labelHidden = listboxContract.props.labelHidden.default,
  items,
  selectionMode = listboxContract.props.selectionMode.default,
  selectedValues,
  defaultSelectedValues = [],
  variant = listboxContract.props.variant.default,
  size = listboxContract.props.size.default,
  disabled = listboxContract.props.disabled.default,
  readOnly = listboxContract.props.readOnly.default,
  locale,
  onSelectionChange,
  style,
  listStyle,
  optionStyle,
  selectedStyle,
  labelStyle,
  descriptionStyle,
  appearance,
  testID,
}: ListboxProps) {
  const theme = useTheme();
  const id = useId();
  const options = useMemo(() => getListboxOptions(items), [items]);
  const [ownedValues, setOwnedValues] = useState<readonly string[]>(defaultSelectedValues);
  const currentValues = selectedValues === undefined ? ownedValues : selectedValues;
  const [activeValue, setActiveValue] = useState<string | null>(() =>
    getListboxInitialActive(options, currentValues)
  );
  const [focused, setFocused] = useState(false);
  const activeForFocus = useRef(false);
  const typeahead = useRef({ text: '', at: 0 });

  if (typeof label !== 'string' || !label.trim()) {
    throw new TypeError('Listbox requires a non-empty label.');
  }
  validateListboxSize(size);
  validateListboxValues(currentValues, selectionMode);
  validateListboxValues(defaultSelectedValues, selectionMode);
  if (locale !== undefined) new Intl.Collator(locale);

  useEffect(() => {
    setActiveValue(current => {
      if (
        focused &&
        current &&
        options.some(option => option.value === current && !option.disabled)
      ) {
        return current;
      }
      return getListboxInitialActive(options, currentValues);
    });
  }, [focused, options, currentValues]);

  useEffect(() => {
    if (!activeForFocus.current || !activeValue) return;
    activeForFocus.current = false;
    focusWebOption(`${id}-option-${options.findIndex(option => option.value === activeValue)}`);
  }, [activeValue, id, options]);

  const semanticSize = typeof size === 'string' ? sizes[size] : undefined;
  const optionHeight = Math.max(
    MIN_TOUCH_TARGET,
    typeof size === 'number' ? size : theme.control[size]
  );
  const fontSize = appearance?.fontSize ?? theme.text[semanticSize?.text ?? 'md'];
  const foreground = appearance?.text ?? theme.colors.fg;
  const selectedForeground = appearance?.selectedColor ?? foreground;
  const selectedBackground = appearance?.selectedBackground ?? theme.colors['primary-subtle'];
  const focusColor = appearance?.focus ?? theme.colors.primary;
  const borderColor =
    appearance?.border ?? (variant === 'outlined' ? theme.colors['border-strong'] : 'transparent');
  const rowPadding = appearance?.optionPadding ?? theme.space.md;
  const iconSize = Math.min(24, Math.max(16, fontSize));

  const select = (value: string, source: ListboxSelectionChangeDetail['source']) => {
    const option = options.find(candidate => candidate.value === value);
    if (!option || option.disabled || disabled || readOnly) return;
    const next = getListboxSelection(currentValues, value, selectionMode);
    if (selectionMode === 'single' && equalValues(currentValues, next)) return;
    if (selectedValues === undefined) setOwnedValues(next);
    onSelectionChange?.({ selectedValues: next, value, source });
  };

  const handleWebKeyDown = (event: unknown) => {
    if (Platform.OS !== 'web' || disabled) return;
    const keyEvent = event as WebKeyEvent;
    if (keyEvent.defaultPrevented) return;
    const navigationKey =
      keyEvent.key === 'ArrowDown' ||
      keyEvent.key === 'ArrowUp' ||
      keyEvent.key === 'Home' ||
      keyEvent.key === 'End';
    const activationKey = keyEvent.key === 'Enter' || keyEvent.key === ' ';
    const typeaheadKey =
      [...keyEvent.key].length === 1 &&
      !keyEvent.altKey &&
      !keyEvent.ctrlKey &&
      !keyEvent.metaKey &&
      keyEvent.key !== ' ';
    if (!navigationKey && !activationKey && !typeaheadKey) return;
    keyEvent.preventDefault();
    keyEvent.stopPropagation();

    if (navigationKey) {
      const next = moveListboxActive(
        options,
        activeValue,
        keyEvent.key as 'ArrowDown' | 'ArrowUp' | 'Home' | 'End'
      );
      if (next !== activeValue) {
        activeForFocus.current = true;
        setActiveValue(next);
      }
      return;
    }
    if (activationKey) {
      if (activeValue) select(activeValue, 'keyboard');
      return;
    }

    const now = Date.now();
    const buffer =
      now - typeahead.current.at > TYPEAHEAD_INTERVAL
        ? keyEvent.key
        : `${typeahead.current.text}${keyEvent.key}`;
    typeahead.current = { text: buffer, at: now };
    const match = findListboxMatch(options, activeValue, buffer, locale);
    if (match && match !== activeValue) {
      activeForFocus.current = true;
      setActiveValue(match);
    }
  };

  const handleOptionBlur = (event: unknown) => {
    if (Platform.OS !== 'web') {
      setFocused(false);
      return;
    }
    const relatedTarget = (event as WebFocusEvent).relatedTarget as WebFocusTarget | null;
    if (relatedTarget?.closest?.('[role="listbox"]')) return;
    activeForFocus.current = false;
    setFocused(false);
    setActiveValue(getListboxInitialActive(options, currentValues));
  };

  const labelNode = (
    <Text
      accessible={false}
      style={[
        {
          color: foreground,
          fontSize: theme.text.sm,
          marginBottom: theme.space.xs,
          ...(labelHidden
            ? {
                position: 'absolute' as const,
                width: 1,
                height: 1,
                opacity: 0,
                overflow: 'hidden' as const,
              }
            : {}),
        },
        labelStyle,
      ]}
      testID={testID ? `${testID}-label` : undefined}
    >
      {label}
    </Text>
  );

  const renderOption = (
    option: ListboxOption<IconDefinition>,
    index: number,
    groupLabel?: string
  ) => {
    const selected = currentValues.includes(option.value);
    const isActive = activeValue === option.value;
    const optionDisabled = disabled || Boolean(option.disabled);
    const descriptionId = `${id}-description-${index}`;
    const name = [groupLabel, option.label, option.description].filter(Boolean).join(', ');
    const webProps =
      Platform.OS === 'web'
        ? ({
            role: 'option',
            id: `${id}-option-${index}`,
            tabIndex: !optionDisabled && isActive ? 0 : -1,
            'aria-selected': selected,
            'aria-disabled': optionDisabled || undefined,
            'aria-describedby': option.description ? descriptionId : undefined,
          } as Record<string, unknown>)
        : {};
    const nativeProps =
      Platform.OS === 'web'
        ? {}
        : {
            accessibilityRole: 'button' as const,
            accessibilityState: { disabled: optionDisabled, selected },
            accessibilityHint: readOnly
              ? 'Selection is read-only.'
              : option.description || undefined,
          };
    return (
      <Pressable
        key={option.value}
        {...nativeProps}
        {...webProps}
        accessibilityLabel={Platform.OS === 'web' ? option.label : name}
        disabled={optionDisabled}
        hitSlop={0}
        onFocus={() => {
          setActiveValue(option.value);
          setFocused(true);
        }}
        onBlur={handleOptionBlur}
        onPress={() => select(option.value, 'pointer')}
        style={[
          {
            minHeight: optionHeight,
            flexDirection: 'row',
            alignItems: 'center',
            gap: appearance?.gap ?? theme.space.sm,
            paddingHorizontal: rowPadding,
            paddingVertical: theme.space.xs,
            borderWidth: 1,
            borderColor: focused && isActive && !optionDisabled ? focusColor : 'transparent',
            borderRadius: Math.max(0, (appearance?.radius ?? theme.radius.md) - 2),
            backgroundColor: selected ? selectedBackground : 'transparent',
            opacity: optionDisabled ? 0.55 : 1,
          },
          optionStyle,
          selected ? selectedStyle : undefined,
        ]}
        testID={testID ? `${testID}-option-${option.value}` : undefined}
      >
        {option.icon
          ? decorativeIcon(option.icon, selected ? selectedForeground : foreground, iconSize)
          : null}
        <View style={{ flex: 1, minWidth: 0, gap: theme.space.xs }}>
          <Text
            style={{
              color: selected ? selectedForeground : foreground,
              fontSize,
              fontWeight: selected ? theme.weight.semibold : theme.weight.regular,
              flexShrink: 1,
            }}
          >
            {option.label}
          </Text>
          {option.description ? (
            <Text
              nativeID={descriptionId}
              style={[
                {
                  color: appearance?.descriptionColor ?? theme.colors['fg-muted'],
                  fontSize: theme.text.sm,
                  flexShrink: 1,
                },
                descriptionStyle,
              ]}
            >
              {option.description}
            </Text>
          ) : null}
        </View>
        {selected ? decorativeIcon(check, selectedForeground, iconSize) : null}
      </Pressable>
    );
  };

  let flatIndex = 0;
  const content = items.map((item, itemIndex) => {
    if (!isGroup(item)) {
      const index = flatIndex++;
      return renderOption(item, index);
    }
    const groupIndex = itemIndex;
    const groupLabelId = `${id}-group-${groupIndex}`;
    return (
      <View
        key={`group-${groupIndex}-${item.label}`}
        accessibilityRole={Platform.OS === 'web' ? undefined : 'none'}
        {...(Platform.OS === 'web'
          ? ({ role: 'group', 'aria-labelledby': groupLabelId } as Record<string, unknown>)
          : {})}
      >
        <Text
          nativeID={groupLabelId}
          accessibilityRole={Platform.OS === 'web' ? undefined : 'header'}
          style={{
            color: appearance?.text ?? theme.colors['fg-muted'],
            fontSize: theme.text.sm,
            fontWeight: theme.weight.semibold,
            paddingHorizontal: rowPadding,
            paddingTop: theme.space.sm,
            paddingBottom: theme.space.xs,
          }}
        >
          {item.label}
        </Text>
        {item.options.map(option => renderOption(option, flatIndex++, item.label))}
      </View>
    );
  });

  const webListProps =
    Platform.OS === 'web'
      ? ({
          role: 'listbox',
          'aria-readonly': readOnly || undefined,
          'aria-disabled': disabled || undefined,
          onKeyDownCapture: handleWebKeyDown,
        } as Record<string, unknown>)
      : {};

  return (
    <View
      testID={testID}
      accessibilityState={{ disabled }}
      style={[
        {
          borderWidth: variant === 'outlined' ? 1 : 0,
          borderColor,
          borderRadius: appearance?.radius ?? theme.radius.md,
          backgroundColor: appearance?.background ?? theme.colors.bg,
          opacity: disabled ? 0.62 : 1,
          width: '100%',
        },
        style,
      ]}
    >
      {labelNode}
      <ScrollView
        {...webListProps}
        accessibilityRole={Platform.OS === 'web' ? undefined : 'list'}
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        scrollEnabled
        style={[
          {
            maxHeight: appearance?.maxHeight,
            width: '100%',
          },
          listStyle,
        ]}
      >
        {content}
      </ScrollView>
    </View>
  );
}
