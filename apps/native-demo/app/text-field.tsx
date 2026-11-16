import { heart } from '@joralvmel/cosmos-icons/heart';
import { search } from '@joralvmel/cosmos-icons/search';
import { TextField, type TextFieldProps, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: 44,
        minWidth: 44,
        justifyContent: 'center',
        paddingHorizontal: theme.space.sm,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? theme.colors['primary-subtle'] : theme.colors.bg,
      }}
    >
      <Text style={{ color: theme.colors.fg }}>{label}</Text>
    </Pressable>
  );
}

export default function TextFieldScreen() {
  const theme = useTheme();
  const [accepted, setAccepted] = useState('');
  const [proposal, setProposal] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [variant, setVariant] = useState<NonNullable<TextFieldProps['variant']>>('outlined');
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'custom'>('md');
  const [customSize, setCustomSize] = useState('80');
  const [type, setType] = useState<NonNullable<TextFieldProps['type']>>('text');
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(false);
  const [labelHidden, setLabelHidden] = useState(false);
  const [adornments, setAdornments] = useState(false);
  const [actions, setActions] = useState(false);
  const [accept, setAccept] = useState(true);
  const [controlled, setControlled] = useState('Example');
  const [lastProposal, setLastProposal] = useState('');
  const height = Number(customSize);
  const validHeight = customSize.trim() !== '' && Number.isFinite(height) && height > 0;
  const groupStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.xs } as const;
  const textStyle = { color: theme.colors.fg };
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}
    >
      <Stack.Screen options={{ title: 'Text Field' }} />
      <Text style={textStyle}>Interactive text field</Text>
      <TextField
        label="Interactive field"
        labelHidden={labelHidden}
        value={controlled}
        onValueChange={({ value }) => {
          setLastProposal(value);
          if (accept) setControlled(value);
        }}
        variant={variant}
        size={size === 'custom' ? (validHeight ? height : 'md') : size}
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        invalid={invalid}
        error={invalid ? 'Please check this value.' : undefined}
        helpText="Use the controls below to change this field."
        startIcon={adornments ? search : undefined}
        endIcon={adornments ? heart : undefined}
        prefix={adornments ? '#' : undefined}
        suffix={adornments ? '.com' : undefined}
        clearable={actions}
        clearLabel="Clear interactive field"
        passwordReveal={actions}
        revealPasswordLabel="Show password"
        hidePasswordLabel="Hide password"
      />
      <Text style={textStyle}>Last proposed value: {lastProposal}</Text>
      <Text style={textStyle}>Variant</Text>
      <View style={groupStyle}>
        {(['outlined', 'filled'] as const).map(item => (
          <Choice
            key={item}
            label={item}
            selected={variant === item}
            onPress={() => setVariant(item)}
          />
        ))}
      </View>
      <Text style={textStyle}>Size</Text>
      <View style={groupStyle}>
        {(['sm', 'md', 'lg', 'custom'] as const).map(item => (
          <Choice key={item} label={item} selected={size === item} onPress={() => setSize(item)} />
        ))}
      </View>
      <TextInput
        accessibilityLabel="Custom height"
        value={customSize}
        onChangeText={setCustomSize}
        keyboardType="decimal-pad"
        style={{
          minHeight: 44,
          color: theme.colors.fg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: theme.space.sm,
        }}
      />
      {!validHeight && (
        <Text style={textStyle}>Enter a positive finite height; medium is shown until valid.</Text>
      )}
      <Text style={textStyle}>Type</Text>
      <View style={groupStyle}>
        {(['text', 'email', 'password', 'tel', 'url', 'search'] as const).map(item => (
          <Choice key={item} label={item} selected={type === item} onPress={() => setType(item)} />
        ))}
      </View>
      <Text style={textStyle}>States and features</Text>
      <View style={groupStyle}>
        <Choice label="Disabled" selected={disabled} onPress={() => setDisabled(!disabled)} />
        <Choice label="Read only" selected={readOnly} onPress={() => setReadOnly(!readOnly)} />
        <Choice label="Required" selected={required} onPress={() => setRequired(!required)} />
        <Choice label="Invalid" selected={invalid} onPress={() => setInvalid(!invalid)} />
        <Choice
          label="Hide label"
          selected={labelHidden}
          onPress={() => setLabelHidden(!labelHidden)}
        />
        <Choice
          label="Adornments"
          selected={adornments}
          onPress={() => setAdornments(!adornments)}
        />
        <Choice label="Actions" selected={actions} onPress={() => setActions(!actions)} />
        <Choice
          label={accept ? 'Accept edits' : 'Reject edits'}
          selected={accept}
          onPress={() => setAccept(!accept)}
        />
      </View>
      <Text style={textStyle}>More examples</Text>
      <TextField
        label="Outlined small"
        size="sm"
        placeholder="Type here"
        helpText="Autonomous input"
      />
      <TextField label="Filled medium" variant="filled" defaultValue="Filled" />
      <TextField label="Large" size="lg" />
      <TextField label="Custom minimum height" size={80} />
      <TextField label="Email" type="email" autoComplete="email" required />
      <TextField label="Phone" type="tel" inputMode="tel" />
      <TextField label="Website" type="url" />
      <TextField
        label="Search"
        type="search"
        startIcon={search}
        endIcon={heart}
        prefix="#"
        suffix=".com"
        clearable
        clearLabel="Clear search"
        onSubmitEditing={({ value }) => setSubmitted(value)}
      />
      <Text style={{ color: theme.colors.fg }}>Submitted: {submitted}</Text>
      <TextField
        label="Password"
        type="password"
        passwordReveal
        revealPasswordLabel="Show password"
        hidePasswordLabel="Hide password"
        clearable
        clearLabel="Clear password"
      />
      <TextField label="Hidden visual label" labelHidden placeholder="Hidden label" />
      <TextField label="Disabled" disabled defaultValue="Disabled" />
      <TextField label="Read only" readOnly defaultValue="Read only" />
      <TextField
        label="Invalid"
        invalid
        error="Please check this value."
        helpText="External validation"
      />
      <TextField
        label="Controlled accepted"
        value={accepted}
        onValueChange={({ value }) => setAccepted(value)}
        clearable
        clearLabel="Clear accepted value"
      />
      <TextField
        label="Controlled rejected"
        value="Fixed"
        onValueChange={({ value }) => setProposal(value)}
        clearable
        clearLabel="Clear rejected value"
      />
      <Text style={{ color: theme.colors.fg }}>Last rejected proposal: {proposal}</Text>
    </ScrollView>
  );
}
