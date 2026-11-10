import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolve browser builds (e.g. @lit/react sets element properties only outside its Node build).
  resolve: { conditions: ['browser'] },
  ssr: { resolve: { conditions: ['browser'], externalConditions: ['browser'] } },
  test: {
    name: 'cosmos-react',
    environment: 'happy-dom',
    server: { deps: { inline: ['@lit/react'] } },
  },
});
