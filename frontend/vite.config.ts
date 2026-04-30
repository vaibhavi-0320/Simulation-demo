import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const projectRoot = path.resolve(process.cwd());
const PORT = Number(process.env.PORT || process.env.APP_PORT || 3000);

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
  })],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        proxyTimeout: 120000,
        timeout: 120000
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-markdown', 'lucide-react', 'motion/react'],
  },
});
