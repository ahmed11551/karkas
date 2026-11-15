import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, '.') },
        // Lottie is only rendered as SVG and the JSON has no expressions, so the light
        // build is enough. It drops the expression engine (direct eval), which the
        // strict CSP would block anyway, and cuts the vendor-lottie chunk.
        {
          find: /^lottie-web(\/build\/player\/lottie_svg\.js)?$/,
          replacement: path.resolve(__dirname, 'node_modules/lottie-web/build/player/lottie_light.js'),
        },
      ],
    },
    build: {
      target: 'es2020',
      cssMinify: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('lottie-react') || id.includes('lottie-web')) {
                return 'vendor-lottie';
              }
              if (id.includes('gsap') || id.includes('lenis') || id.includes('motion')) {
                return 'vendor-animation';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
            }
            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
