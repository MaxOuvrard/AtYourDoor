import { readBody } from 'h3'
import { promises as fs } from 'fs'
import path from 'path'
import { readData, writeData } from '../../utils/jsonStore'

const COMMANDES_PATH = path.resolve(process.cwd(), 'server/data/commandes.json')

export default defineEventHandler(async (event) => {
  const method = event.node.req.method || 'GET'
  if (method === 'GET') {
    try {
      const commandes = await readData('commandes')
      return commandes
    } catch (e) {
      return []
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    try {
      const commandes = await readData('commandes') || []
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
      try {
        await writeData('commandes', commandes)
        return cmd
      } catch (e:any) {
        return { error: 'Writes disabled on this deployment' }
      }
    } catch (e:any) {
      return { error: 'Unable to read commandes', detail: e?.message }
    }
  }

  return { error: 'Method not allowed' }
})
