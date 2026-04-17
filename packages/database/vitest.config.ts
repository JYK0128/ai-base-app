import dotenvx from '@dotenvx/dotenvx';
import { defineConfig } from 'vitest/config';

dotenvx.config({ convention: 'nextjs' });

export default defineConfig({
  test: {
    globalSetup: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    tsconfigPaths: true,
    extensions: ['.ts', '.js', '.json', '.tsx', '.jsx', '.mts', '.mjs'],
  },
});
