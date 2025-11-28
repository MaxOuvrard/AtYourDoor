<script setup lang="ts">
import { computed } from 'vue';
import type { Plat } from "~/modules/plat/types";

const props = defineProps<{
  plat: Plat;
}>();

const cardStyle = computed(() => ({
  backgroundImage: props.plat.image ? `url(${props.plat.image})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));
</script>

<template>
  <li class="plat-item">
    <NuxtLink :to="`/plats/${props.plat.id}`" class="plat-link" :aria-label="props.plat.name">
      <div class="plat-card" :style="cardStyle">
        <div class="card-overlay">
          <div class="card-text">
            <h2 class="plat-name">{{ props.plat.name }}</h2>
            <p class="plat-price">{{ props.plat.price }} €</p>
          </div>
        </div>
      </div>
    </NuxtLink>
  </li>
</template>

<style scoped>
.plat-item {
  list-style: none;
  display: inline-block;
  vertical-align: top;
  width: clamp(220px, 26%, 320px);
  margin: 10px;
}

.plat-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.plat-card {
  width: 100%;
  aspect-ratio: 4/3;
  max-width: 100%;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background-color: #f3f4f6;
  transition: transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms;
  box-shadow: 0 4px 12px rgba(15,23,42,0.06);
  display: block;
}

.plat-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 8px 22px rgba(15,23,42,0.10);
}

.card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.52) 100%);
}

.card-text {
  width: 100%;
  padding: 10px 12px;
  color: #fff;
  backdrop-filter: blur(2px);
}

.plat-name {
  margin: 0 0 4px 0;
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.1;
  text-shadow: 0 1px 6px rgba(0,0,0,0.35);
}

.plat-price {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.97;
}

@media (max-width: 640px) {
  .plat-item {
    width: clamp(180px, 48vw, 98vw);
    margin: 8px;
  }
  .plat-card {
    aspect-ratio: 4/3;
    border-radius: 8px;
    max-width: 100%;
  }
  .plat-name { font-size: 0.96rem; }
  .card-text { padding: 8px 10px; }
}
</style>