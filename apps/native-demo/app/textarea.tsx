import { Textarea, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function TextareaScreen() {
  const theme = useTheme();
  const [message, setMessage] = useState('A multiline message');
  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.space.lg,
        gap: theme.space.lg,
      }}
    >
      <Stack.Screen options={{ title: 'Textarea' }} />
      <View style={{ gap: theme.space.sm }}>
        <Text style={{ color: theme.colors.fg, fontSize: theme.text.sm }}>
          Outlined, medium, four rows
        </Text>
        <Textarea
          label="Message"
          helpText="Enter a message on one or more lines."
          rows={4}
          value={message}
          onValueChange={detail => setMessage(detail.value)}
        />
      </View>
      <Textarea
        label="Additional notes"
        variant="filled"
        size="lg"
        rows={3}
        defaultValue={'First line\nSecond line'}
      />
      <Textarea label="Unavailable" disabled defaultValue="This value cannot be edited." />
      <Textarea label="Read-only" readOnly defaultValue="This value remains selectable." />
      <Textarea label="Needs attention" error="Review this message." invalid />
    </ScrollView>
  );
}
