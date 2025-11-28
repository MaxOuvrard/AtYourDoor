export async function apiFetch<T = any>(path: string, opts?: any): Promise<T | null> {
  const globalAny: any = globalThis as any
  // prefer Nuxt $fetch if available (tests stub global.$fetch)
  if (typeof globalAny.$fetch === 'function') {
    try {
      return (await globalAny.$fetch(path, opts)) as T
    } catch (e: any) {
      throw e instanceof Error ? e : new Error(e?.message || 'Fetch error')
    }
  }

  // fallback to standard fetch
  if (typeof globalAny.fetch !== 'function') {
    throw new Error('No fetch implementation available')
  }

  const { method = 'GET', body, headers = {} } = opts || {}
  const fetchOptions: any = { method, headers: { ...headers } }

  if (body !== undefined) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      fetchOptions.body = body
    } else {
      fetchOptions.body = JSON.stringify(body)
      fetchOptions.headers['Content-Type'] = fetchOptions.headers['Content-Type'] || 'application/json'
    }
  }

  try {
    const res = await globalAny.fetch(path, fetchOptions)
    const text = await res.text()

    if (!text) {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return null
    }

    try {
      const json = JSON.parse(text)
      if (!res.ok) {
        const msg = (json && (json.error || json.message)) || `HTTP ${res.status}`
        throw new Error(msg)
      }
      return json as T
    } catch (e) {
      // Not JSON
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
      return text as unknown as T
    }
  } catch (e: any) {
    throw e instanceof Error ? e : new Error(e?.message || 'Network error')
  }
}

export default apiFetch
