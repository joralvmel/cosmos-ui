const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** Builds every naming variant of a kebab-case name, or throws with a helpful message. */
export function names(input) {
  const kebab = String(input ?? '')
    .trim()
    .replace(/^cosm-/, '');
  if (!KEBAB.test(kebab) || kebab.length > 40) {
    throw new Error(
      `Invalid name "${input}": use kebab-case, e.g. "date-picker" (without "cosm-").`
    );
  }
  const words = kebab.split('-');
  const pascal = words.map(word => word[0].toUpperCase() + word.slice(1)).join('');
  const camel = pascal[0].toLowerCase() + pascal.slice(1);
  const title = words.map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
  return { kebab, pascal, camel, title, tag: `cosm-${kebab}` };
}
