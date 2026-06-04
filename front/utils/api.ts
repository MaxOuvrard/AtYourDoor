
function getApiBase(): string {
  // 127.0.0.1 force IPv4 et évite que Docker intercepte via ::1 (localhost)
  return process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:3000'
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

async function doFetch<T>(url: string, opts: any): Promise<T | null> {
  const globalAny: any = globalThis as any

  if (typeof globalAny.$fetch === 'function') {
    return (await globalAny.$fetch(url, opts)) as T
  }

  if (typeof globalAny.fetch !== 'function') {
    throw new Error('No fetch implementation available')
  }

  const { method = 'GET', body, headers = {} } = opts
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

  const res = await globalAny.fetch(url, fetchOptions)
  const text = await res.text()

  if (!text) {
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { statusCode: res.status })
    return null
  }

  const json = JSON.parse(text)
  if (!res.ok) {
    const msg = (json && (json.detail || json.error || json.message)) || `HTTP ${res.status}`
    throw Object.assign(new Error(msg), { statusCode: res.status })
  }
  return json as T
}

let _refreshing: Promise<boolean> | null = null

export async function apiFetch<T = any>(path: string, opts?: any, _retry = false): Promise<T | null> {
  const token = getToken()
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  const mergedOpts = {
    ...opts,
    headers: { ...authHeader, ...(opts?.headers || {}) },
  }

  const requestUrl = resolveApiUrl(path)

  try {
    return await doFetch<T>(requestUrl, mergedOpts)
  } catch (e: any) {
    const status = e?.statusCode ?? e?.response?.status ?? e?.status
    // Auto-refresh sur 401, sauf si c'est déjà la route refresh/logout
    if (status === 401 && !_retry && !path.includes('/auth/refresh') && !path.includes('/auth/logout')) {
      if (!_refreshing) {
        _refreshing = (async () => {
          try {
            const { useUserStore } = await import('../stores/userStore')
            const store = useUserStore()
            return await store.refresh()
          } finally {
            _refreshing = null
          }
        })()
      }
      const refreshed = await _refreshing
      if (refreshed) {
        return apiFetch<T>(path, opts, true)
      }
    }
    throw e instanceof Error ? e : new Error(e?.message || 'Fetch error')
  }
}

export default apiFetch
