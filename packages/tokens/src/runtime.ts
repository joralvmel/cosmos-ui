/**
 * Browser runtime to switch theme and mode. It has no dependency on the theme engine so it can
 * be loaded early without pulling color math into the page.
 */
export type RuntimeMode = 'light' | 'dark' | 'system';

export interface ThemeStateOptions {
  /** Element that carries `data-theme` / `data-mode`. Defaults to `document.documentElement`. */
  root?: HTMLElement;
  /** `localStorage` key used to persist the choice; `false` disables persistence. */
  storageKey?: string | false;
}

const DEFAULT_KEY = 'cosmos-ui';
const namePattern = /^[a-z][a-z0-9-]{1,31}$/;
const modes: readonly RuntimeMode[] = ['light', 'dark', 'system'];

const rootOf = (options?: ThemeStateOptions) => options?.root ?? document.documentElement;
const keyOf = (options?: ThemeStateOptions) =>
  options?.storageKey === false ? undefined : (options?.storageKey ?? DEFAULT_KEY);

function persist(options: ThemeStateOptions | undefined, field: 'theme' | 'mode', value: string) {
  const key = keyOf(options);
  if (!key) return;
  try {
    localStorage.setItem(`${key}:${field}`, value);
  } catch {
    // Storage can be unavailable (private mode, sandboxed iframes); the attribute still applies.
  }
}

export function setTheme(name: string, options?: ThemeStateOptions): void {
  if (!namePattern.test(name)) throw new TypeError(`Invalid theme name "${name}"`);
  rootOf(options).dataset.theme = name;
  persist(options, 'theme', name);
}

export function setMode(mode: RuntimeMode, options?: ThemeStateOptions): void {
  if (!modes.includes(mode)) throw new TypeError(`Invalid mode "${mode}"`);
  rootOf(options).dataset.mode = mode;
  persist(options, 'mode', mode);
}

export function getTheme(options?: ThemeStateOptions): string | undefined {
  return rootOf(options).dataset.theme;
}

export function getMode(options?: ThemeStateOptions): RuntimeMode {
  const mode = rootOf(options).dataset.mode as RuntimeMode | undefined;
  return mode && modes.includes(mode) ? mode : 'light';
}

/** The mode actually rendered (`system` resolved through `prefers-color-scheme`). */
export function getResolvedMode(options?: ThemeStateOptions): 'light' | 'dark' {
  const mode = getMode(options);
  if (mode !== 'system') return mode;
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Inline script for `<head>` that restores the persisted theme and mode before first paint,
 * avoiding a flash of the wrong theme. The storage key is validated, so the output is safe
 * to embed.
 */
export function themeInitScript(
  storageKey: string = DEFAULT_KEY,
  fallbackMode: RuntimeMode = 'system'
) {
  if (!/^[\w-]{1,64}$/.test(storageKey)) throw new TypeError('Invalid storage key');
  if (!modes.includes(fallbackMode)) throw new TypeError('Invalid fallback mode');
  return `(()=>{try{const r=document.documentElement,k='${storageKey}',t=localStorage.getItem(k+':theme'),m=localStorage.getItem(k+':mode');if(t&&/^[a-z][a-z0-9-]{1,31}$/.test(t))r.dataset.theme=t;r.dataset.mode=m==='light'||m==='dark'||m==='system'?m:(r.dataset.mode||'${fallbackMode}');}catch{}})();`;
}
