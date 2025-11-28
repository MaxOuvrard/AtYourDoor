import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  let form
  try {
    form = await readMultipartFormData(event)
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: 'Formulaire invalide' })
  }
  if (!form) throw createError({ statusCode: 400, statusMessage: 'Formulaire invalide' })

  const fields: Record<string, string> = {}
  let imageFile: any = null
  for (const entry of form) {
    if (entry.type === 'file') imageFile = entry
    else if (typeof entry.name === 'string') {
      if (Buffer.isBuffer(entry.data)) fields[entry.name] = entry.data.toString('utf-8')
      else fields[entry.name] = typeof entry.data === 'string' ? entry.data : String(entry.data)
    }
  }

  const restaurantId = Number(fields.restaurant_id || fields.id)
  if (!restaurantId) throw createError({ statusCode: 400, statusMessage: 'restaurant_id manquant' })

  const restaurantsPath = path.resolve(process.cwd(), 'server/data/restaurants.json')
  const usersPath = path.resolve(process.cwd(), 'server/data/user.json')

  let restaurants = []
  try { restaurants = JSON.parse(await fs.readFile(restaurantsPath, 'utf-8')) } catch { restaurants = [] }

  const idx = restaurants.findIndex((r: any) => r.id === restaurantId)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Restaurant non trouvé' })

  const oldName = restaurants[idx].name

  // Update fields
  restaurants[idx].name = fields.name || restaurants[idx].name
  restaurants[idx].city = fields.city || restaurants[idx].city
  restaurants[idx].category = fields.category || restaurants[idx].category

  // Handle image upload
  if (imageFile) {
    const ext = path.extname(imageFile.filename) || '.png'
    const fileName = `${(fields.name || restaurants[idx].name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}${ext}`
    const imageDir = path.resolve(process.cwd(), 'public/images/restaurants')
    await fs.mkdir(imageDir, { recursive: true })
    const imagePath = path.join(imageDir, fileName)
    await fs.writeFile(imagePath, imageFile.data)
    restaurants[idx].image = `/images/restaurants/${fileName}`
  }

  // Write restaurants
  try {
    await fs.writeFile(restaurantsPath, JSON.stringify(restaurants, null, 2), 'utf-8')
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur lors de la sauvegarde des restaurants' })
  }

  // Update user(s) with role OWNER and matching old restaurant name -> set to new restaurant name
  try {
    let users = JSON.parse(await fs.readFile(usersPath, 'utf-8'))
    const newName = restaurants[idx].name
    let changed = false
    users = users.map((u: any) => {
      if (u.role && u.role.toUpperCase() === 'OWNER' && u.name === oldName) {
        changed = true
        return { ...u, name: newName }
      }
      return u
    })
    if (changed) await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf-8')
  } catch (e) {
    // If user update fails, return a 500 error so client can handle it via store
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur lors de la mise à jour des utilisateurs' })
  }

  return restaurants[idx]
})
