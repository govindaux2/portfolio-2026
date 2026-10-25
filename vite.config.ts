import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { studioLayoutPlugin } from './vite-studio-plugin.ts'
import { flowSyncPlugin } from './vite-flow-sync-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), studioLayoutPlugin(), flowSyncPlugin()],
  resolve: {
    alias: {
      framer: fileURLToPath(new URL('./src/framer/shim/framer.ts', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
