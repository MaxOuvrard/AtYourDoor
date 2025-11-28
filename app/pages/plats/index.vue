<script setup lang="ts">

import PlatItem from "~/components/PlatItem.vue";
import type { Plat } from "../../modules/plat/types";
import { useSeoMeta } from 'nuxt/app';

useSeoMeta({
  title: 'Plats - AtYourDoor',
  description: 'Découvrez tous les plats disponibles à la commande sur AtYourDoor, livraison rapide et variée.',
  ogTitle: 'Plats - AtYourDoor',
  ogDescription: 'Parcourez la liste des plats proposés par nos restaurants partenaires.',
  ogImage: '/images/home/menu_pizza.jpg',
  twitterCard: 'summary_large_image'
});

const { data: plats } = await useAsyncData("plats", () =>
  $fetch<Plat[]>("/api/plats")
);

console.log(plats.value);
</script>

<template>
  <ul class="plats">
    <PlatItem :plat="plat" v-for="plat in plats" :key="plat.id">
    </PlatItem>
  </ul>
  <Header/>
</template>