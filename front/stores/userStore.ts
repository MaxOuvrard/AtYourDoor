import { defineStore } from 'pinia'
import { apiFetch } from '../utils/api'
import { mapUser } from '../utils/mappers'

interface User {
  id: string
  name: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  phone?: string
  id_restaurant?: string | null
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: ''
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    restaurantId: (state) => state.user?.id_restaurant ?? null
  },

  actions: {
    initUserFromStorage() {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        this.user = user ? JSON.parse(user) : null
        this.token = token || ''
      }
    },

    _persist(token: string, user: any) {
      this.token = token
      this.user = user
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      }
    },

    async login(email: string, password: string) {
      const res = await apiFetch<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      if (res?.token) {
        const mappedUser = mapUser(res.user)
        this._persist(res.token, mappedUser)
      }
      return res
    },

    async register(name: string, email: string, password: string, _role: string) {
      const res = await apiFetch<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: { email, password, firstName: name }
      })
      return res
    },

    logout() {
      this.user = null
      this.token = ''
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        window.location.href = '/'
      }
    },

    async update({ email, name, password }: { email: string; name: string; password: string }) {
      const body: Record<string, string> = {}
      if (name) body.firstName = name
      if (email) body.email = email
      if (password) body.password = password

      const res = await apiFetch<any>('/api/users/me', { method: 'PATCH', body })
      if (res) {
        const mappedUser = mapUser(res)
        this.user = mappedUser
        if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(mappedUser))
      }
      return res
    },

    async deleteAccount() {
      await apiFetch('/api/users/me', { method: 'DELETE' })
      this.logout()
    },

    setName(name: string) {
      if (!this.user) return
      this.user.name = name
      if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(this.user))
    }
  }
})
