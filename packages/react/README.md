# @joralvmel/cosmos-react

React wrappers for [Cosmos UI](../../README.md).

React 19 wrappers of the Cosmos Web Components.

```tsx
import '@joralvmel/cosmos-tokens/tokens.css';
import { Button } from '@joralvmel/cosmos-react';

export function Toolbar() {
  return (
    <Button variant="soft" onPress={event => console.log(event.detail.source)}>
      Save
    </Button>
  );
}
```

## License

MIT
