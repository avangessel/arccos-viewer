import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('leaflet')) return 'leaflet';
            if (id.includes('react-dom') || id.includes('react')) return 'react-vendor';
          }
        }
      }
    }
  }
});
