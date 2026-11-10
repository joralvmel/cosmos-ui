import { Button, useTheme } from '@joralvmel/cosmos-native';
import { Link, Stack } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { screens } from '../src/screens';
import { demoModes, demoThemes, useDemoSettings } from '../src/settings';

export default function Home() {
  const theme = useTheme();
  const settings = useDemoSettings();

  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Cosmos UI' }} />
      <View style={{ gap: theme.space.sm }}>
        <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>Theme</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
          {demoThemes.map(name => (
            <Button
              key={name}
              size="sm"
              variant={settings.theme === name ? 'solid' : 'outline'}
              onPress={() => settings.setTheme(name)}
            >
              {name}
            </Button>
          ))}
        </View>
        <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>Mode</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
          {demoModes.map(mode => (
            <Button
              key={mode}
              size="sm"
              tone="neutral"
              variant={settings.mode === mode ? 'solid' : 'outline'}
              onPress={() => settings.setMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </View>
      </View>
      {screens.map(screen => (
        <Link key={screen.route} href={screen.route} asChild>
          <Pressable
            accessibilityRole="link"
            style={{
              padding: theme.space.lg,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                color: theme.colors.fg,
                fontSize: theme.text.lg,
                fontWeight: theme.weight.semibold,
              }}
            >
              {screen.title}
            </Text>
            <Text style={{ color: theme.colors['fg-muted'], fontSize: theme.text.sm }}>
              {screen.description}
            </Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}
