<script setup lang="ts">
import { computed } from 'vue';
import type { Restaurant } from "~/modules/restaurant/types";

const props = defineProps<{
  restaurant: Restaurant;
}>();

const cardStyle = computed(() => ({
  backgroundImage: props.restaurant.image ? `url(${props.restaurant.image})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));
</script>

<template>
  <li class="restaurant-item">
    <NuxtLink :to="`/restaurants/${props.restaurant.id}`" class="restaurant-link" :aria-label="props.restaurant.name">
      <div class="restaurant-card" :style="cardStyle">
        <div class="card-overlay">
          <div class="card-text">
            <h2 class="restaurant-name">{{ props.restaurant.name }}</h2>
            <p class="restaurant-city">{{ props.restaurant.city }}</p>
          </div>
        </div>
      </div>
    </NuxtLink>
  </li>
</template>

<style scoped>
.restaurant-item {
  list-style: none;
  display: inline-block;
  vertical-align: top;
  /* allow multiple cards per row while remaining responsive */
  width: clamp(220px, 26%, 320px);
  margin: 10px;
}

.restaurant-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.restaurant-card {
  width: 100%;
  /* Smaller card by default */
  aspect-ratio: 4/3;
  max-width: 100%; /* fill the .restaurant-item width */
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background-color: #f3f4f6; /* light fallback */
  transition: transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  display: block;
}

.restaurant-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 8px 22px rgba(15,23,42,0.10);
}

.card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  /* subtle gradient to improve text legibility */
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.52) 100%);
}

.card-text {
  width: 100%;
  padding: 10px 12px;
  color: #fff;
  backdrop-filter: blur(2px);
}

.restaurant-name {
  margin: 0 0 4px 0;
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.1;
  text-shadow: 0 1px 6px rgba(0,0,0,0.35);
}

.restaurant-city {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.95;
}

/* Small screens: slightly taller cards */
@media (max-width: 640px) {
  .restaurant-card {
    aspect-ratio: 4/3;
    border-radius: 8px;
    max-width: 100%;
  }
  .restaurant-name { font-size: 0.96rem; }
  .card-text { padding: 8px 10px; }
}
</style>