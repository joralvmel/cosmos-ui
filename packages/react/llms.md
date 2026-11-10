# @joralvmel/cosmos-react

React 19 wrappers of the Cosmos Web Components (Vite, Next.js). Props map to element properties; event props receive the original CustomEvent.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Setup: React (Vite)

```bash
npm install @joralvmel/cosmos-react @joralvmel/cosmos-tokens
```

**Load the tokens once** (`src/main.tsx`)

```tsx
import '@joralvmel/cosmos-tokens/tokens.css';
```

**Choose theme and mode** (`index.html`)

```html
<html data-theme="cosmos" data-mode="system">
```

**Use components** (`src/App.tsx`)

```tsx
import { Button } from '@joralvmel/cosmos-react';

export default function App() {
  return <Button onPress={event => console.log(event.detail.source)}>Save</Button>;
}
```

- Event props (`onPress`, `onChange`…) receive the original CustomEvent: read `event.detail`.
- Change theme and mode at runtime with `setTheme()` / `setMode()` from `@joralvmel/cosmos-tokens/runtime`.

Guide: https://joralvmel.github.io/cosmos-ui/guides/react-vite/

## Setup: Next.js (App Router)

```bash
npm install @joralvmel/cosmos-react @joralvmel/cosmos-tokens
```

**Load the tokens and avoid a theme flash** (`app/layout.tsx`)

```tsx
import '@joralvmel/cosmos-tokens/tokens.css';
import { themeInitScript } from '@joralvmel/cosmos-tokens/runtime';
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="cosmos" data-mode="system" suppressHydrationWarning>
      <body>
        <Script id="cosmos-theme" strategy="beforeInteractive">
          {themeInitScript()}
        </Script>
        {children}
      </body>
    </html>
  );
}
```

**Use components in Client Components** (`app/save-button.tsx`)

```tsx
'use client';

import { Button } from '@joralvmel/cosmos-react';

export function SaveButton() {
  return <Button onPress={() => console.log('saved')}>Save</Button>;
}
```

- Cosmos components are Web Components: render them from Client Components (`'use client'`). Server Components can render the Client Component that wraps them.
- The server HTML contains the custom element tag; it upgrades in the browser.

Guide: https://joralvmel.github.io/cosmos-ui/guides/nextjs/

## Components

Every component of this package (status of planned ones: https://joralvmel.github.io/cosmos-ui/components/status/).

### `Button`

Triggers an action or submits a form.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | 'solid' \| 'soft' \| 'outline' \| 'ghost' | `solid` | Visual emphasis, from highest (solid) to lowest (ghost). |
| `tone` | 'primary' \| 'neutral' \| 'danger' | `primary` | Color role. Use danger for destructive actions. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Control height and padding. |
| `disabled` | boolean | `false` | Prevents interaction and removes the button from the tab order. |
| `loading` | boolean | `false` | Shows a spinner, sets aria-busy and ignores presses while keeping focus. |
| `fullWidth` | boolean | `false` | Stretches the button to the width of its container. |
| `type` | 'button' \| 'submit' \| 'reset' | `button` | Form behavior of the button. |
| `label` | string | — | Accessible name when the visible content is not descriptive (icon-only buttons). |

Events: `onPress` → `ButtonPressDetail`.

```tsx
import { Button } from '@joralvmel/cosmos-react';

export function Example() {
  return (
    <Button onPress={event => console.log(event.detail)}>Button</Button>
  );
}
```

## Themes

Built-in themes: `cosmos`, `nebula` (default `cosmos`), each with `light` and `dark` modes; `system` follows the OS.

```html
<html data-theme="nebula" data-mode="system">
<!-- runtime: setTheme(name), setMode(mode) from @joralvmel/cosmos-tokens/runtime -->
```

Custom themes: `defineTheme()` in `@joralvmel/cosmos-tokens` (https://joralvmel.github.io/cosmos-ui/theming/themes/).

## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.
- Import components from `@joralvmel/cosmos-react`; event props receive the CustomEvent (`event.detail`).

<!-- generated:end -->
