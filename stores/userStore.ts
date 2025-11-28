import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: (typeof window !== 'undefined' && localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user') as string) : null,
    token: (typeof window !== 'undefined' && localStorage.getItem('token')) ? localStorage.getItem('token') as string : ''
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    restaurantId: (state) => state.user && state.user.id_restaurant ? state.user.id_restaurant : null
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

    async login(username: string, password: string) {
      const res = await $fetch('/api/login/login', {
        method: 'POST',
        body: { username, password }
      })
      if (res && (res as any).token) {
        this.token = (res as any).token
        if (typeof window !== 'undefined') localStorage.setItem('token', this.token)
      }
      if (res && (res as any).user) {
        this.user = (res as any).user
        if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(this.user))
      }
      return res
    },

    async register(name: string, email: string, password: string, role: string) {
      const res = await $fetch('/api/login/register', {
        method: 'POST',
        body: { name, email, password, role }
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
    }
    ,

    async update({ email, name, password }: { email: string, name: string, password: string }) {
      const res = await $fetch('/api/profile/update', {
        method: 'POST',
        body: { email, name, password },
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      })
      // Check if res has a 'user' property before accessing it
      if (res && typeof res === 'object' && 'user' in res) {
        this.user = (res as any).user
        if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify((res as any).user))
      }
      return res
    }
  }
})
