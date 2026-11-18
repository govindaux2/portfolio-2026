import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { studioLayoutPlugin } from './vite-studio-plugin.ts'
import { flowSyncPlugin } from './vite-flow-sync-plugin.ts'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const previewDir = path.join(rootDir, 'preview')

const PREVIEW_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

/** Serve repo `preview/` at `/preview` during `npm run dev`. */
function previewStaticPlugin(): Plugin {
  return {
    name: 'preview-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith('/preview/')) return next()
        let rel = decodeURIComponent(url.slice('/preview/'.length))
        if (!rel || rel.includes('..')) return next()
        let file = path.join(previewDir, rel)
        if (!file.startsWith(previewDir)) return next()
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
          file = path.join(file, 'index.html')
        }
        if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return next()
        res.setHeader('Content-Type', PREVIEW_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), studioLayoutPlugin(), flowSyncPlugin(), previewStaticPlugin()],
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
