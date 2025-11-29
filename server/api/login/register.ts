import { readBody } from 'h3'
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function findUsersPath(createIfMissing = false) {
  const candidates = [
    path.resolve(process.cwd(), 'server/data/user.json'),
    path.resolve(process.cwd(), '.output', 'server', 'server', 'data', 'user.json'),
    path.resolve(process.cwd(), '.output', 'public', 'server', 'data', 'user.json'),
    path.resolve(__dirname, '../../data/user.json')
  ]
  for (const p of candidates) {
    try {
      await fs.stat(p)
      return p
    } catch (e) {
      // continue
    }
  }
  // if allowed, return first candidate to attempt creation
  if (createIfMissing) return candidates[0]
  return path.resolve(process.cwd(), 'server/data/user.json')
}


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, role } = body

  if (!name || !email || !password || !role) {
    return { error: 'register.errors.missing_fields' }
  }

  // Charger les utilisateurs existants
  let users = []
  try {
    // Try to import the JSON so Nitro bundler includes it on serverless (Vercel)
    try {
      // @ts-ignore
      const mod = await import('../../data/user.json', { assert: { type: 'json' } })
      users = mod?.default || mod
      console.debug('[register] loaded users via dynamic import, count=', users.length)
    } catch (importErr) {
      const usersPath = await findUsersPath()
      const data = await fs.readFile(usersPath, 'utf-8')
      users = JSON.parse(data)
    }
  } catch (e) {
    users = []
  }

  // Vérifier si l'email existe déjà
  if (users.some((u: any) => u.email === email)) {
    return { error: 'register.errors.email_exists' }
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
  try {
    const usersPathToWrite = await findUsersPath(true)
    await fs.writeFile(usersPathToWrite, JSON.stringify(users, null, 2), 'utf-8')
  } catch (e) {
    // write failed in production (read-only output). Inform caller.
    return { error: 'register.errors.save_failed' }
  }

  return { user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } }
})
