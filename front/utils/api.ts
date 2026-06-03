function getApiBase(): string {
  if (typeof window === 'undefined') {
    return process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
  }

  try {
    const config = useRuntimeConfig()
    return config.public?.apiBase || process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
  } catch {
    return process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
  }
}

function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = getApiBase().replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('token') || ''
}

export async function apiFetch<T = any>(path: string, opts?: any): Promise<T | null> {
  const token = getToken()
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  const mergedOpts = {
    ...opts,
    headers: {
      ...authHeader,
      ...(opts?.headers || {}),
    },
  }

  const globalAny: any = globalThis as any

  const requestUrl = resolveApiUrl(path)

  if (typeof globalAny.$fetch === 'function') {
    try {
      return (await globalAny.$fetch(requestUrl, mergedOpts)) as T
    } catch (e: any) {
      throw e instanceof Error ? e : new Error(e?.message || 'Fetch error')
    }
  }

  if (typeof globalAny.fetch !== 'function') {
    throw new Error('No fetch implementation available')
  }

  const { method = 'GET', body, headers = {} } = mergedOpts
  const fetchOptions: any = { method, headers: { ...headers } }

  if (body !== undefined) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      fetchOptions.body = body
    } else {
      fetchOptions.body = JSON.stringify(body)
      fetchOptions.headers['Content-Type'] =
        fetchOptions.headers['Content-Type'] || 'application/json'
    }
  }

  const res = await globalAny.fetch(requestUrl, fetchOptions)
  const text = await res.text()

  if (!text) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return null
  }

  try {
    const json = JSON.parse(text)
    if (!res.ok) {
      const msg = (json && (json.detail || json.error || json.message)) || `HTTP ${res.status}`
      throw new Error(msg)
    }
    return json as T
  } catch (e: any) {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
    return text as unknown as T
  }
}

export default apiFetch
