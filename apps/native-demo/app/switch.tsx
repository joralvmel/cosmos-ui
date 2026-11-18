import { Switch, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

function Control({
  id,
  label,
  value,
  selected = false,
  onPress,
}: {
  id: string;
  label: string;
  value: string;
  selected?: boolean;
  onPress(): void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      testID={`switch-demo-${id}`}
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

export default function SwitchScreen() {
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const [controlled, setControlled] = useState(true);
  const [acceptProposals, setAcceptProposals] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [hideLabel, setHideLabel] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [revision, setRevision] = useState(0);
  const [lastProposal, setLastProposal] = useState('No checked proposal yet');

  const onCheckedChange = ({ checked: next }: { checked: boolean }) => {
    setLastProposal(`Proposed checked: ${next}`);
    if (!controlled || acceptProposals) setChecked(next);
  };
  const controlRow = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm } as const;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Switch' }} />
      <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
        Switch toggles the setting immediately. The platform control keeps its system size and at
        least a 44pt touch target.
      </Text>

      <Text style={{ color: theme.colors.fg, fontSize: theme.text.md, fontWeight: '600' }}>
        State and ownership
      </Text>
      <View style={controlRow}>
        <Control
          id="controlled"
          label="Controlled"
          value={controlled ? 'on' : 'off'}
          selected={controlled}
          onPress={() => {
            setControlled(value => !value);
            setChecked(false);
            setRevision(value => value + 1);
          }}
        />
        <Control
          id="accept-proposals"
          label="Accept proposals"
          value={acceptProposals ? 'yes' : 'no'}
          selected={acceptProposals}
          onPress={() => setAcceptProposals(value => !value)}
        />
        <Control
          id="disabled"
          label="Disabled"
          value={disabled ? 'on' : 'off'}
          selected={disabled}
          onPress={() => setDisabled(value => !value)}
        />
      </View>

      <Text style={{ color: theme.colors.fg, fontSize: theme.text.md, fontWeight: '600' }}>
        Label and help
      </Text>
      <View style={controlRow}>
        <Control
          id="hide-label"
          label="Hide label"
          value={hideLabel ? 'on' : 'off'}
          selected={hideLabel}
          onPress={() => setHideLabel(value => !value)}
        />
        <Control
          id="help-text"
          label="Help text"
          value={showHelp ? 'on' : 'off'}
          selected={showHelp}
          onPress={() => setShowHelp(value => !value)}
        />
      </View>

      <Switch
        key={revision}
        testID="switch-preference"
        label="Enable product notifications"
        hideLabel={hideLabel}
        checked={controlled ? checked : undefined}
        defaultChecked={false}
        disabled={disabled}
        helpText={showHelp ? 'You can change this preference at any time.' : undefined}
        onCheckedChange={onCheckedChange}
      />
      <Text
        testID="switch-last-proposal"
        accessibilityLiveRegion="polite"
        style={{ color: theme.colors['fg-muted'] }}
      >
        {lastProposal}
      </Text>
      <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
        Current owner value: {String(checked)}. When controlled, turn off Accept proposals to
        exercise refusal. Turn Controlled off to try autonomous behavior.
      </Text>
    </ScrollView>
  );
}
