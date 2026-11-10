/**
 * Registers a custom element once. Safe to call from several bundles or during hot reloads:
 * a tag that is already defined is left untouched.
 */
export function define(tag: string, elementClass: CustomElementConstructor): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tag)) customElements.define(tag, elementClass);
}
