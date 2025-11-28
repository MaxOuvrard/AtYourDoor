import { useAsyncData } from '#app'

type UseResourceOptions = {
  ttl?: number // milliseconds to keep cached data
  swr?: boolean // stale-while-revalidate
} & Record<string, any>

const clientCache = new Map<string, { data: any; expires: number }>()

export function useResource<T>(key: string, fetcher: () => Promise<T>, defaultValue: T, opts?: UseResourceOptions) {
  const { ttl = 0, swr = false, ...rest } = opts || {}

  // Server-side: default behaviour (no client cache)
  if (process.server) {
    return useAsyncData<T>(key, fetcher, {
      server: true,
      lazy: false,
      default: () => defaultValue,
      ...rest
    })
  }

  // Client-side cache handling
  const cached = clientCache.get(key)
  const now = Date.now()

  // If there is a valid cache entry, return it as initial data
  if (cached && (cached.expires === Infinity || cached.expires > now)) {
    const asyncData = useAsyncData<T>(key, fetcher, {
      server: false,
      lazy: false,
      default: () => (cached.data as T) ?? defaultValue,
      ...rest
    })

    if (swr) {
      // revalidate in background and update cache + refresh asyncData
      fetcher()
        .then((fresh) => {
          clientCache.set(key, { data: fresh, expires: ttl ? now + ttl : Infinity })
          asyncData.refresh?.()
        })
        .catch(() => {})

      // revalidate on window focus
      const onFocus = () => {
        fetcher()
          .then((fresh) => {
            clientCache.set(key, { data: fresh, expires: ttl ? Date.now() + ttl : Infinity })
            asyncData.refresh?.()
          })
          .catch(() => {})
      }
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('focus', onFocus)
      }
    }

    return asyncData
  }

  // No valid cache: fetch and populate cache
  return useAsyncData<T>(key, async () => {
    const data = await fetcher()
    clientCache.set(key, { data, expires: ttl ? Date.now() + ttl : Infinity })
    return data
  }, {
    server: false,
    lazy: false,
    default: () => defaultValue,
    ...rest
  })
}

export default useResource
