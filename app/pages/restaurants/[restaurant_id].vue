<script setup lang="ts">
import { computed } from "vue";
import type { Restaurant } from "~/modules/restaurant/types";
import type { Plat } from "~/modules/plat/types";

const route = useRoute();
const restaurantId = Number(route.params.restaurant_id);

const { data: restaurant } = await useAsyncData<Restaurant | null>(
  `restaurant-${restaurantId}`,
  () => $fetch(`/api/restaurants/${restaurantId}`)
);

const { data: plats } = await useAsyncData<Plat[]>("plats", () => $fetch("/api/plats"));

const platsForRestaurant = computed(() => {
  return (plats.value || []).filter((p) => p.id_restaurant === restaurantId);
});
</script>

<template>
  <Header />
  <section v-if="restaurant">
    <header class="restaurant-header">
      <img :src="restaurant.image" :alt="restaurant.name" class="restaurant-header-image" />
      <h1>{{ restaurant.name }}</h1>
      <p>{{ restaurant.city }}</p>
      
    </header>

    <h2>Plats proposés</h2>
    <ul class="plats">
      <PlatItem v-for="plat in platsForRestaurant" :key="plat.id" :plat="plat" />
      <li v-if="platsForRestaurant.length === 0">Aucun plat trouvé pour ce restaurant.</li>
    </ul>
  </section>

  <section v-else>
    <p>Chargement...</p>
  </section>
</template>
