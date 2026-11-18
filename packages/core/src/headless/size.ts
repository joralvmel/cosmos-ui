/** Validates the shared semantic or custom visual-size contract. */
export function validateSize(size: unknown, component: string): void {
  if (
    size !== 'sm' &&
    size !== 'md' &&
    size !== 'lg' &&
    !(typeof size === 'number' && Number.isFinite(size) && size > 0)
  ) {
    throw new TypeError(`${component} size must be sm, md, lg or a positive finite number.`);
  }
}
