import dotenvx from '@dotenvx/dotenvx';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

dotenvx.config({ convention: 'nextjs' });

export default defineConfig({
  oxc: false,
  plugins: [
    swc.vite({
      tsconfigFile: './tsconfig.app.json',
    }),
  ],
  test: {
    globalSetup: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['dist/**', 'node_modules/**'],
    server: {
      deps: {
        inline: true,
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
    extensions: ['.ts', '.js', '.json', '.tsx', '.jsx', '.mts', '.mjs'],
  },
});
