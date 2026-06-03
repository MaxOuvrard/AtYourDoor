<script setup lang="ts">
import type { Restaurant } from "~/modules/restaurant/types";
const { restaurant } = defineProps<{ restaurant: Restaurant }>()
</script>

<template>
  <NuxtLink :to="`/restaurants/${restaurant.id}`" class="resto-card">
    <div class="resto-card__img" :style="restaurant.image ? { backgroundImage: `url(${restaurant.image})` } : {}">
      <span v-if="restaurant.category" class="resto-card__cat">{{ restaurant.category }}</span>
    </div>
    <div class="resto-card__body">
      <h3 class="resto-card__name">{{ restaurant.name }}</h3>
      <p class="resto-card__city">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {{ restaurant.city }}
      </p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.resto-card {
  display: flex; flex-direction: column;
  background: #fff; border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  transition: transform 200ms cubic-bezier(.2,.9,.2,1), box-shadow 200ms;
  text-decoration: none; color: inherit;
}
.resto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.13);
}

.resto-card__img {
  aspect-ratio: 3/2; width: 100%;
  background: #E8E4DD center/cover no-repeat;
  position: relative;
}

.resto-card__cat {
  position: absolute; top: 10px; left: 10px;
  background: rgba(255,255,255,0.96); color: #455A64;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.8px;
  text-transform: uppercase; padding: 4px 11px; border-radius: 9999px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
}

.resto-card__body { padding: 14px 16px 18px; }

.resto-card__name {
  font-size: 0.97rem; font-weight: 700; color: #263238;
  margin-bottom: 6px; line-height: 1.2;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.resto-card__city {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.8rem; color: #78909C; font-weight: 500;
}
</style>
