import { readBody } from 'h3'
import fs from 'fs/promises'
import path from 'path'

async function findUsersPath() {
    const projectRoot = process.cwd()
    const candidates = [
        path.resolve(projectRoot, 'server', 'data', 'user.json'),
        path.resolve(projectRoot, '.output', 'server', 'data', 'user.json'),
        path.resolve(projectRoot, '.output', 'server', 'server', 'data', 'user.json'),
        path.resolve(projectRoot, '.output', 'public', 'server', 'data', 'user.json'),
        path.resolve(projectRoot, '.output', 'public', 'data', 'user.json'),
        path.resolve(projectRoot, 'server', 'data', 'user.json')
    ]

    for (const p of candidates) {
        try {
            await fs.stat(p)
            return p
        } catch (e) {
            // continue
        }
    }

    // fallback to original path (will likely fail and be handled by caller)
    return path.resolve(projectRoot, 'server', 'data', 'user.json')
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