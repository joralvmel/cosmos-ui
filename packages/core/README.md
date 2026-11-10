# @joralvmel/cosmos-core

Contracts, scenarios and headless logic for [Cosmos UI](../../README.md).

Platform-neutral source of truth for every Cosmos component: typed contracts, shared behavior
scenarios and headless helpers (no DOM). Used by the web components, the React/Angular wrappers, the React
Native components, the docs site and the AI tooling.

```ts
import { buttonContract, eventNames, propNames } from '@joralvmel/cosmos-core';

propNames(buttonContract, 'native'); // ['variant', 'tone', 'size', 'disabled', 'loading', 'fullWidth', 'label']
eventNames(buttonContract, 'react'); // ['onPress']
```

## License

MIT
