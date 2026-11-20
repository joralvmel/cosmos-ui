import { Select, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

const fruitItems = [
  {
    label: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple', description: 'Crisp and sweet.' },
      { value: 'cherry', label: 'Cherry', description: 'Available in summer.' },
    ],
  },
  {
    label: 'Vegetables',
    options: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'broccoli', label: 'Broccoli', disabled: true },
    ],
  },
];

export default function SelectScreen() {
  const theme = useTheme();
  const [fruit, setFruit] = useState<string | null>('apple');
  const label = { color: theme.colors.fg, fontSize: theme.text.md };
  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Select' }} />
      <Select
        label="Favorite fruit"
        items={fruitItems}
        placeholder="Choose a fruit"
        value={fruit}
        onValueChange={({ value }) => setFruit(value)}
        clearable
        clearLabel="Clear fruit"
        required
      />
      <Text style={label}>Selected value: {fruit ?? 'none'}</Text>
      <Select
        label="Seasonal fruit"
        items={fruitItems}
        placeholder="Choose a fruit"
        defaultValue="cherry"
        size="sm"
        helpText="Options are grouped by food type."
      />
      <Select
        label="Unavailable selection"
        items={fruitItems}
        placeholder="Choose a fruit"
        size="lg"
        disabled
      />
      <Select
        label="Validated selection"
        items={fruitItems}
        placeholder="Choose a fruit"
        invalid
        errorText="Choose a fruit before continuing."
      />
    </ScrollView>
  );
}
