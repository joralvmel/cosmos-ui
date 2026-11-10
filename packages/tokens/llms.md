# @joralvmel/cosmos-tokens

Tokens: CSS variables `--cosm-<name>`. Semantic colors: bg, surface, surface-raised, fg, fg-muted, border,
border-strong, primary, primary-hover, primary-fg, primary-subtle, primary-text, accent (same suffixes),
success|warning|danger|info (+ -fg, -subtle, -text), focus-ring, overlay, chart-1..8.
Scales: --cosm-<neutral|primary|accent|success|warning|danger|info>-<1..12>.
Base: --cosm-space-{unit,2xs,xs,sm,md,lg,xl,2xl,3xl}, --cosm-text-{xs..4xl}, --cosm-weight-_, --cosm-leading-_,
--cosm-radius-{sm,md,lg,xl,full}, --cosm-shadow-{sm,md,lg}, --cosm-control-{sm,md,lg}, --cosm-duration-_,
--cosm-easing-_, --cosm-z-*.
Theme/mode: data-theme="cosmos|nebula" + data-mode="light|dark|system" on the same element.
Runtime: import { setTheme, setMode, themeInitScript } from '@joralvmel/cosmos-tokens/runtime'.
React Native: import { getNativeTheme } from '@joralvmel/cosmos-tokens/native' (hex colors, numbers in points).
Never hard-code colors; pick the semantic token (text on primary → primary-fg).
