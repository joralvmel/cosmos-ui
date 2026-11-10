# @joralvmel/cosmos-i18n

Internationalization for [Cosmos UI](../../README.md).

> Status: early development. The API below is the current skeleton.

Message formatting with `{name}` arguments and `Intl` helpers.

```ts
import { createTranslator } from '@joralvmel/cosmos-i18n';

const t = createTranslator('es', { greeting: 'Hola, {name}' });
t.t('greeting', { name: 'Ada' }); // 'Hola, Ada'
t.list(['a', 'b', 'c']); // 'a, b y c'
```

ICU plural/select and lazy locales are planned.

## License

MIT
