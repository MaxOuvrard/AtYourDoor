import { readBody } from 'h3'
import { promises as fs } from 'fs'
import path from 'path'

const COMMANDES_PATH = path.resolve(process.cwd(), 'server/data/commandes.json')

export default defineEventHandler(async (event) => {
  const method = event.node.req.method || 'GET'
  if (method === 'GET') {
    try {
      const data = await fs.readFile(COMMANDES_PATH, 'utf-8')
      const commandes = JSON.parse(data)
      return commandes
    } catch (e) {
      return []
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    try {
      const raw = await fs.readFile(COMMANDES_PATH, 'utf-8')
      const commandes = JSON.parse(raw || '[]')
      const now = new Date().toISOString()
      const cmd = {
        id: body.id || Date.now(),
        name: body.name || `Commande ${new Date().toLocaleString()}`,
        userId: body.userId || body.id_user || null,
        id_restaurant: body.id_restaurant || body.idRestaurant || null,
        plats: body.plats || [],
        total: body.total || 0,
        status: body.status || 'pending',
        createdAt: body.createdAt || now,
        updatedAt: now
      }
      commandes.push(cmd)
      await fs.writeFile(COMMANDES_PATH, JSON.stringify(commandes, null, 2), 'utf-8')
      return cmd
    } catch (e:any) {
      return { error: 'Unable to save commande', detail: e?.message }
    }
  }

  return { error: 'Method not allowed' }
})
