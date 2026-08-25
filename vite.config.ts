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
      output: {
        // Recharts and its d3 helpers are by far the heaviest dependency and
        // change rarely — their own chunk stays cached across app updates.
        advancedChunks: {
          groups: [
            { name: 'charts', test: /node_modules\/(recharts|d3-|victory-)/ },
            { name: 'vendor', test: /node_modules\/(react|react-dom|scheduler|papaparse|fflate)\// },
          ],
        },
      },
    },
  },
  test: { include: ['src/**/*.test.ts'] },
})
