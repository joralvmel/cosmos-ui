import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ComponentStatus } from '@joralvmel/cosmos-core';

export interface StatusEntry {
  name: string;
  title: string;
  category: string;
  priority: number;
  platforms: string[];
  dependsOn: string[];
  status: ComponentStatus;
  missing: string[];
}

export interface DocsPage {
  slug: string;
  title: string;
  markdown: string;
}

export interface McpData {
  status: { summary: Record<string, number>; next: string[]; components: StatusEntry[] };
  docs: DocsPage[];
  llms: Record<string, string>;
}

/** dist/data next to the compiled module; ../dist/data when running from src (tests). */
function dataDir(): string {
  for (const candidate of ['./data/', '../dist/data/']) {
    const path = fileURLToPath(new URL(candidate, import.meta.url));
    if (existsSync(path)) return path;
  }
  throw new Error('Cosmos MCP data not found; build the package first (npm run build).');
}

let cached: McpData | undefined;

/** Data bundled at build time by scripts/build-data.mjs. */
export function loadData(): McpData {
  if (cached) return cached;
  const dir = dataDir();
  const llmsDir = `${dir}llms/`;
  cached = {
    status: JSON.parse(readFileSync(`${dir}status.json`, 'utf8')),
    docs: JSON.parse(readFileSync(`${dir}docs.json`, 'utf8')),
    llms: Object.fromEntries(
      readdirSync(llmsDir).map(file => [
        file.replace(/\.md$/, ''),
        readFileSync(`${llmsDir}${file}`, 'utf8'),
      ])
    ),
  };
  return cached;
}
