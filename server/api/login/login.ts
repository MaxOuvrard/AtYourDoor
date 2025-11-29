import { readBody } from 'h3'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function findUsersPath() {
    const candidates = [
        path.resolve(process.cwd(), 'server/data/user.json'),
        path.resolve(process.cwd(), '.output', 'server', 'data', 'user.json'),
        path.resolve(process.cwd(), '.output', 'server', 'server', 'data', 'user.json'),
        path.resolve(process.cwd(), '.output', 'public', 'server', 'data', 'user.json'),
        path.resolve(process.cwd(), '.output', 'public', 'data', 'user.json'),
        path.resolve(__dirname, '../../data/user.json'),
        path.resolve(__dirname, '../data/user.json')
    ]

    // try each candidate and return the first existing one
    for (const p of candidates) {
        try {
            await fs.stat(p)
            return p
        } catch (e) {
            // continue
        }
    }

    // fallback to original path (will likely fail and be handled by caller)
    return path.resolve(process.cwd(), 'server/data/user.json')
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { username, password } = body
    if (!username || !password) {
        return { error: 'login.errors.missing_fields' }
    }
    let users = []
    try {
        // First try: dynamic import of the JSON so Nitro/Vercel bundler can include it in the server bundle
        try {
            // @ts-ignore - dynamic JSON import with assertion
            const mod = await import('../../data/user.json', { assert: { type: 'json' } })
            users = mod?.default || mod
            console.debug('[login] loaded users via dynamic import, count=', users.length)
        } catch (importErr) {
            // Fallback: try reading from one of the discovered file system paths
            const usersPath = await findUsersPath()
            console.debug('[login] using usersPath:', usersPath)
            const data = await fs.readFile(usersPath, 'utf-8')
            users = JSON.parse(data)
        }
    } catch (e: unknown) {
        // Log error for debugging in preview/build
        // eslint-disable-next-line no-console
        console.error('[login] failed reading users file', e)
        const details = (e && typeof e === 'object' && 'message' in e) ? (e as any).message : String(e)
        return { error: 'login.errors.server', details }
    }
    // username = email
    const user = users.find((u: any) => u.email === username && u.password === password)
    if (!user) {
        return { error: 'login.errors.invalid_credentials' }
    }
    // Générer un token simple (à remplacer par JWT en prod)
    const token = Buffer.from(user.email + Date.now()).toString('base64')
    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
    }
})