import { defineConfig } from 'eslint/config';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import baseConfig from './base.mjs';

/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
  baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    extends: [
      reactPlugin.configs.flat['recommended'],
      reactPlugin.configs.flat['jsx-runtime'],
      reactHooks.configs.flat['recommended'],
      reactRefresh.configs['vite'],
    ],
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react/prop-types': 'off',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            'Redirect',
            'NotFound',
            {
              from: 'package',
              package: '@tanstack/react-router',
              name: 'Redirect',
            },
            {
              from: 'package',
              package: '@tanstack/react-router',
              name: 'NotFound',
            },
          ],
        },
      ],
    },
  },
]);
