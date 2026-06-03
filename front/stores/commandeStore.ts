import { defineStore } from 'pinia'
import { apiFetch } from '../utils/api'
import { mapCommande, mapStatusToBackend } from '../utils/mappers'

export type PlatInCommande = {
  id: string | null
  name: string
  price: number
  quantity?: number
}

export type Commande = {
  id: string | number
  name?: string
  userId?: string
  id_restaurant?: string
  deliveryAddress?: string
  plats: PlatInCommande[]
  total: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export const useCommandeStore = defineStore('commande', {
  state: () => ({
    commandes: (typeof window !== 'undefined' && localStorage.getItem('commandes'))
      ? JSON.parse(localStorage.getItem('commandes') as string) as Commande[]
      : [] as Commande[],
    loading: false as boolean,
    error: '' as string
  }),

  getters: {
    count: (state) => state.commandes.length,
    getById: (state) => (id: string | number) =>
      state.commandes.find(c => String(c.id) === String(id)) || null
  },

  actions: {
    setError(msg: string) { this.error = msg },

    _saveLocal() {
      if (typeof window !== 'undefined')
        localStorage.setItem('commandes', JSON.stringify(this.commandes))
    },

    async fetchCommandes(userRole?: string) {
      this.loading = true
      this.error = ''
      try {
        const endpoint = userRole === 'OWNER'
          ? '/api/restaurants/me/orders'
          : '/api/orders/me'

        const res = await apiFetch(endpoint, { method: 'GET' }).catch(() => null)
        if (res) {
          const list = Array.isArray(res) ? res : ((res as any).data || [])
          this.commandes = list.map(mapCommande).filter(Boolean) as Commande[]
          this._saveLocal()
        }
      } catch (e: any) {
        this.error = e?.message || 'Error while loading orders.'
      } finally {
        this.loading = false
      }
    },

    async createCommande(cmd: Commande & { deliveryAddress?: string }) {
      try {
        const apiPayload = {
          restaurantId: String(cmd.id_restaurant),
          deliveryAddress: cmd.deliveryAddress || 'Not specified',
          items: (cmd.plats || []).map(p => ({
            dishId: String(p.id),
            quantity: p.quantity || 1
          }))
        }

        const res = await apiFetch('/api/orders', { method: 'POST', body: apiPayload })
        if (res) {
          const mapped = mapCommande(res)
          if (mapped) this.commandes.push(mapped as Commande)
        } else {
          this.commandes.push(cmd)
        }
      } catch (e: any) {
        // Fallback local si réseau indisponible
        cmd.id = cmd.id || Date.now()
        this.commandes.push(cmd)
      } finally {
        this._saveLocal()
      }
    },

    async updateCommande(id: string | number, patch: Partial<Commande> & { status?: string }) {
      const idx = this.commandes.findIndex(c => String(c.id) === String(id))
      if (idx === -1) return

      if (patch.status) {
        const backendStatus = mapStatusToBackend(patch.status)
        try {
          const res = await apiFetch(`/api/orders/${id}/status`, {
            method: 'PATCH',
            body: { status: backendStatus }
          })
          if (res) {
            this.commandes[idx] = mapCommande(res) as Commande
          } else {
            this.commandes[idx] = { ...this.commandes[idx], ...patch }
          }
        } catch {
          this.commandes[idx] = { ...this.commandes[idx], ...patch }
        }
      } else {
        this.commandes[idx] = { ...this.commandes[idx], ...patch }
      }
      this._saveLocal()
    },

    async cancelOrder(id: string | number) {
      try {
        await apiFetch(`/api/orders/${id}`, { method: 'DELETE' })
        this.commandes = this.commandes.filter(c => String(c.id) !== String(id))
        this._saveLocal()
      } catch (e: any) {
        this.error = e?.message || 'Erreur lors de l\'annulation.'
        throw e
      }
    },

    async fetchOrderById(id: string | number): Promise<Commande | null> {
      try {
        const res = await apiFetch(`/api/orders/${id}`)
        if (!res) return null
        const mapped = mapCommande(res)
        if (mapped && mapped.id != null) {
          const c = mapped as Commande
          const idx = this.commandes.findIndex(o => String(o.id) === String(id))
          if (idx !== -1) this.commandes[idx] = c
          else this.commandes.push(c)
          this._saveLocal()
          return c
        }
        return null
      } catch {
        return null
      }
    },

    retirerCommande(id: string | number) {
      this.commandes = this.commandes.filter(c => c.id !== id)
      this._saveLocal()
    },

    viderCommandes() {
      this.commandes = []
      if (typeof window !== 'undefined') localStorage.removeItem('commandes')
    }
  }
})
