import { Button, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
const tones = ['primary', 'neutral', 'danger'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

export default function ButtonScreen() {
  const theme = useTheme();
  const [presses, setPresses] = useState(0);
  const section = (title: string) => (
    <Text
      style={{ color: theme.colors.fg, fontSize: theme.text.lg, fontWeight: theme.weight.semibold }}
    >
      {title}
    </Text>
  );
  const row = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm } as const;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Button' }} />
      {section('Variants')}
      {tones.map(tone => (
        <View key={tone} style={row}>
          {variants.map(variant => (
            <Button
              key={variant}
              tone={tone}
              variant={variant}
              onPress={() => setPresses(n => n + 1)}
            >
              {`${tone} ${variant}`}
            </Button>
          ))}
        </View>
      ))}
      {section('Sizes')}
      <View style={row}>
        {sizes.map(size => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </View>
      {section('States')}
      <View style={row}>
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
        <Button fullWidth>Full width</Button>
      </View>
      <Text style={{ color: theme.colors['fg-muted'] }}>{`Presses: ${presses}`}</Text>
    </ScrollView>
  );
}
