<script setup lang="ts">

import type { Restaurant } from "../../modules/restaurant/types";
import { useSeoMeta } from 'nuxt/app';
import useResource from '~/composables/useResource'

useSeoMeta({
  title: 'Restaurants - AtYourDoor',
  description: 'Découvrez la liste des restaurants disponibles sur AtYourDoor et commandez vos plats préférés en quelques clics.',
  ogTitle: 'Restaurants - AtYourDoor',
  ogDescription: 'Trouvez et commandez dans les meilleurs restaurants près de chez vous.',
  ogImage: '/images/home/home_jap.jpg',
  twitterCard: 'summary_large_image'
});

const { data: restaurants, error: restaurantsError, refresh } = await useResource<Restaurant[]>(
  "restaurants",
  () => $fetch<Restaurant[]>('/api/restaurants'),
  []
);

import { ref, computed, defineAsyncComponent } from 'vue';
const RestaurantItem = defineAsyncComponent(() => import('~/components/RestaurantItem.vue'))
const search = ref("");
// Générer dynamiquement les catégories à partir des données
import { computed as vueComputed } from 'vue';
const selectedCategory = ref("");
const categories = vueComputed(() => {
  if (!restaurants.value) return [{ label: "Tous", value: "" }];
  const cats = Array.from(new Set(restaurants.value.map(r => r.category?.toLowerCase()).filter(Boolean)));
  return [
    { label: "Tous", value: "" },
    ...cats.map(cat => ({ label: cat.charAt(0).toUpperCase() + cat.slice(1), value: cat }))
  ];
});
// Filtres supplémentaires
const filters = ref({
  offre: false,
  ticket: false,
  best: false,
});

const filteredRestaurants = computed(() => {
  if (!restaurants.value) return [];
  return restaurants.value.filter(r => {
    const nameStr = typeof r.name === 'string' ? r.name : '';
    const matchName = nameStr.toLowerCase().includes(search.value.toLowerCase());
    const matchCat = !selectedCategory.value || (r.category && typeof r.category === 'string' && r.category.toLowerCase() === selectedCategory.value.valueOf());

    // Simuler les propriétés pour la démo (à adapter selon vos données réelles)
    const hasOffer =  r.id % 2 === 0; // Simule offre en cours sur 1/2
    const takesTicket = r.id % 3 === 0; // Simule ticket restaurant sur 1/3
    const rating = (4 + (r.id % 2) * 0.5); // Simule une note

    const matchOffer = !filters.value.offre || hasOffer;
    const matchTicket = !filters.value.ticket || takesTicket;
    const matchBest = !filters.value.best || rating >= 4.5;

    return matchName && matchCat && matchOffer && matchTicket && matchBest;
  });
});
</script>

<template>
  <Header/>
  <div v-if="restaurantsError" class="fetch-error" style="padding:12px; text-align:center; color:var(--error);">
    <div>Erreur lors du chargement des restaurants : {{ restaurantsError.message || restaurantsError }}</div>
    <button @click="refresh" style="margin-top:8px;">Réessayer</button>
  </div>
  <div class="search-bar-container">
    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
        <line x1="16.018" y1="16.485" x2="20" y2="20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un restaurant..."
      />
    </div>
  </div>
  <div class="category-filters">
    <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
      <button
        v-for="cat in categories"
        :key="cat.value"
        :class="['category-box', { active: selectedCategory === cat.value }]"
        @click="selectedCategory = cat.value"
        type="button"
      >
        {{ cat.label }}
      </button>
    </div>
  </div>
  <div class="extra-filters" style="display: flex; flex-wrap: wrap; gap: 12px; margin: 18px 0 0 0; justify-content: center;">
    <button
      class="category-box extra"
      :class="{ active: filters.offre }"
      @click="filters.offre = !filters.offre"
      type="button"
    >
      Offre en cours
    </button>
    <button
      class="category-box extra"
      :class="{ active: filters.ticket }"
      @click="filters.ticket = !filters.ticket"
      type="button"
    >
      Ticket restaurant
    </button>
    <button
      class="category-box extra"
      :class="{ active: filters.best }"
      @click="filters.best = !filters.best"
      type="button"
    >
      Les mieux notés
    </button>
  </div>
  <h1 style="padding-left: 50px;">Restaurants</h1>
  <ul class="restaurants">
    <RestaurantItem :restaurant="restaurant" v-for="restaurant in filteredRestaurants" :key="restaurant.id">
    </RestaurantItem>
  </ul>
</template>

<style>
/* --- Search Bar Styles --- */
.search-bar-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 30px;
  border: 1px solid #ccc;
  width: 420px;
  padding: 4px 20px;
  /* Suppression de l'ombre et du hover */
  box-shadow: none;
  transition: none;
}

.search-bar svg {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  color: #888;
  flex-shrink: 0;
}

.search-bar input[type="text"] {
  flex: 1;
  padding: 12px 8px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.2rem;
  color: var(--text);
  box-shadow: none;
  transition: none;
}

.search-bar input[type="text"]:focus {
  border: none;
  outline: none;
  box-shadow: none;
}
</style>