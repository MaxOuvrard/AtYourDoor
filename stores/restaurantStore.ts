import { defineStore } from 'pinia'
import type { Restaurant } from '../app/modules/restaurant/types'

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    restaurants: [] as Restaurant[]
  }),
  actions: {
    setRestaurants(restaurants: Restaurant[]) {
      this.restaurants = restaurants
    },
    addRestaurant(restaurant: Restaurant) {
      this.restaurants.push(restaurant)
    }
  }
})
