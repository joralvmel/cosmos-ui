import {
  defaultThemeName,
  getNativeTheme,
  type NativeTheme,
} from '@joralvmel/cosmos-tokens/native';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeModePreference = 'light' | 'dark' | 'system';

const ThemeContext = createContext<NativeTheme>(getNativeTheme(defaultThemeName, 'light'));

export interface CosmosThemeProviderProps {
  /** Theme name (`cosmos`, `nebula`…). Unknown names fall back to the default theme. */
  theme?: string;
  /** `system` follows the device appearance. */
  mode?: ThemeModePreference;
  children?: ReactNode;
}

/** Provides a Cosmos theme to native components. Mirrors `data-theme` / `data-mode` on the web. */
export function CosmosThemeProvider({
  theme = defaultThemeName,
  mode = 'system',
  children,
}: CosmosThemeProviderProps) {
  const scheme = useColorScheme();
  const resolvedMode = mode === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : mode;
  const value = useMemo(() => getNativeTheme(theme, resolvedMode), [theme, resolvedMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Current Cosmos theme: colors, spacing, radii and typography as numbers. */
export function useTheme(): NativeTheme {
  return useContext(ThemeContext);
}
