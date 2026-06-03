const BACKEND = process.env.API_URL || 'http://localhost:3001'

/**
 * Proxy vers le backend Fastify.
 * Intercepte toutes les requêtes /api/* avant les handlers server/api/.
 */
export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ''

  // N'intercepte que les appels API
  if (!url.startsWith('/api/')) return

  const target = `${BACKEND}${url}`

  const method = event.method
  const isWrite = !['GET', 'HEAD', 'OPTIONS'].includes(method)

  const reqHeaders: Record<string, string> = {}
  const raw = event.node.req.headers
  if (raw.authorization) reqHeaders.authorization = raw.authorization as string
  if (raw['content-type']) reqHeaders['content-type'] = raw['content-type'] as string

  try {
    const body = isWrite ? await readRawBody(event).catch(() => undefined) : undefined

    const res = await $fetch.raw(target, {
      method: method as any,
      headers: reqHeaders,
      body,
      ignoreResponseError: true,
    })

    setResponseStatus(event, res.status, res.statusText)
    return res._data
  } catch (err: any) {
    // Backend inaccessible → laisse passer au handler Nuxt suivant
    console.error(`[api-proxy] Cannot reach ${target}:`, err?.message)
    return createError({ statusCode: 503, message: 'Backend indisponible' })
  }
})
