import { LitElement } from 'lit';

export interface EmitOptions {
  cancelable?: boolean;
}

/** Base class of every Cosmos element: typed, composed `cosm-*` events. */
export class CosmElement extends LitElement {
  /**
   * Dispatches a bubbling, composed `CustomEvent`. Returns `false` when a cancelable event was
   * prevented, so callers can treat it as a rejected proposal.
   */
  protected emit<T>(name: `cosm-${string}`, detail: T, options: EmitOptions = {}): boolean {
    return this.dispatchEvent(
      new CustomEvent<T>(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: options.cancelable ?? false,
      })
    );
  }
}
