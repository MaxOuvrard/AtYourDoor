import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../../stores/userStore'

export type WSOrderNotif = {
  orderId: string
  totalPrice: number
  itemCount: number
  createdAt: string
}

function getWsUrl(): string {
  // Forcer 127.0.0.1 pour éviter que Docker intercepte via ::1 (localhost)
  const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:3000'
  const wsBase = apiBase.replace(/^https?/, (p) => (p === 'https' ? 'wss' : 'ws'))
  return `${wsBase}/ws/restaurant`
}

export function useRestaurantWS(onNewOrder: (notif: WSOrderNotif) => void) {
  const connected = ref(false)
  const wsError = ref('')
  let ws: WebSocket | null = null
  let pingInterval: ReturnType<typeof setInterval> | null = null

  const userStore = useUserStore()

  function connect() {
    if (typeof window === 'undefined') return
    const token = userStore.token
    if (!token) return

    const wsUrl = getWsUrl()

    try {
      ws = new WebSocket(wsUrl)
    } catch {
      wsError.value = 'Impossible d\'ouvrir la connexion WebSocket.'
      return
    }

    ws.onopen = () => {
      ws?.send(JSON.stringify({ event: 'authenticate', token }))
      pingInterval = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ event: 'ping' }))
        }
      }, 30_000)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.event === 'connected') {
          connected.value = true
          wsError.value = ''
        } else if (msg.event === 'new-order') {
          onNewOrder(msg.data as WSOrderNotif)
        }
      } catch {}
    }

    ws.onerror = () => {
      wsError.value = 'Erreur de connexion WebSocket.'
    }

    ws.onclose = () => {
      connected.value = false
      if (pingInterval) clearInterval(pingInterval)
    }
  }

  function disconnect() {
    if (pingInterval) clearInterval(pingInterval)
    ws?.close()
    ws = null
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { connected, wsError }
}
