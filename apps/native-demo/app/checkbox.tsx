import { Checkbox, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const sizes = ['sm', 'md', 'lg', 56] as const;

function Control({
  label,
  value,
  selected = false,
  onPress,
}: {
  label: string;
  value: string;
  selected?: boolean;
  onPress(): void;
}) {
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

export default function CheckboxScreen() {
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [controlled, setControlled] = useState(true);
  const [acceptProposals, setAcceptProposals] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [required, setRequired] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [hideLabel, setHideLabel] = useState(false);
  const [customSize, setCustomSize] = useState(false);
  const [revision, setRevision] = useState(0);
  const [lastProposal, setLastProposal] = useState('No checked proposal yet');

  const onCheckedChange = ({ checked: next }: { checked: boolean }) => {
    setLastProposal(`Proposed checked: ${next}`);
    if (!controlled || acceptProposals) setChecked(next);
    if (!controlled) setIndeterminate(false);
  };
  const sizeIndex = sizes.indexOf(customSize ? 56 : 'md');
  const selectedSize = sizes[sizeIndex] ?? 'md';
  const controlRow = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm } as const;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Checkbox' }} />
      <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
        Toggle the checkbox by touch. It keeps a 44pt target at every visual size; on the web, Space
        toggles the focused checkbox.
      </Text>

      <Text style={{ color: theme.colors.fg, fontSize: theme.text.md, fontWeight: '600' }}>
        State and ownership
      </Text>
      <View style={controlRow}>
        <Control
          label="Controlled"
          value={controlled ? 'on' : 'off'}
          selected={controlled}
          onPress={() => {
            setControlled(value => !value);
            setChecked(false);
            setIndeterminate(false);
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
          label="Indeterminate"
          value={indeterminate ? 'on' : 'off'}
          selected={indeterminate}
          onPress={() => setIndeterminate(value => !value)}
        />
        <Control
          label="Disabled"
          value={disabled ? 'on' : 'off'}
          selected={disabled}
          onPress={() => setDisabled(value => !value)}
        />
      </View>

      <Text style={{ color: theme.colors.fg, fontSize: theme.text.md, fontWeight: '600' }}>
        Presentation and validation
      </Text>
      <View style={controlRow}>
        <Control
          label="Size"
          value={String(selectedSize)}
          onPress={() => setCustomSize(value => !value)}
        />
        <Control
          label="Required"
          value={required ? 'on' : 'off'}
          selected={required}
          onPress={() => setRequired(value => !value)}
        />
        <Control
          label="Invalid"
          value={invalid ? 'on' : 'off'}
          selected={invalid}
          onPress={() => setInvalid(value => !value)}
        />
        <Control
          label="Hide label"
          value={hideLabel ? 'on' : 'off'}
          selected={hideLabel}
          onPress={() => setHideLabel(value => !value)}
        />
      </View>

      <Checkbox
        key={revision}
        label="Receive product updates"
        hideLabel={hideLabel}
        checked={controlled ? checked : undefined}
        defaultChecked={false}
        indeterminate={indeterminate}
        size={selectedSize}
        disabled={disabled}
        required={required}
        invalid={invalid}
        helpText="You can change this preference at any time."
        errorText={invalid ? 'Choose whether to receive updates.' : undefined}
        onCheckedChange={onCheckedChange}
      >
        <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>(optional)</Text>
      </Checkbox>
      <Text accessibilityLiveRegion="polite" style={{ color: theme.colors['fg-muted'] }}>
        {lastProposal}
      </Text>
      <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
        Current owner value: {String(checked)}. When controlled, turn off Accept proposals to
        exercise refusal.
      </Text>
    </ScrollView>
  );
}
