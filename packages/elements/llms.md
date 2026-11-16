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
### `<cosm-icon>`

Renders a structured SVG icon. Decorative icons are hidden from assistive technology; informative icons require a text label.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | IconDefinition | Required | Structured icon definition, commonly imported from @joralvmel/cosmos-icons. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic size (16, 20 or 24) or a positive finite number in pixels / native units. |
| `stroke` | string | `currentColor` | Stroke paint; currentColor inherits on web and resolves to the theme foreground on native. |
| `fill` | string | `none` | Root fill paint. Explicit node fills take precedence. |
| `strokeWidth` (`stroke-width`) | number | `2` | Finite nonnegative stroke width in SVG viewBox units. |
| `label` | string | — | Accessible name required when decorative is false. |
| `decorative` | boolean | `true` | Hides the icon from assistive technology when true. |

Events: none.

```html
<cosm-icon></cosm-icon>

<script type="module">
  import '@joralvmel/cosmos-elements/icon';
  import { house } from '@joralvmel/cosmos-icons/house';

  const element = document.querySelector('cosm-icon');
  element.icon = house;
</script>
```
### `<cosm-text-field>`

Accepts a single line of text with an accessible label, optional help and error text, and native form validation on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Accessible name for the editable control. It is rendered above the control unless visually hidden. |
| `labelHidden` (`label-hidden`) | boolean | `false` | Visually hides the label while keeping it available to assistive technology. |
| `value` | string | — | Current text. When bound, edits are proposals and the component waits for the owner to supply the accepted value. |
| `defaultValue` (`default-value`) | string | `` | Initial value for autonomous use. Web form reset restores this value; it does not control subsequent edits. |
| `type` | 'text' \| 'email' \| 'password' \| 'tel' \| 'url' \| 'search' | `text` | Single-line input type. Native maps it to supported keyboard, autofill and secure-entry behavior. |
| `variant` | 'outlined' \| 'filled' | `outlined` | Visual treatment of the editable control. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic size or a positive finite minimum editable-control height in CSS pixels on web and logical units on native. |
| `placeholder` | string | — | Short input hint; it never replaces the accessible label. |
| `helpText` (`help-text`) | string | — | Optional supporting text associated with the editable control. |
| `error` | string | — | Optional externally supplied error text associated with the editable control. |
| `invalid` | boolean | `false` | External invalid state, independent of browser constraints or consumer business validation. |
| `required` | boolean | `false` | Exposes required semantics. On web, participates in native HTML constraint validation. |
| `disabled` | boolean | `false` | Disables editing and interaction. On web, follows disabled fieldsets and excludes the value from form submission. |
| `readOnly` (`read-only`) | boolean | `false` | Prevents editing while remaining focusable and form-submittable on web; distinct from disabled. |
| `minLength` (`min-length`) | number | — | Minimum number of characters. Web uses native HTML validity; native business validation remains the consumer’s responsibility. |
| `maxLength` (`max-length`) | number | — | Maximum number of characters. Web uses native HTML validity and native applies supported input limits. |
| `pattern` | string | — | Web-only HTML pattern constraint. Native does not emulate HTML regular-expression validation. |
| `name` | string | — | Form field name on web. React Native has no HTML form association or name-based submission. |
| `autoComplete` (`auto-complete`) | string | — | Consumer-provided completion/autofill hint, mapped to attributes supported by each platform. |
| `inputMode` (`input-mode`) | 'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url' | — | Input or keyboard hint (none, text, decimal, numeric, tel, search, email or url); it does not add numeric or multiline field behavior. |
| `startIcon` (`start-icon`) | IconDefinition | — | Optional structured decorative icon before the editable text. |
| `endIcon` (`end-icon`) | IconDefinition | — | Optional structured decorative icon after the editable text. |
| `iconFocusScope` (`icon-focus-scope`) | 'control' \| 'input' | `control` | When configured icon focus colors apply: control includes the input and clear/reveal buttons; input includes only the editable input. Does not change icons without a focus-color override. |
| `prefix` | string | — | Optional non-interactive text decoration before the editable text. |
| `suffix` | string | — | Optional non-interactive text decoration after the editable text. |
| `clearable` | boolean | `false` | Shows a clear action for non-empty editable fields. Supply clearLabel when enabled. |
| `clearLabel` (`clear-label`) | string | — | Consumer-supplied localized accessible name for the clear action. |
| `passwordReveal` (`password-reveal`) | boolean | `false` | Opts into a reveal action for password fields. Supply both revealPasswordLabel and hidePasswordLabel when enabled. |
| `revealPasswordLabel` (`reveal-password-label`) | string | — | Consumer-supplied localized accessible name while the password is concealed. |
| `hidePasswordLabel` (`hide-password-label`) | string | — | Consumer-supplied localized accessible name while the password is revealed. |

Events: `cosm-change` → `TextFieldChangeDetail`, `cosm-submit` → `TextFieldSubmitDetail`.

```html
<cosm-text-field label="TextField"></cosm-text-field>

<script type="module">
  import '@joralvmel/cosmos-elements/text-field';
  import { search } from '@joralvmel/cosmos-icons/search';

  const element = document.querySelector('cosm-text-field');
  element.startIcon = search;
  element.endIcon = search;
  element.addEventListener('cosm-change', event => console.log(event.detail));
  element.addEventListener('cosm-submit', event => console.log(event.detail));
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

## Text-field layout

The web text field defaults to `20ch`, capped at its container width. Override CSS `width` for
your layout (for example `width: 100%`). Clear/reveal actions and decorations fit inside that width.
