import type { IconDefinition } from '@joralvmel/cosmos-icons';
import { check } from '@joralvmel/cosmos-icons/check';
import {
  Listbox,
  type ListboxItem,
  type ListboxSelectionChangeDetail,
  useTheme,
} from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const groupedItems: readonly ListboxItem<IconDefinition>[] = [
  {
    label: 'Fruit',
    options: [
      {
        value: 'apple',
        label: 'Apple',
        description: 'Crisp, sweet and a good source of fiber.',
        icon: check,
      },
      { value: 'apricot', label: 'Apricot', description: 'Soft orange stone fruit.' },
      { value: 'banana', label: 'Banana', description: 'Disabled option example.', disabled: true },
    ],
  },
  {
    label: 'Vegetables',
    options: [
      { value: 'carrot', label: 'Carrot', description: 'Crunchy and bright.' },
      { value: 'pepper', label: 'Pepper' },
    ],
  },
];

const flatItems: readonly ListboxItem<IconDefinition>[] = groupedItems.flatMap(item =>
  'options' in item ? item.options : [item]
);
const sizeOptions = ['sm', 'md', 'lg', 56] as const;
const variants = ['plain', 'outlined'] as const;

interface ControlProps {
  label: string;
  value: string;
  selected?: boolean;
  onPress(): void;
}

function Control({ label, value, selected = false, onPress }: ControlProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: theme.space.md,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors['border-strong'],
        borderRadius: theme.radius.md,
        backgroundColor: selected ? theme.colors['primary-subtle'] : theme.colors.bg,
      }}
    >
      <Text style={{ color: theme.colors.fg, fontSize: theme.text.sm }}>
        {label}: {value}
      </Text>
    </Pressable>
  );
}

