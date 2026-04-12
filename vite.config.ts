import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH ?? '/rln/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Wir nutzen die gebauten dist/-Versionen der Pakete direkt,
      // sodass deren interne @/-Aliase uns nicht stören.
      '@real-life-stack/toolkit': path.resolve(
        __dirname,
        '../../real-life-stack/packages/toolkit/dist/index.js'
      ),
      '@real-life-stack/data-interface/demo-data': path.resolve(
        __dirname,
        '../../real-life-stack/packages/data-interface/dist/src/demo-data.js'
      ),
      '@real-life-stack/data-interface': path.resolve(
        __dirname,
        '../../real-life-stack/packages/data-interface/dist/src/index.js'
      ),
      '@real-life-stack/mock-connector': path.resolve(
        __dirname,
        '../../real-life-stack/packages/mock-connector/dist/index.js'
      ),
      '@real-life/wot-core': path.resolve(
        __dirname,
        '../../web-of-trust/packages/wot-core/dist/index.js'
      ),
    },
  },
})
