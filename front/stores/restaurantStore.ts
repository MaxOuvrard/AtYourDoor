import { defineStore } from 'pinia'
import { useUserStore } from './userStore'
import { apiFetch } from '../utils/api'
import { mapPaginatedRestaurants, mapRestaurant } from '../utils/mappers'
import type { Restaurant } from '../app/modules/restaurant/types'

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    restaurants: [] as Restaurant[],
    loading: false as boolean,
    error: null as string | null,
    success: null as string | null
  }),

  getters: {
    categories: (state) =>
      Array.from(new Set(state.restaurants.map(r => (r as any).category).filter(Boolean))) as string[]
  },

  actions: {
    setRestaurants(restaurants: Restaurant[] | { data?: unknown } | null | undefined) {
      this.restaurants = mapPaginatedRestaurants(restaurants) as Restaurant[]
    },

    addRestaurant(restaurant: Restaurant) {
      this.restaurants.push(restaurant)
    },

    updateRestaurant(updated: Restaurant) {
      const idx = this.restaurants.findIndex(r => r.id === updated.id)
      if (idx !== -1) this.restaurants.splice(idx, 1, updated)
      else this.restaurants.push(updated)
    },

    async saveRestaurant(data: Record<string, any>) {
      this.loading = true
      this.error = null
      this.success = null
      try {
        // PATCH /api/restaurants/me avec JSON (le back attend JSON, pas FormData)
        const payload: Record<string, any> = {}
        if (data.name) payload.name = data.name
        if (data.address) payload.address = data.address
        if (data.description) payload.description = data.description
        if (data.phone) payload.phone = data.phone
        if (data.imageUrl || data.image) payload.imageUrl = data.imageUrl || data.image
        if (data.status) payload.status = data.status

        const res = await apiFetch('/api/restaurants/me', { method: 'PATCH', body: payload })
        if (!res) {
          this.error = 'Empty server response'
          throw new Error(this.error)
        }

        const mapped = mapRestaurant(res)
        if (mapped) this.updateRestaurant(mapped as Restaurant)

        try {
          const userStore = useUserStore()
          if (userStore.user && mapped?.name && userStore.user.name !== mapped.name) {
            userStore.setName(mapped.name)
          }
        } catch {}

        this.success = 'Restaurant updated'
        return res
      } catch (e: any) {
        if (!this.error) this.error = e?.message || 'Error while updating'
        throw e
      } finally {
        this.loading = false
      }
    }
  }
})
