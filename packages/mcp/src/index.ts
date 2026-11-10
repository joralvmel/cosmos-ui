import { type ComponentContract, contracts } from '@joralvmel/cosmos-core';
import { builtInThemes } from '@joralvmel/cosmos-tokens';

export interface ComponentSummary {
  name: string;
  tag: string;
  description: string;
}

/**
 * Data layer of the future MCP tools (`list_components`, `get_component`, `list_themes`).
 * It reads the same contracts as the libraries, so AI answers cannot drift from the code.
 */
export function listComponents(): ComponentSummary[] {
  return Object.values(contracts).map(({ name, tag, description }) => ({ name, tag, description }));
}

export function getComponent(name: string): ComponentContract | undefined {
  return Object.hasOwn(contracts, name) ? contracts[name as keyof typeof contracts] : undefined;
}

export function listThemes(): { name: string; label: string }[] {
  return builtInThemes.map(({ name, label }) => ({ name, label }));
}
