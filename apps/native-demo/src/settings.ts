import { themeNames } from '@joralvmel/cosmos-tokens/native';
import { createContext, useContext } from 'react';

export type DemoMode = 'light' | 'dark' | 'system';

export interface DemoSettings {
  theme: string;
  mode: DemoMode;
  setTheme(theme: string): void;
  setMode(mode: DemoMode): void;
}

export const demoThemes = themeNames;
export const demoModes: readonly DemoMode[] = ['system', 'light', 'dark'];

export const DemoSettingsContext = createContext<DemoSettings>({
  theme: 'cosmos',
  mode: 'system',
  setTheme: () => {},
  setMode: () => {},
});

export const useDemoSettings = () => useContext(DemoSettingsContext);
