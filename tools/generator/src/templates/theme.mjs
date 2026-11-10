export const definition = (n, seed) => `
/** ${n.title}: TODO(generator) describe the palette and the feeling of the theme. */
export const ${n.camel}: ThemeDefinition = defineTheme({
  name: '${n.kebab}',
  label: '${n.title}',
  seeds: { primary: '${seed}' },
  harmony: 'analogous',
  neutral: { tint: 'primary', chroma: 0.012 },
  radius: 'rounded',
});
`;

export const changeset = n => `---
'@joralvmel/cosmos-tokens': minor
'@joralvmel/cosmos-tailwind': minor
---

Add the ${n.title} theme (light and dark).
`;
