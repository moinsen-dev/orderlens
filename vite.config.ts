/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // Recharts is by far the heaviest dependency and changes rarely — its own
      // chunk keeps it cached across app updates.
      output: { manualChunks: { charts: ['recharts'], vendor: ['react', 'react-dom', 'papaparse', 'fflate'] } },
    },
  },
  test: { include: ['src/**/*.test.ts'] },
})
