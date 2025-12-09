import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - load first
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          
          // Heavy map library - only load for admin
          if (id.includes('maplibre-gl')) {
            return 'map-vendor';
          }
          
          // Socket.io - only load when needed
          if (id.includes('socket.io')) {
            return 'socket-vendor';
          }
          
          // UI libraries
          if (id.includes('lucide-react') || 
              id.includes('framer-motion') || 
              id.includes('sonner')) {
            return 'ui-vendor';
          }
          
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          
          // Other vendor libs
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Hashed filenames for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Use terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Disable source maps for production
    sourcemap: false,
    // Target modern browsers
    target: 'es2020',
    // Inline small assets (< 4kb)
    assetsInlineLimit: 4096,
    // CSS minification
    cssMinify: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
