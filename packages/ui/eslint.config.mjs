import reactConfig from '@pkg/config/eslint/react';
import { defineConfig } from 'eslint/config';
import storybook from 'eslint-plugin-storybook';

export default defineConfig([
  {
    ignores: ['src/components/ui/**', 'src/lib/**', 'vitest.shims.d.ts'],
  },
  reactConfig,
  storybook.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
