import nestConfig from '@pkg/config/eslint/nest';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  nestConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
