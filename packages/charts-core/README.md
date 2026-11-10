# @joralvmel/cosmos-charts-core

Chart layout for [Cosmos UI](../../README.md).

> Status: early development. The API below is the current skeleton.

Pure, DOM-free chart layout shared by web and native charts.

```ts
import { linearScale, niceDomain, seriesColorToken, ticks } from '@joralvmel/cosmos-charts-core';

const y = linearScale(niceDomain(0, 87), [200, 0]);
ticks(0, 100); // [0, 20, 40, 60, 80, 100]
seriesColorToken(0); // 'chart-1'
```

## License

MIT
