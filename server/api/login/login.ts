import { readBody } from 'h3'
import { promises as fs } from 'fs'
import path from 'path'

const USERS_PATH = path.resolve(process.cwd(), 'server/data/user.json')

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { username, password } = body
    if (!username || !password) {
        return { error: 'Champs manquants.' }
    }
    let users = []
    try {
        const data = await fs.readFile(USERS_PATH, 'utf-8')
        users = JSON.parse(data)
    } catch (e) {
        return { error: 'Erreur serveur.' }
    }
    // username = email
    const user = users.find((u: any) => u.email === username && u.password === password)
    if (!user) {
        return { error: 'Identifiants invalides.' }
    }
    // Générer un token simple (à remplacer par JWT en prod)
    const token = Buffer.from(user.email + Date.now()).toString('base64')
    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
    }
})