import { defineStore } from 'pinia'
import { apiFetch } from '../utils/api'

export type PlatInCommande = {
  id: number | null
  name: string
  price: number
  quantity?: number
}

export type Commande = {
  id: number | string
  name?: string
  userId?: number | string
  id_restaurant?: number | string
  plats: PlatInCommande[]
  total: number
  status?: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'
  createdAt?: string
  updatedAt?: string
}

export const useCommandeStore = defineStore('commande', {
  state: () => ({
    commandes: (typeof window !== 'undefined' && localStorage.getItem('commandes')) ? JSON.parse(localStorage.getItem('commandes') as string) as Commande[] : [] as Commande[],
    loading: false as boolean,
    error: '' as string
  }),
  getters: {
    count: (state) => state.commandes.length,
    getById: (state) => (id: number | string) => state.commandes.find(c => c.id === id) || null
  },
  actions: {
    setError(msg: string) {
      this.error = msg
    },
    async fetchCommandes() {
      this.loading = true
      this.error = ''
      try {
        // Utilise l'API server si disponible
        const res = await apiFetch('/api/commandes', { method: 'GET' }).catch(() => null)
        if (res && Array.isArray(res)) {
          // merge any locally created commandes (offline) that are not yet on server
          const serverCmds = res as Commande[]
          const localRaw = (typeof window !== 'undefined' && localStorage.getItem('commandes')) ? JSON.parse(localStorage.getItem('commandes') as string) as Commande[] : [] as Commande[]
          // try to POST local-only commandes to server
          for (const lc of localRaw) {
            const existsOnServer = serverCmds.some(sc => String(sc.id) === String(lc.id))
            if (!existsOnServer) {
              try {
                const posted = await apiFetch('/api/commandes', { method: 'POST', body: lc }).catch(() => null)
                if (posted && (posted as any).id) {
                  serverCmds.push(posted as Commande)
                } else {
                  // keep local if posting failed
                  serverCmds.push(lc)
                }
              } catch (e) {
                serverCmds.push(lc)
              }
            }
          }
          this.commandes = serverCmds
          if (typeof window !== 'undefined') localStorage.setItem('commandes', JSON.stringify(this.commandes))
        }
      } catch (e: any) {
        this.error = e?.message || 'Erreur lors du chargement des commandes.'
      } finally {
        this.loading = false
      }
    },
    ajouterCommande(cmd: Commande) {
      // assign id if absent
      if (!cmd.id) cmd.id = Date.now()
      this.commandes.push(cmd)
      if (typeof window !== 'undefined') localStorage.setItem('commandes', JSON.stringify(this.commandes))
    },
    async createCommande(cmd: Commande) {
      // try to post to server, otherwise fall back to local
      try {
        const res = await apiFetch('/api/commandes', { method: 'POST', body: cmd }).catch(() => null)
        if (res && (res as any).id) {
          // server returned commande
          this.commandes.push(res as Commande)
        } else {
          // fallback local
          this.ajouterCommande(cmd)
        }
      } catch (e:any) {
        this.ajouterCommande(cmd)
      } finally {
        if (typeof window !== 'undefined') localStorage.setItem('commandes', JSON.stringify(this.commandes))
      }
    },
    async updateCommande(id: number | string, patch: Partial<Commande>) {
      const idx = this.commandes.findIndex(c => String(c.id) === String(id))
      if (idx === -1) return
      // try to persist to server
      try {
        const res = await apiFetch(`/api/commandes/${id}`, { method: 'PUT', body: patch }).catch(() => null)
        if (res && (res as any).id) {
          // replace with authoritative server response
          this.commandes[idx] = res as Commande
        } else {
          // fallback to local merge
          this.commandes[idx] = { ...this.commandes[idx], ...patch, updatedAt: new Date().toISOString() }
        }
      } catch (e:any) {
        // network or other error -> apply locally
        this.commandes[idx] = { ...this.commandes[idx], ...patch, updatedAt: new Date().toISOString() }
      } finally {
        if (typeof window !== 'undefined') localStorage.setItem('commandes', JSON.stringify(this.commandes))
      }
    },
    retirerCommande(id: number | string) {
      this.commandes = this.commandes.filter(c => c.id !== id)
      if (typeof window !== 'undefined') localStorage.setItem('commandes', JSON.stringify(this.commandes))
    },
    viderCommandes() {
      this.commandes = []
      if (typeof window !== 'undefined') localStorage.removeItem('commandes')
    }
  }
})
