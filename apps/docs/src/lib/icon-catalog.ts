import { iconCatalog, isIconDefinition, searchIconCatalog } from '@joralvmel/cosmos-icons';
import type { PlaygroundOptions } from './playground';

const iconModules = import.meta.glob<Record<string, unknown>>(
  '../../../../packages/icons/dist/lucide/*.js'
);

async function loadIcon(name: string) {
  const loader = iconModules[`../../../../packages/icons/dist/lucide/${name}.js`];
  if (!loader) throw new Error('Unknown icon');
  const module = await loader();
  const icon = Object.values(module).find(isIconDefinition);
  if (!icon) throw new Error('Invalid icon');
  return icon;
}

export const iconReferenceCatalog = {
  items: iconCatalog,
  search: (query: string) => searchIconCatalog(iconCatalog, query),
  load: loadIcon,
  preview: async (name: string) => {
    const icon = await loadIcon(name);
    const element = document.createElement('cosm-icon');
    element.icon = icon;
    element.size = 24;
    return element;
  },
} satisfies NonNullable<PlaygroundOptions['referenceCatalogs']>[string];
