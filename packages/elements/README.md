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

The Custom Elements Manifest is published as `@joralvmel/cosmos-elements/custom-elements.json`.

## License

MIT
