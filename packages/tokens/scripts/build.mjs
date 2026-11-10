// Writes the static outputs (CSS, JSON, React Native data) from the compiled theme engine.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  builtInThemes,
  defaultThemeName,
  resolveTheme,
  toCss,
  toJson,
  toNative,
  toTailwindTheme,
  toTailwindVariants,
  validateTheme,
} from '../dist/index.js';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
mkdirSync(dist, { recursive: true });

const resolved = builtInThemes.map(resolveTheme);
const failing = resolved.map(validateTheme).filter(report => !report.pass);
if (failing.length > 0) {
  const names = failing.map(report => report.theme).join(', ');
  throw new Error(`Themes failing accessibility validation: ${names}. Run the tokens tests.`);
}

writeFileSync(`${dist}tokens.css`, toCss(resolved));
writeFileSync(
  `${dist}tailwind-theme.css`,
  `/* Cosmos UI Tailwind v4 theme. Generated file, do not edit. */\n${toTailwindTheme(resolved)}\n${toTailwindVariants(resolved)}`
);
writeFileSync(`${dist}tokens.json`, `${JSON.stringify(toJson(resolved), null, 2)}\n`);

const native = toNative(resolved);
writeFileSync(
  `${dist}native.js`,
  `// Generated file, do not edit.
export const nativeThemes = ${JSON.stringify(native, null, 2)};
export const themeNames = ${JSON.stringify(Object.keys(native))};
export const defaultThemeName = ${JSON.stringify(defaultThemeName)};
export function getNativeTheme(name = defaultThemeName, mode = 'light') {
  const theme = nativeThemes[name] ?? nativeThemes[defaultThemeName];
  return theme[mode === 'dark' ? 'dark' : 'light'];
}
`
);
writeFileSync(
  `${dist}native.d.ts`,
  `import type { NativeTheme, NativeThemes } from './outputs.js';
export type { NativeShadow, NativeTheme, NativeThemes } from './outputs.js';
export declare const nativeThemes: NativeThemes;
export declare const themeNames: readonly string[];
export declare const defaultThemeName: string;
export declare function getNativeTheme(name?: string, mode?: 'light' | 'dark'): NativeTheme;
`
);
