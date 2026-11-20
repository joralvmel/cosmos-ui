import { RadioGroup, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

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

const options = [
  { value: 'email', label: 'Email', description: 'Receive updates by email.' },
  { value: 'phone', label: 'Text message', description: 'Receive updates by text.' },
  { value: 'mail', label: 'Postal mail', description: 'Not currently available.', disabled: true },
];

export default function RadioGroupScreen() {
  const theme = useTheme();
  const [value, setValue] = useState<string | null>(null);
  const [acceptProposals, setAcceptProposals] = useState(true);
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [required, setRequired] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [indicatorSize, setIndicatorSize] = useState<'sm' | 'md' | 'lg' | 28>('md');
  const [lastProposal, setLastProposal] = useState('No selection proposal yet');
  const controlRow = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm } as const;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Radio Group' }} />
      <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
        Choose one option by touch or screen reader. On React Native Web, Tab enters at the selected
        or first enabled option; arrow keys move and select, wrapping past disabled options.
      </Text>

      <Text style={{ color: theme.colors.fg, fontSize: theme.text.md, fontWeight: '600' }}>
        Interaction and validation
      </Text>
      <View style={controlRow}>
        <Control
          label="Indicator size"
          value={typeof indicatorSize === 'number' ? `${indicatorSize} pt` : indicatorSize}
          onPress={() =>
            setIndicatorSize(current =>
              current === 'sm' ? 'md' : current === 'md' ? 'lg' : current === 'lg' ? 28 : 'sm'
            )
          }
        />
        <Control
          label="Accept proposals"
          value={acceptProposals ? 'yes' : 'no'}
          selected={acceptProposals}
          onPress={() => setAcceptProposals(current => !current)}
        />
        <Control
          label="Orientation"
          value={orientation}
          onPress={() =>
            setOrientation(current => (current === 'vertical' ? 'horizontal' : 'vertical'))
          }
        />
        <Control
          label="Required"
          value={required ? 'on' : 'off'}
          selected={required}
          onPress={() => setRequired(current => !current)}
        />
        <Control
          label="Invalid"
          value={invalid ? 'on' : 'off'}
          selected={invalid}
          onPress={() => setInvalid(current => !current)}
        />
        <Control
          label="Disabled"
          value={disabled ? 'on' : 'off'}
          selected={disabled}
          onPress={() => setDisabled(current => !current)}
        />
      </View>

      <RadioGroup
        label="Preferred contact method"
        options={options}
        size={indicatorSize}
        value={value}
        orientation={orientation}
        required={required}
        invalid={invalid}
        disabled={disabled}
        helpText="You can update this preference later."
        errorText={invalid ? 'Review your contact method.' : undefined}
        onValueChange={({ value: proposed }) => {
          setLastProposal(`Proposed value: ${proposed ?? 'none'}`);
          if (acceptProposals) setValue(proposed);
        }}
      />
      <Text accessibilityLiveRegion="polite" style={{ color: theme.colors['fg-muted'] }}>
        {lastProposal}
      </Text>
      <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
        Current owner value: {value ?? 'none'}. Turn off Accept proposals to see controlled
        selection remain unchanged.
      </Text>

      <RadioGroup
        label="Disabled example"
        options={options}
        value="email"
        disabled
        helpText="The selected value remains visible but cannot be changed."
      />
    </ScrollView>
  );
}
