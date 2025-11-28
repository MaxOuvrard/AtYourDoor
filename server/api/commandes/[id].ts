import { readBody } from 'h3'
import { promises as fs } from 'fs'
import path from 'path'

const COMMANDES_PATH = path.resolve(process.cwd(), 'server/data/commandes.json')

export default defineEventHandler(async (event) => {
  const method = event.node.req.method || 'GET'
  const idParam = event.context.params?.id

  if (!idParam) return { error: 'Missing id' }

  try {
    const raw = await fs.readFile(COMMANDES_PATH, 'utf-8')
    const commandes = JSON.parse(raw || '[]')

    const id = isNaN(Number(idParam)) ? idParam : Number(idParam)
    const idx = commandes.findIndex((c: any) => String(c.id) === String(id))
    if (idx === -1) return { error: 'Commande not found', status: 404 }

    if (method === 'GET') {
      return commandes[idx]
    }

    if (method === 'PUT' || method === 'PATCH') {
      const body = await readBody(event)
      const now = new Date().toISOString()
      const updated = { ...commandes[idx], ...body, updatedAt: now }
      commandes[idx] = updated
      await fs.writeFile(COMMANDES_PATH, JSON.stringify(commandes, null, 2), 'utf-8')
      return updated
    }

    if (method === 'DELETE') {
      commandes.splice(idx, 1)
      await fs.writeFile(COMMANDES_PATH, JSON.stringify(commandes, null, 2), 'utf-8')
      return { success: true }
    }

    return { error: 'Method not allowed', status: 405 }
  } catch (e: any) {
    return { error: 'Unable to process request', detail: e?.message }
  }
})
