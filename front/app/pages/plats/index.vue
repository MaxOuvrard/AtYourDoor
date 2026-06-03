<script setup lang="ts">
import PlatItem from '~/components/PlatItem.vue';
import { useSeoMeta } from 'nuxt/app';
import { computed } from 'vue';
import { mapPaginatedPlats } from '../../../utils/mappers';

useSeoMeta({
  title: 'Plats - AtYourDoor',
  description: 'Découvrez tous les plats disponibles à la commande sur AtYourDoor.',
  ogTitle: 'Plats - AtYourDoor',
  ogImage: '/images/home/menu_pizza.jpg',
  twitterCard: 'summary_large_image'
});

const { data: rawPlats } = await useAsyncData('all-dishes', () =>
  $fetch('/api/dishes?limit=100')
);

const plats = computed(() => mapPaginatedPlats(rawPlats.value))
</script>

<template>
  <Header />
  <ul class="plats">
    <PlatItem v-for="plat in plats" :key="plat.id" :plat="plat" />
  </ul>
</template>
