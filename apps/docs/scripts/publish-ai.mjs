// Publishes the AI references next to the site: /llms.txt and /ai/<package>.md.
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const dist = fileURLToPath(new URL('../dist/', import.meta.url));

mkdirSync(`${dist}ai`, { recursive: true });
copyFileSync(`${root}llms.txt`, `${dist}llms.txt`);
for (const name of readdirSync(`${root}packages`)) {
  const source = `${root}packages/${name}/llms.md`;
  if (existsSync(source)) copyFileSync(source, `${dist}ai/${name}.md`);
}
