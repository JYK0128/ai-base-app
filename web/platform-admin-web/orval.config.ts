import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: process.env.SWAGGER_URL!,
    output: {
      mode: 'split',
      target: 'src/api/generated/endpoints.ts',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: {
          path: './src/lib/axios.ts',
        },
      },
    },
  },

  zod: {
    input: process.env.SWAGGER_URL!,
    output: {
      client: 'zod',
      mode: 'single',
      target: 'src/api/zod.ts',
    },
  },
});
