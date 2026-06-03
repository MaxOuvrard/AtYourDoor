import { readRawBody, setResponseStatus } from 'h3'
import { ofetch } from 'ofetch'

const BACKEND = process.env.API_URL || 'http://localhost:3001'

/**
 * Proxifie la requête vers le backend Fastify.
 * Utilisé par tous les handlers server/api/.
 */
export async function proxyToBackend(event: any): Promise<any> {
  const url = event.node.req.url || '/'
  const target = `${BACKEND}${url}`
  const method = (event.method || 'GET') as string

  const headers: Record<string, string> = {}
  const raw = event.node.req.headers
  if (raw.authorization) headers['authorization'] = raw.authorization as string
  if (raw['content-type']) headers['content-type'] = raw['content-type'] as string

  const body = ['GET', 'HEAD', 'OPTIONS'].includes(method)
    ? undefined
    : await readRawBody(event).catch(() => undefined)

  try {
    const res = await ofetch.raw(target, {
      method: method as any,
      headers,
      body: body as any,
      ignoreResponseError: true,
    })
    setResponseStatus(event, res.status, res.statusText)
    return res._data
  } catch (err: any) {
    setResponseStatus(event, 503)
    return {
      statusCode: 503,
      message: 'Backend Fastify indisponible — vérifiez que npm run dev tourne dans fastify-demo/',
    }
  }
}
