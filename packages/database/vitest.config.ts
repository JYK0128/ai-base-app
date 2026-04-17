import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    extensions: ['.ts', '.js', '.json', '.tsx', '.jsx', '.mts', '.mjs'],
  },
});
