import { readBody } from 'h3'
import fs from 'fs/promises';
import path from 'path';

const USERS_PATH = path.resolve(process.cwd(), 'server/data/user.json')


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, role } = body

  if (!name || !email || !password || !role) {
    return { error: 'Tous les champs sont obligatoires.' }
  }

  // Charger les utilisateurs existants
  let users = []
  try {
    const data = await fs.readFile(USERS_PATH, 'utf-8')
    users = JSON.parse(data)
  } catch (e) {
    users = []
  }

  // Vérifier si l'email existe déjà
  if (users.some((u: any) => u.email === email)) {
    return { error: 'Cet email est déjà utilisé.' }
  }

  // Créer le nouvel utilisateur
  const newUser = {
    id: Date.now(),
    name,
    email,
    password, // En prod, il faut hasher le mot de passe !
    role
  }
  users.push(newUser)

  // Sauvegarder
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8')

  return { user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } }
})
