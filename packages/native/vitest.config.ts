import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// React Native primitives are replaced by DOM stand-ins (test/react-native.mock.tsx), so the
// components run in happy-dom with react-dom. Device-level checks belong to apps/native-demo.
export default defineConfig({
  resolve: {
    alias: {
      'react-native': fileURLToPath(new URL('./test/react-native.mock.tsx', import.meta.url)),
    },
  },
  test: {
    name: 'cosmos-native',
    environment: 'happy-dom',
  },
});
