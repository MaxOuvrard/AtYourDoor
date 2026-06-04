<script setup lang="ts">
import type { Restaurant } from "~/modules/restaurant/types";
const { restaurant } = defineProps<{ restaurant: Restaurant & { description?: string; address?: string; status?: string } }>()

const PLACEHOLDERS = [
  'linear-gradient(135deg,#f97316 0%,#ef4444 100%)',
  'linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%)',
  'linear-gradient(135deg,#10b981 0%,#059669 100%)',
  'linear-gradient(135deg,#f59e0b 0%,#f97316 100%)',
  'linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)',
]

const ICONS = ['🍜','🍕','🍣','🍔','🥗','🌮','🍱','🥘','🫕','🍛']

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const idx = hashStr(restaurant.id?.toString() ?? restaurant.name)
const placeholder = PLACEHOLDERS[idx % PLACEHOLDERS.length]
const icon = ICONS[idx % ICONS.length]

const shortAddress = restaurant.address?.split(',').slice(-2).join(',').trim() ?? restaurant.city
</script>

<template>
  <NuxtLink :to="`/restaurants/${restaurant.id}`" class="resto-card">
    <div
      class="resto-card__img"
      :style="restaurant.image
        ? { backgroundImage: `url(${restaurant.image})` }
        : { background: placeholder }"
    >
      <div v-if="!restaurant.image" class="resto-card__placeholder-icon">{{ icon }}</div>
      <span v-if="restaurant.category" class="resto-card__cat">{{ restaurant.category }}</span>
      <span v-if="restaurant.status === 'CLOSED'" class="resto-card__closed">Fermé</span>
    </div>
    <div class="resto-card__body">
      <h3 class="resto-card__name">{{ restaurant.name }}</h3>
      <p v-if="restaurant.description" class="resto-card__desc">{{ restaurant.description }}</p>
      <p class="resto-card__city">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {{ shortAddress }}
      </p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.resto-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  transition: transform 200ms cubic-bezier(.2,.9,.2,1), box-shadow 200ms;
  text-decoration: none;
  color: inherit;
}
.resto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.14);
}

.resto-card__img {
  aspect-ratio: 3/2;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resto-card__placeholder-icon {
  font-size: 3rem;
  opacity: 0.9;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
}

.resto-card__cat {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255,255,255,0.96);
  color: #455A64;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 4px 11px;
  border-radius: 9999px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.12);
}

.resto-card__closed {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 9999px;
}

.resto-card__body {
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.resto-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resto-card__desc {
  font-size: 0.78rem;
  color: #607D8B;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.resto-card__city {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: #90A4AE;
  font-weight: 500;
  margin-top: 4px;
}
</style>
