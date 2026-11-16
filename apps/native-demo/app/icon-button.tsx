import { heart } from '@joralvmel/cosmos-icons/heart';
import { settings } from '@joralvmel/cosmos-icons/settings';
import { sun } from '@joralvmel/cosmos-icons/sun';
import { Icon, IconButton, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
const tones = ['primary', 'neutral', 'danger'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

export default function IconButtonScreen() {
  const theme = useTheme();
  const [presses, setPresses] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [proposedPressed, setProposedPressed] = useState<boolean | undefined>();
  const section = (title: string) => (
    <Text
      style={{ color: theme.colors.fg, fontSize: theme.text.lg, fontWeight: theme.weight.semibold }}
    >
      {title}
    </Text>
  );
  const row = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm } as const;
  const recordPress = () => setPresses(count => count + 1);

  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Icon Button' }} />
      {section('Variants and tones')}
      {tones.map(tone => (
        <View key={tone} style={row}>
          {variants.map(variant => (
            <IconButton
              key={`${tone}-${variant}`}
              label={`${tone} ${variant} action`}
              tone={tone}
              variant={variant}
              onPress={recordPress}
            >
              <Icon icon={settings} />
            </IconButton>
          ))}
        </View>
      ))}
      {section('Sizes')}
      <View style={row}>
        {sizes.map(size => (
          <IconButton
            key={size}
            label={`${size} sun action`}
            size={size}
            onPress={recordPress}
            style={{ margin: theme.space.xs }}
          >
            <Icon icon={sun} size={size} />
          </IconButton>
        ))}
      </View>
      {section('States and customization')}
      <View style={row}>
        <IconButton
          label="Favorite"
          mode="toggle"
          defaultPressed={false}
          onPressedChange={({ pressed }) => setFavorite(pressed)}
        >
          <Icon icon={heart} fill={favorite ? 'currentColor' : 'none'} />
        </IconButton>
        <IconButton
          label="Controlled favorite (owner refuses)"
          mode="toggle"
          pressed={false}
          onPressedChange={({ pressed }) => setProposedPressed(pressed)}
        >
          <Icon icon={heart} strokeWidth={3} />
        </IconButton>
        <IconButton label="Disabled settings" disabled>
          <Icon icon={settings} />
        </IconButton>
      </View>
      <Text style={{ color: theme.colors['fg-muted'] }}>{`Action presses: ${presses}`}</Text>
      <Text style={{ color: theme.colors['fg-muted'] }}>
        {`Uncontrolled favorite: ${favorite ? 'pressed' : 'not pressed'}`}
      </Text>
      <Text style={{ color: theme.colors['fg-muted'] }}>
        {`Controlled proposal (state remains false): ${proposedPressed ?? 'none yet'}`}
      </Text>
    </ScrollView>
  );
}
