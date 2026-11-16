# @joralvmel/cosmos-elements

Web Components for [Cosmos UI](../../README.md).

Framework-agnostic Cosmos components built with Lit. Styled only with Cosmos tokens.

```js
import '@joralvmel/cosmos-tokens/tokens.css';
import '@joralvmel/cosmos-elements/button';
```

```html
<cosm-button variant="soft" tone="primary">Save</cosm-button>
<script type="module">
  document.querySelector('cosm-button').addEventListener('cosm-press', event => {
    console.log(event.detail.source); // 'pointer' | 'keyboard' | 'programmatic'
  });
</script>
```

## Components

| Element         | Import                              | Description                        |
| --------------- | ----------------------------------- | ---------------------------------- |
| `<cosm-button>` | `@joralvmel/cosmos-elements/button` | Action or form submit/reset button |
| `<cosm-text-field>` | `@joralvmel/cosmos-elements/text-field` | Labeled single-line entry with browser form validation |

The Custom Elements Manifest is published as `@joralvmel/cosmos-elements/custom-elements.json`.

Text-field start/end icons support independent `--cosm-text-field-start-icon-color` and
`--cosm-text-field-end-icon-color` hooks, with optional `-focus-color` equivalents replacing
`-color`. `icon-focus-scope="control"` (default) includes the input and action buttons;
`"input"` limits those focus colors to the editable input. Unset hooks preserve existing colors;
affixes and action icons are unaffected.

## License

MIT
