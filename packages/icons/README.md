# @joralvmel/cosmos-icons

Framework-neutral structured SVG definitions based on Lucide Icons 1.72.0. Import one icon module
at a time; the package does not create a global runtime name registry.

```ts
import { house } from '@joralvmel/cosmos-icons/house';
import type { IconDefinition } from '@joralvmel/cosmos-icons';
```

`IconDefinition` contains a name, view box and safe SVG node tuples. Use `isIconDefinition()` before
rendering definitions loaded from untrusted data. `iconCatalog` provides names, categories and
search tags without importing glyph modules.
`searchIconCatalog(iconCatalog, query)` ranks exact names before prefixes and other metadata matches.

Sync the version pinned in this workspace with `npm run sync-icons --workspace=@joralvmel/cosmos-icons`.
Lucide's ISC license and required MIT-derived Feather notice are shipped in
[`LICENSE-lucide`](./LICENSE-lucide); attribution is also listed in
[`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).
