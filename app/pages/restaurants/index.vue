<script setup lang="ts">
import type { Restaurant } from "../../modules/restaurant/types";

const { data: restaurants } = await useAsyncData("restaurants", () =>
  $fetch<Restaurant[]>("/api/restaurants")
);

console.log(restaurants.value);
</script>

<template>
  <Header/>
  <h1>Restaurants</h1>
  <ul class="restaurants">
    <RestaurantItem :restaurant="restaurant" v-for="restaurant in restaurants" :key="restaurant.id">
    </RestaurantItem>
  </ul>
</template>