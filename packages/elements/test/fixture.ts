import type { LitElement } from 'lit';

const mounted: HTMLElement[] = [];

/** Renders markup into the document and waits for the first Lit update. */
export async function fixture<T extends LitElement>(markup: string): Promise<T> {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  mounted.push(host);
  const element = host.firstElementChild as T;
  await element.updateComplete;
  return element;
}

export function cleanup(): void {
  for (const host of mounted.splice(0)) host.remove();
}
