import reactConfig from '@pkg/config/eslint/react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  reactConfig,
  {
    ignores: ['src/api/**'],
  },
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
