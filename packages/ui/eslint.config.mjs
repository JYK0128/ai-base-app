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
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    settings: {
      'better-tailwindcss': {
        cwd: import.meta.dirname,
        entryPoint: './src/index.css',
        rootFontSize: 16,
      },
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
