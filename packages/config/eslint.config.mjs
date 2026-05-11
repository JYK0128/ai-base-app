import { defineConfig } from 'eslint/config';

import baseConfig from './eslint/base.js';

export default defineConfig([
  baseConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
