import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Plugin } from 'vite'

const FILE = path.resolve(process.cwd(), 'src/flow/sync/workflows.json')

type Store = { updated: string | null; workflows: unknown[] }

function empty(): Store {
  return { updated: null, workflows: [] }
}

function readStore(): Store {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Store
    return {
      updated: raw.updated ?? null,
      workflows: Array.isArray(raw.workflows) ? raw.workflows : [],
    }
  } catch {
    return empty()
  }
}

function writeStore(workflows: unknown[]): Store {
  const next: Store = {
    updated: new Date().toISOString(),
    workflows,
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  fs.writeFileSync(FILE, `${JSON.stringify(next)}\n`)
  return next
}

function lanIPs() {
  const nets = os.networkInterfaces()
  const ips: string[] = []
  for (const addrs of Object.values(nets)) {
    for (const addr of addrs ?? []) {
      const v4 = addr.family === 'IPv4'
      if (!v4 || addr.internal) continue
      ips.push(addr.address)
    }
  }
  const rank = (ip: string) =>
    ip.startsWith('192.168.') ? 0 : ip.startsWith('10.') ? 1 : 2
  return [...new Set(ips)].sort((a, b) => rank(a) - rank(b))
}

function readBody(req: { on: (ev: string, fn: (c: Buffer) => void) => void }) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function flowSyncPlugin(): Plugin {
  return {
    name: 'flow-sync',
    configureServer(server) {
      const port = server.config.server.port || 5173
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (url === '/__flow/meta' || url === '/__flow/meta/') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ port, ips: lanIPs() }))
          return
        }
        if (url !== '/__flow' && url !== '/__flow/') {
          next()
          return
        }
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readStore()))
          return
        }
        if (req.method === 'POST') {
          void readBody(req)
            .then((raw) => {
              const body = JSON.parse(raw) as { workflows?: unknown[] }
              const workflows = Array.isArray(body.workflows) ? body.workflows : []
              const next = writeStore(workflows)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(next))
            })
            .catch((err) => {
              res.statusCode = 400
              res.end(String(err))
            })
          return
        }
        next()
      })
    },
  }
}
