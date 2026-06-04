<script setup lang="ts">
import { useSeoMeta } from 'nuxt/app';
import { ref, computed, defineAsyncComponent } from 'vue';
import { mapPaginatedRestaurants } from '../../../utils/mappers';
import { apiFetch } from '../../../utils/api';

useSeoMeta({
  title: 'Restaurants - AtYourDoor',
  description: 'Découvrez les meilleurs restaurants disponibles sur AtYourDoor.',
  ogTitle: 'Restaurants - AtYourDoor',
  ogDescription: 'Trouvez et commandez dans les meilleurs restaurants près de chez vous.',
  ogImage: '/images/home/home_jap.jpg',
  twitterCard: 'summary_large_image'
});

const RestaurantItem = defineAsyncComponent(() => import('~/components/RestaurantItem.vue'))

const { data: rawRestaurants, error: restaurantsError, refresh } = await useAsyncData(
  'restaurants',
  () => apiFetch('/api/restaurants?limit=100'),
  { default: () => null }
);

const restaurants = computed(() => mapPaginatedRestaurants(rawRestaurants.value))

const search = ref('');
const selectedCategory = ref('');

const categories = computed(() => {
  const cats = Array.from(new Set(restaurants.value.map((r: any) => r.category).filter(Boolean)));
  return [
    { label: 'Tous', value: '' },
    ...cats.map((cat: any) => ({ label: String(cat).charAt(0).toUpperCase() + String(cat).slice(1), value: cat }))
  ];
});

const filteredRestaurants = computed(() =>
  restaurants.value.filter((r: any) => {
    const matchName = String(r.name || '').toLowerCase().includes(search.value.toLowerCase());
    const matchCat = !selectedCategory.value || String(r.category || '').toLowerCase() === selectedCategory.value;
    return matchName && matchCat;
  })
);
</script>

<template>
  <Header />
  <div class="page restaurants-page">

    <!-- Banner -->
    <div class="page-banner">
      <div class="container">
        <h1>Restaurants</h1>
        <p>Découvrez les meilleurs restaurants près de chez vous</p>
        <div style="margin-top: 20px;">
          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>
            </svg>
            <input v-model="search" type="text" placeholder="Rechercher un restaurant…" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters + grid -->
    <div class="container" style="padding-top: 24px; padding-bottom: 48px;">

      <!-- Error -->
      <div v-if="restaurantsError" class="error-banner">
        <span>Erreur lors du chargement : {{ (restaurantsError as any)?.message || restaurantsError }}</span>
        <button class="btn btn-sm btn-light" @click="() => refresh()">Réessayer</button>
      </div>

      <!-- Category chips -->
      <div class="chips" style="margin-bottom: 20px;">
        <button
          v-for="cat in categories" :key="cat.value"
          :class="['chip', { active: selectedCategory === cat.value }]"
          @click="selectedCategory = cat.value"
          type="button"
        >{{ cat.label }}</button>
      </div>

      <!-- Count -->
      <p class="results-meta" style="margin-bottom: 16px;">
        {{ filteredRestaurants.length }} restaurant{{ filteredRestaurants.length > 1 ? 's' : '' }} trouvé{{ filteredRestaurants.length > 1 ? 's' : '' }}
      </p>

      <!-- Grid -->
      <div v-if="filteredRestaurants.length > 0" class="resto-grid">
        <RestaurantItem
          v-for="restaurant in filteredRestaurants"
          :key="restaurant.id"
          :restaurant="restaurant"
        />
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3>Aucun restaurant trouvé</h3>
        <p>Essayez un autre terme de recherche ou une autre catégorie.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.resto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.results-meta {
  font-size: 0.85rem;
  color: #90A4AE;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 0;
  color: #90A4AE;
  text-align: center;
}
.empty-state h3 { font-size: 1.1rem; font-weight: 600; color: #607D8B; margin: 0; }
.empty-state p  { font-size: 0.88rem; margin: 0; }
.empty-state svg { opacity: 0.4; }

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff3f3;
  border: 1px solid #ffcdd2;
  color: #c62828;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 0.88rem;
}
</style>
