import { readBody } from 'h3'
import fs from 'fs/promises';
import path from 'path';
import { readData, writeData } from '../../utils/jsonStore'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, role } = body

  if (!name || !email || !password || !role) {
    return { error: 'register.errors.missing_fields' }
  }

  // Charger les utilisateurs existants
  let users = []
  try {
    users = await readData('user')
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
    await writeData('user', users)
  } catch (e) {
    // write failed in serverless (Vercel) — inform caller
    return { error: 'register.errors.save_failed', details: String(e) }
  }

  return { user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } }
})
