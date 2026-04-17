import federationImport from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const federation = federationImport as unknown as typeof federationImport.default;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'platform_admin_host',
      remotes: {
        platform_admin_login_remote: 'http://localhost:3001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 3000,
  },
});
