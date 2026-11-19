import { Button, Calendar, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function CalendarScreen() {
  const theme = useTheme();
  const [value, setValue] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
  });
  const [locale, setLocale] = useState<'en-US' | 'es-ES'>('en-US');
  const [bounded, setBounded] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const year = value.slice(0, 4);
  const section = {
    color: theme.colors.fg,
    fontSize: theme.text.lg,
    fontWeight: theme.weight.semibold,
  } as const;
  const row = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm } as const;
  const min = bounded ? `${year}-01-01` : undefined;
  const max = bounded ? `${year}-12-31` : undefined;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Calendar' }} />
      <Text style={section}>Selected date: {value}</Text>
      <Calendar
        value={value}
        min={min}
        max={max}
        locale={locale}
        disabled={disabled}
        onValueChange={({ value: nextValue }) => setValue(nextValue)}
        testID="calendar"
      />
      <View style={{ gap: theme.space.sm }}>
        <Text style={section}>Locale</Text>
        <View style={row}>
          <Button
            variant={locale === 'en-US' ? 'solid' : 'outline'}
            onPress={() => setLocale('en-US')}
          >
            English
          </Button>
          <Button
            variant={locale === 'es-ES' ? 'solid' : 'outline'}
            onPress={() => setLocale('es-ES')}
          >
            Español
          </Button>
        </View>
      </View>
      <View style={row}>
        <Button variant={bounded ? 'solid' : 'outline'} onPress={() => setBounded(value => !value)}>
          {bounded ? 'Remove date limits' : 'Limit to this year'}
        </Button>
        <Button
          variant={disabled ? 'solid' : 'outline'}
          onPress={() => setDisabled(value => !value)}
        >
          {disabled ? 'Enable calendar' : 'Disable calendar'}
        </Button>
      </View>
    </ScrollView>
  );
}
