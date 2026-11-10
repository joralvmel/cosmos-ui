// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// Public URL for GitHub Pages, e.g. https://user.github.io/cosmos-ui/ → site + base.
const pagesUrl = process.env.COSMOS_DOCS_URL?.trim();
const url = pagesUrl ? new URL(pagesUrl.replace(/\/?$/, '/')) : undefined;

export default defineConfig({
  site: url?.origin,
  base: url?.pathname ?? '/',
  integrations: [
    starlight({
      title: 'Cosmos UI',
      description:
        'Themeable design system: Web Components, React, Angular and React Native from one contract.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        es: { label: 'Español', lang: 'es' },
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/joralvmel/cosmos-ui' }],
      customCss: ['@joralvmel/cosmos-tokens/tokens.css', './src/styles/docs.css'],
      components: {
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      lastUpdated: false,
      sidebar: [
        {
          label: 'Getting started',
          translations: { es: 'Primeros pasos' },
          items: [
            { slug: 'getting-started/introduction' },
            { slug: 'getting-started/installation' },
          ],
        },
        {
          label: 'Theming',
          translations: { es: 'Temas' },
          items: [{ autogenerate: { directory: 'theming' } }],
        },
        {
          label: 'Components',
          translations: { es: 'Componentes' },
          items: [{ autogenerate: { directory: 'components' } }],
        },
        {
          label: 'Contribute',
          translations: { es: 'Contribuir' },
          items: [{ autogenerate: { directory: 'contribute' } }],
        },
      ],
    }),
  ],
});
