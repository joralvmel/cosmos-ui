# @joralvmel/cosmos-elements

Framework-agnostic Web Components (Lit) of Cosmos UI. Use them in plain HTML or any framework; React and Angular users should prefer `@joralvmel/cosmos-react` / `@joralvmel/cosmos-angular`.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Setup: HTML / CDN

**Load tokens and components from a CDN** (`index.html`)

```html
<!doctype html>
<html lang="en" data-theme="cosmos" data-mode="system">
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@joralvmel/cosmos-tokens/dist/tokens.css" />
    <script type="module" src="https://esm.sh/@joralvmel/cosmos-elements/button"></script>
  </head>
  <body>
    <cosm-button variant="soft">Save</cosm-button>
    <script type="module">
      document.querySelector('cosm-button').addEventListener('cosm-press', event => {
        console.log(event.detail.source);
      });
    </script>
  </body>
</html>
```

- With a bundler, `npm install @joralvmel/cosmos-elements @joralvmel/cosmos-tokens` and import `@joralvmel/cosmos-elements/<component>`.
- DOM events are `cosm-*` CustomEvents that bubble and cross shadow roots.

Guide: https://joralvmel.github.io/cosmos-ui/guides/html-cdn/

## Components

Every component of this package (status of planned ones: https://joralvmel.github.io/cosmos-ui/components/status/).

### `<cosm-button>`

Triggers an action or submits a form.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | 'solid' \| 'soft' \| 'outline' \| 'ghost' | `solid` | Visual emphasis, from highest (solid) to lowest (ghost). |
| `tone` | 'primary' \| 'neutral' \| 'danger' | `primary` | Color role. Use danger for destructive actions. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Control height and padding. |
| `disabled` | boolean | `false` | Prevents interaction and removes the button from the tab order. |
| `loading` | boolean | `false` | Shows a spinner, sets aria-busy and ignores presses while keeping focus. |
| `fullWidth` (`full-width`) | boolean | `false` | Stretches the button to the width of its container. |
| `type` | 'button' \| 'submit' \| 'reset' | `button` | Form behavior of the button. |
| `label` | string | — | Accessible name when the visible content is not descriptive (icon-only buttons). |

Events: `cosm-press` → `ButtonPressDetail`.

```html
<cosm-button>Button</cosm-button>

<script type="module">
  import '@joralvmel/cosmos-elements/button';

  const element = document.querySelector('cosm-button');
  element.addEventListener('cosm-press', event => console.log(event.detail));
</script>
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
- Use `<cosm-*>` elements and listen to `cosm-*` DOM events; import each component from `@joralvmel/cosmos-elements/<name>`.

<!-- generated:end -->
