import fs from 'fs/promises'
import path from 'path'

function candidatesFor(name: string) {
  const projectRoot = process.cwd()
  return [
    path.resolve(projectRoot, 'server', 'data', `${name}.json`),
    path.resolve(projectRoot, '.output', 'server', 'data', `${name}.json`),
    path.resolve(projectRoot, '.output', 'server', 'server', 'data', `${name}.json`),
    path.resolve(projectRoot, '.output', 'public', 'server', 'data', `${name}.json`),
    // fallback: attempt to read from project root data folder
    path.resolve(projectRoot, 'server', 'data', `${name}.json`)
  ]
}

export async function readData(name: 'user' | 'restaurants' | 'plats' | 'commandes') {
  // Try static/dynamic import first so bundlers (Vercel) include the JSON in the function
  try {
    switch (name) {
      case 'user': {
        // @ts-ignore
        const mod = await import('../data/user.json', { assert: { type: 'json' } })
        return mod?.default || mod
      }
      case 'restaurants': {
        // @ts-ignore
        const mod = await import('../data/restaurants.json', { assert: { type: 'json' } })
        return mod?.default || mod
      }
      case 'plats': {
        // @ts-ignore
        const mod = await import('../data/plats.json', { assert: { type: 'json' } })
        return mod?.default || mod
      }
      case 'commandes': {
        // @ts-ignore
        const mod = await import('../data/commandes.json', { assert: { type: 'json' } })
        return mod?.default || mod
      }
    }
  } catch (e) {
    // ignore and fallback to filesystem
  }

  const cands = candidatesFor(name)
  for (const p of cands) {
    try {
      const raw = await fs.readFile(p, 'utf-8')
      return JSON.parse(raw)
    } catch (_) {
      // try next
    }
  }

  return []
}

export async function writeData(name: 'user' | 'restaurants' | 'plats' | 'commandes', data: any) {
  // On Vercel (serverless) the filesystem is not writable/persistent. Deny writes explicitly.
  if (process.env.VERCEL === '1' || process.env.NITRO_PRESET === 'vercel') {
    throw new Error('writes_not_supported_in_serverless')
  }

  const target = path.resolve(process.cwd(), 'server', 'data', `${name}.json`)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, JSON.stringify(data, null, 2), 'utf-8')
}
