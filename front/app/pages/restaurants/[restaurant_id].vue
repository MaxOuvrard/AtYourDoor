<script setup lang="ts">
import { computed, watch } from 'vue';
import AppImage from '~/components/AppImage.vue';
import { useSeoMeta } from 'nuxt/app';
import { mapRestaurant, mapPaginatedPlats } from '../../../utils/mappers';
import { apiFetch } from '../../../utils/api';

const router = useRouter();
const route = useRoute();
const restaurantId = String(route.params.restaurant_id);

const { data: rawRestaurant, error: errorRestaurant, refresh: refreshRestaurant } = await useAsyncData(
  `restaurant-${restaurantId}`,
  () => apiFetch(`/api/restaurants/${restaurantId}`),
  { default: () => null }
);

const restaurant = computed(() => mapRestaurant(rawRestaurant.value))

watch(
  () => restaurant.value,
  (resto) => {
    if (resto) {
      useSeoMeta({
        title: `${resto.name} - AtYourDoor`,
        description: `Découvrez ${resto.name} à ${resto.city} et commandez ses meilleurs plats.`,
        ogTitle: `${resto.name} - AtYourDoor`,
        ogImage: resto.image || '/images/home/home_jap.jpg',
        twitterCard: 'summary_large_image'
      });
    }
  },
  { immediate: true }
);

const { data: rawPlats, error: errorPlats, refresh: refreshPlats } = await useAsyncData(
  `dishes-restaurant-${restaurantId}`,
  () => apiFetch(`/api/restaurants/${restaurantId}/dishes?limit=100`),
  { default: () => null }
);

const plats = computed(() => mapPaginatedPlats(rawPlats.value))
</script>

<template>
  <Header />
  <div class="page">

    <!-- Error states -->
    <div v-if="errorRestaurant || errorPlats" class="container" style="padding-top: 20px;">
      <div class="error-banner">
        <span>{{ errorRestaurant ? `Erreur restaurant : ${(errorRestaurant as any)?.message}` : `Erreur plats : ${(errorPlats as any)?.message}` }}</span>
        <div style="display:flex;gap:8px;">
          <button v-if="errorRestaurant" class="btn btn-sm btn-light" @click="() => refreshRestaurant()">Retry</button>
          <button v-if="errorPlats" class="btn btn-sm btn-light" @click="() => refreshPlats()">Retry plats</button>
        </div>
      </div>
    </div>

    <template v-if="restaurant">
      <!-- Hero -->
      <div class="resto-hero">
        <AppImage :src="restaurant.image" :alt="restaurant.name" style="width:100%;height:100%;object-fit:cover;" />
        <div class="resto-hero-overlay">
          <button class="btn btn-ghost btn-sm" style="align-self:flex-start;" @click="router.push('/restaurants')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Retour
          </button>
          <div class="resto-hero-info">
            <h1>{{ restaurant.name }}</h1>
            <p>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ restaurant.city }}
            </p>
            <p v-if="(restaurant as any).description" style="margin-top:6px;font-size:0.88rem;opacity:0.75;">
              {{ (restaurant as any).description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Dishes section -->
      <div class="container" style="padding-top: 36px; padding-bottom: 56px;">
        <h2 class="section-title">Plats disponibles</h2>

        <div v-if="plats.length > 0" class="card-grid">
          <PlatItem v-for="plat in plats" :key="plat.id" :plat="plat" />
        </div>

        <div v-else class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h1l1 9H4L3 2z"/><path d="M7 2h1l.5 9H7L7 2z"/><circle cx="9" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><path d="M4 11h14l-1.5 7H5.5L4 11z"/></svg>
          <h3>Aucun plat disponible</h3>
          <p>Ce restaurant n'a pas encore ajouté de plats.</p>
        </div>
      </div>
    </template>

    <!-- Loading -->
    <div v-else class="container" style="padding: 80px 0; text-align: center; color: var(--text-muted);">
      <div class="spinner" style="width:32px;height:32px;border-color:rgba(69,90,100,0.15);border-top-color:var(--accent);margin:0 auto 16px;"></div>
      <p>Chargement du restaurant…</p>
    </div>

  </div>
</template>
