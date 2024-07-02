import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.render.com/deploy/srv-cq1t9aiju9rs73be6i80?key=zwjJs3Q60E0',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
