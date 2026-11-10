import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'cosmos-tools',
    include: ['test/**/*.test.mjs'],
    environment: 'node',
  },
});