export default function ListboxScreen() {
  const theme = useTheme();
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single');
  const [variantIndex, setVariantIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(1);
  const [labelHidden, setLabelHidden] = useState(false);
  const [grouped, setGrouped] = useState(true);
  const [disabledOption, setDisabledOption] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [controlled, setControlled] = useState(true);
  const [acceptProposals, setAcceptProposals] = useState(true);
  const [customAppearance, setCustomAppearance] = useState(false);
  const [selectedValues, setSelectedValues] = useState<readonly string[]>([]);
  const [displayedValues, setDisplayedValues] = useState<readonly string[]>([]);
  const [lastProposal, setLastProposal] = useState('No selection proposal yet');
  const [revision, setRevision] = useState(0);
  const selectionModeChanged = () => {
    setSelectionMode(mode => (mode === 'single' ? 'multiple' : 'single'));
    setSelectedValues([]);
    setDisplayedValues([]);
    setRevision(value => value + 1);
  };
  const onSelectionChange = (detail: ListboxSelectionChangeDetail) => {
    setLastProposal(
      `${detail.value} · ${detail.source} · next values: ${detail.selectedValues.join(', ') || 'none'}`
    );
    if (!controlled || acceptProposals) {
      setSelectedValues(detail.selectedValues);
      setDisplayedValues(detail.selectedValues);
    }
  };
  const currentSize = sizeOptions[sizeIndex] ?? 'md';
  const currentVariant = variants[variantIndex] ?? 'plain';
  const items = grouped ? groupedItems : flatItems;
  const options = disabledOption
    ? items
    : items.map(item =>
        'options' in item
          ? {
              ...item,
              options: item.options.map(option =>
                option.value === 'banana' ? { ...option, disabled: false } : option
              ),
            }
          : item
      );
  const visibleValues = controlled ? selectedValues : displayedValues;
  const label = labelHidden ? 'Choose produce (visually hidden label)' : 'Choose produce';
  const sectionStyle = {
    color: theme.colors.fg,
    fontSize: theme.text.md,
    fontWeight: theme.weight.semibold,
  } as const;
  const controlRow = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm } as const;
  const customStyle = customAppearance
    ? { borderWidth: 2, borderColor: theme.colors.primary, padding: theme.space.xs }
    : undefined;

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Listbox' }} />
      <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
        Touch an option to select it. On web, use Tab, arrow keys, Home/End, typeahead and
        Enter/Space to explore and select.
      </Text>

      <Text style={sectionStyle}>Selection and appearance</Text>
      <View style={controlRow}>
        <Control
          label="Selection"
          value={selectionMode}
          selected={selectionMode === 'multiple'}
          onPress={selectionModeChanged}
        />
        <Control
          label="Variant"
          value={currentVariant}
          selected={currentVariant === 'outlined'}
          onPress={() => setVariantIndex(index => (index + 1) % variants.length)}
        />
        <Control
          label="Size"
          value={String(currentSize)}
          onPress={() => setSizeIndex(index => (index + 1) % sizeOptions.length)}
        />
        <Control
          label="Label"
          value={labelHidden ? 'hidden' : 'visible'}
          selected={labelHidden}
          onPress={() => setLabelHidden(value => !value)}
        />
        <Control
          label="Groups"
          value={grouped ? 'on' : 'off'}
          selected={grouped}
          onPress={() => setGrouped(value => !value)}
        />
        <Control
          label="Custom styles"
          value={customAppearance ? 'on' : 'off'}
          selected={customAppearance}
          onPress={() => setCustomAppearance(value => !value)}
        />
      </View>

      <Text style={sectionStyle}>Interaction states and owner control</Text>
      <View style={controlRow}>
        <Control
          label="Global disabled"
          value={disabled ? 'on' : 'off'}
          selected={disabled}
          onPress={() => setDisabled(value => !value)}
        />
        <Control
          label="Read only"
          value={readOnly ? 'on' : 'off'}
          selected={readOnly}
          onPress={() => setReadOnly(value => !value)}
        />
        <Control
          label="Banana disabled"
          value={disabledOption ? 'on' : 'off'}
          selected={disabledOption}
          onPress={() => setDisabledOption(value => !value)}
        />
        <Control
          label="Controlled"
          value={controlled ? 'on' : 'off'}
          selected={controlled}
          onPress={() => {
            setControlled(value => !value);
            setDisplayedValues([]);
            setSelectedValues([]);
            setRevision(value => value + 1);
          }}
        />
        <Control
          label="Accept proposals"
          value={acceptProposals ? 'yes' : 'no'}
          selected={acceptProposals}
          onPress={() => setAcceptProposals(value => !value)}
        />
        <Control
          label="External reset"
          value="clear selection"
          onPress={() => {
            setSelectedValues([]);
            setDisplayedValues([]);
            setRevision(value => value + 1);
          }}
        />
      </View>

      <Listbox
        key={`${revision}-${selectionMode}-${controlled}`}
        label={label}
        labelHidden={labelHidden}
        items={options}
        selectionMode={selectionMode}
        {...(controlled ? { selectedValues } : { defaultSelectedValues: [] })}
        variant={currentVariant}
        size={currentSize}
        disabled={disabled}
        readOnly={readOnly}
        onSelectionChange={onSelectionChange}
        style={customStyle}
        optionStyle={
          customAppearance
            ? {
                paddingHorizontal: theme.space.lg,
                borderRadius: theme.radius.lg,
              }
            : undefined
        }
        selectedStyle={
          customAppearance ? { borderWidth: 2, borderColor: theme.colors.primary } : undefined
        }
        appearance={
          customAppearance
            ? {
                background: theme.colors.surface,
                border: theme.colors.primary,
                radius: theme.radius.lg,
                selectedBackground: theme.colors['primary-subtle'],
                focus: theme.colors.primary,
                maxHeight: 340,
              }
            : { maxHeight: 280 }
        }
      />

      <View style={{ gap: theme.space.xs }}>
        <Text style={{ color: theme.colors.fg, fontSize: theme.text.sm }}>
          Actual selected values: {visibleValues.length ? visibleValues.join(', ') : 'none'}
        </Text>
        <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
          Last proposal: {lastProposal}
        </Text>
        <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
          Controlled mode lets you accept/refuse each proposal; reset changes the owner value.
        </Text>
      </View>
    </ScrollView>
  );
}
