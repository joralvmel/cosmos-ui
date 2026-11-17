import { CosmosThemeProvider, PopoverProvider, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { type DemoMode, DemoSettingsContext } from '../src/settings';

function ThemedStack() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <PopoverProvider safeAreaInsets={safeAreaInsets}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.fg,
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      />
    </PopoverProvider>
  );
}

export default function RootLayout() {
  const [theme, setTheme] = useState('cosmos');
  const [mode, setMode] = useState<DemoMode>('system');
  const settings = useMemo(() => ({ theme, mode, setTheme, setMode }), [theme, mode]);

  return (
    <DemoSettingsContext.Provider value={settings}>
      <CosmosThemeProvider theme={theme} mode={mode}>
        <SafeAreaProvider>
          <ThemedStack />
        </SafeAreaProvider>
      </CosmosThemeProvider>
    </DemoSettingsContext.Provider>
  );
}
