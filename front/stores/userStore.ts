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
    token: '',
    refreshToken: ''
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
        const refreshToken = localStorage.getItem('refreshToken')
        this.user = user ? JSON.parse(user) : null
        this.token = token || ''
        this.refreshToken = refreshToken || ''
      }
    },

    _persist(token: string, user: any, refreshToken?: string) {
      this.token = token
      this.user = user
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        if (refreshToken) {
          this.refreshToken = refreshToken
          localStorage.setItem('refreshToken', refreshToken)
        }
      }
    },

    async refresh(): Promise<boolean> {
      const rt = this.refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null)
      if (!rt) return false
      try {
        const res = await apiFetch<{ token: string; refreshToken: string }>('/api/auth/refresh', {
          method: 'POST',
          body: { refreshToken: rt }
        })
        if (res?.token) {
          this.token = res.token
          this.refreshToken = res.refreshToken
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', res.token)
            localStorage.setItem('refreshToken', res.refreshToken)
          }
          return true
        }
      } catch {
        this.logout()
      }
      return false
    },

    async login(email: string, password: string) {
      const res = await apiFetch<{ token: string; refreshToken: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      if (res?.token) {
        this.token = res.token
        if (typeof window !== 'undefined') localStorage.setItem('token', res.token)
        let userData = res.user
        if (!userData) {
          userData = await apiFetch<any>('/api/users/me')
        }
        const mappedUser = mapUser(userData)
        this._persist(res.token, mappedUser, res.refreshToken)
      }
      return res
    },

    async register(name: string, email: string, password: string, _role: string) {
      const res = await apiFetch<{ token: string; refreshToken: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: { email, password, firstName: name }
      })
      if (res?.token) {
        let userData = res.user
        if (!userData) userData = await apiFetch<any>('/api/users/me')
        const mappedUser = mapUser(userData)
        this._persist(res.token, mappedUser, res.refreshToken)
      }
      return res
    },

    async logout() {
      const rt = this.refreshToken
      this.user = null
      this.token = ''
      this.refreshToken = ''
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
      if (rt) {
        apiFetch('/api/auth/logout', { method: 'POST', body: { refreshToken: rt } }).catch(() => {})
      }
      if (typeof window !== 'undefined') window.location.href = '/'
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
