import { defineStore } from 'pinia'
import { useUserStore } from './userStore'
import type { Restaurant } from '../app/modules/restaurant/types'

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    restaurants: [] as Restaurant[],
    loading: false as boolean,
    error: null as string | null,
    success: null as string | null
  }),
  getters: {
    categories: (state) => Array.from(new Set(state.restaurants.map(r => (r as any).category).filter(Boolean))) as string[]
  },
  actions: {
    setRestaurants(restaurants: Restaurant[]) {
      this.restaurants = restaurants
    },
    addRestaurant(restaurant: Restaurant) {
      this.restaurants.push(restaurant)
    }
    ,
    updateRestaurant(updated: Restaurant) {
      const idx = this.restaurants.findIndex(r => r.id === updated.id)
      if (idx !== -1) {
        // Replace the existing restaurant
        this.restaurants.splice(idx, 1, updated)
      } else {
        this.restaurants.push(updated)
      }
    }
    ,
    async saveRestaurant(form: FormData) {
      this.loading = true
      this.error = null
      this.success = null
      try {
        const res = await $fetch('/api/restaurants/update', {
          method: 'POST',
          body: form
        })

        // If API returned an error object
        if (!res) {
          this.error = 'Réponse vide du serveur'
          throw new Error(this.error)
        }
        if ((res as any).error) {
          this.error = (res as any).error || 'Erreur serveur'
          throw new Error(this.error)
        }

        // Mettre à jour localement le store
        this.updateRestaurant(res as Restaurant)

        // Mettre à jour le store utilisateur si nécessaire
        try {
          const userStore = useUserStore()
          if (userStore.user && userStore.user.name !== (res as any).name) {
            if (typeof (userStore as any).setName === 'function') {
              (userStore as any).setName((res as any).name)
            } else {
              userStore.user.name = (res as any).name
              if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(userStore.user))
            }
          }
        } catch (e) {
          // ignore local update errors
        }

        this.success = 'Restaurant mis à jour'
        return res
      } catch (e: any) {
        // Normalize error
        if (!this.error) this.error = e?.message || 'Erreur lors de la mise à jour'
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
