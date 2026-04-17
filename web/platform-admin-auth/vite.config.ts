import federationImport from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const federation = federationImport as unknown as typeof federationImport.default;

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'platform_admin_login_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    cors: true,
    port: 3001,
  },
});
