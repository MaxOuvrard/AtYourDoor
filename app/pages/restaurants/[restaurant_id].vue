<script setup lang="ts">
import { computed, watch } from "vue";
import { defineAsyncComponent } from 'vue'
import AppImage from '~/components/AppImage.vue'
import type { Restaurant } from "~/modules/restaurant/types";
import type { Plat } from "~/modules/plat/types";
import useResource from '~/composables/useResource'
import "~/assets/css/style.css";

import { useSeoMeta } from 'nuxt/app';

const router = useRouter();

const route = useRoute();
const restaurantId = Number(route.params.restaurant_id);


const { data: restaurant, pending: pendingRestaurant, error: errorRestaurant, refresh: refreshRestaurant } = await useResource<Restaurant | null>(
  `restaurant-${restaurantId}`,
  () => $fetch(`/api/restaurants/${restaurantId}`),
  null
);

// SEO dynamique selon les données du restaurant
watch(
  () => restaurant.value,
  (resto) => {
    if (resto) {
      useSeoMeta({
        title: `${resto.name} - Restaurant sur AtYourDoor`,
        description: `Découvrez ${resto.name} à ${resto.city} et commandez ses meilleurs plats sur AtYourDoor.`,
        ogTitle: `${resto.name} - Restaurant sur AtYourDoor`,
        ogDescription: `Découvrez ${resto.name} à ${resto.city} et commandez ses meilleurs plats sur AtYourDoor.`,
        ogImage: resto.image || '/images/home/home_jap.jpg',
        twitterCard: 'summary_large_image'
      });
    }
  },
  { immediate: true }
);

const { data: plats, pending: pendingPlats, error: errorPlats, refresh: refreshPlats } = await useResource<Plat[]>(
  `plats`,
  () => $fetch("/api/plats"),
  []
);

const platsForRestaurant = computed(() => {
  return (plats.value || []).filter((p) => p.id_restaurant === restaurantId);
});
</script>

<template>
  <Header />
  <div v-if="errorRestaurant || errorPlats" class="fetch-error" style="padding:12px; text-align:center; color:var(--error);">
    <div v-if="errorRestaurant">Erreur lors du chargement du restaurant : {{ errorRestaurant.message || errorRestaurant }}</div>
    <div v-if="errorPlats">Erreur lors du chargement des plats : {{ errorPlats.message || errorPlats }}</div>
    <div style="margin-top:8px;">
      <button @click="refreshRestaurant?.()">Réessayer restaurant</button>
      <button @click="refreshPlats?.()" style="margin-left:8px;">Réessayer plats</button>
    </div>
  </div>
  <div class="back-btn-wrapper">
    <button class="btn-primary" @click="router.push('/restaurants')">
      <span class="arrow-left">&#8592;</span>
      <span class="btn-text">Retour</span>
    </button>
  </div>
  <section v-if="restaurant" class="restaurant-page">
        <div class="restaurant-card">
        <div class="restaurant-image-wrapper">
          <AppImage :src="restaurant.image" :alt="restaurant.name" />
        </div>
      <div class="restaurant-info">
        <h1 class="restaurant-title">{{ restaurant.name }}</h1>
        <p class="restaurant-city">{{ restaurant.city }}</p>
      </div>
    </div>

    <div class="plats-section">
      <h2 class="plats-title">Plats proposés</h2>
      <ul class="plats-list">
        <li v-for="plat in platsForRestaurant" :key="plat.id" class="plat-item-wrapper">
          <PlatItem :plat="plat" />
          <p class="plat-description">{{ plat.description }}</p>
        </li>
        <li v-if="platsForRestaurant.length === 0" class="no-plats">Aucun plat trouvé pour ce restaurant.</li>
      </ul>
    </div>
  </section>

  <section v-else>
    <p>Chargement...</p>
  </section>
</template>

  <style scoped>
  .plat-item-wrapper {
          margin-bottom: 1.2rem;
        }
        .plat-description {
          margin: 0.3rem 0 0.7rem 2.2rem;
          color: #444;
          font-size: 1.01rem;
          font-style: italic;
        }
        
  .back-btn-wrapper {
    margin: 1.5rem 0 1rem 0;
    padding-left: 1rem;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.6em;
    background: linear-gradient(90deg, var(--accent), var(--accent-600));
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 0.5rem 1.4rem 0.5rem 1.4rem;
    font-size: 1.08rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(229,57,53,0.10);
    transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
    outline: none;
  }
  .arrow-left {
    font-size: 1.1em;
    pointer-events: none;
    margin-right: 0.1em;
  }
  .btn-text {
    display: inline-block;
  }
  .btn-primary:hover {
    background: linear-gradient(90deg, var(--accent-600), var(--accent));
    transform: translateY(-2px);
  }
  </style>
