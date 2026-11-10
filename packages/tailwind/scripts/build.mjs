// Bundles the Cosmos tokens and the Tailwind v4 theme into importable stylesheets.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = specifier => readFileSync(fileURLToPath(import.meta.resolve(specifier)), 'utf8');
const tokens = read('@joralvmel/cosmos-tokens/tokens.css');
const theme = read('@joralvmel/cosmos-tokens/tailwind-theme.css');

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
mkdirSync(dist, { recursive: true });

// theme.css: utilities + variants only, for apps that load tokens.css themselves.
writeFileSync(`${dist}theme.css`, theme);
// index.css: self-contained (tokens + theme + variants).
writeFileSync(`${dist}index.css`, `${tokens}\n${theme}`);
