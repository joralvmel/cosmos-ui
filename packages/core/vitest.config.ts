import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'cosmos-core',
    environment: 'node',
    typecheck: { enabled: false },
  },
});
