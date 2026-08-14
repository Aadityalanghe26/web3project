import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  define: {
    'process.env': {}
  },
  build: {
    // ethers + w3up-client are large libraries; raise the warning threshold
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ethers': ['ethers'],
          'vendor-w3storage': ['@web3-storage/w3up-client'],
        }
      }
    }
  }
});
