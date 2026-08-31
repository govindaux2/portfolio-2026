import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const LAYOUT = path.resolve(process.cwd(), 'src/dev/studio-layout.json')

function empty() {
  return { updated: null, current: {}, snapshots: [] as unknown[] }
}

function readFile() {
  try {
    return JSON.parse(fs.readFileSync(LAYOUT, 'utf8'))
  } catch {
    return empty()
  }
}

export function studioLayoutPlugin(): Plugin {
  return {
    name: 'studio-layout',
    configureServer(server) {
      server.middlewares.use('/__studio', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readFile()))
          return
        }
        if (req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (c) => chunks.push(c as Buffer))
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
                current?: Record<string, unknown>
                snapshot?: boolean
              }
              const prev = readFile() as {
                current: Record<string, unknown>
                snapshots: { at: string; layout: Record<string, unknown> }[]
              }
              const current = body.current ?? prev.current
              const snapshots = [...(prev.snapshots || [])]
              if (body.snapshot) {
                snapshots.push({ at: new Date().toISOString(), layout: current })
                while (snapshots.length > 8) snapshots.shift()
              }
              const next = {
                updated: new Date().toISOString(),
                current,
                snapshots,
              }
              fs.writeFileSync(LAYOUT, `${JSON.stringify(next, null, 2)}\n`)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(next))
            } catch (err) {
              res.statusCode = 400
              res.end(String(err))
            }
          })
          return
        }
        next()
      })
    },
  }
}
