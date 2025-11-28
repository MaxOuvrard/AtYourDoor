<script setup lang="ts">
import { computed } from 'vue';
import type { Plat } from "~/modules/plat/types";
import { useGlobalStore } from '../../stores/globalStore'
import { useUserStore } from '../../stores/userStore'
import { storeToRefs } from 'pinia'
import { computed as vueComputed } from 'vue'

const props = defineProps<{
  plat: Plat;
  to?: string;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  (e: 'delete', id: number): void
}>();

const cardStyle = computed(() => ({
  backgroundImage: props.plat.image ? `url(${props.plat.image})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const globalStore = useGlobalStore()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const isUser = vueComputed(() => user.value?.role === 'USER')
function addToCart() {
  globalStore.ajouterAuPanier(props.plat as any)
}
</script>

<template>
  <li class="plat-item">
    <div class="plat-wrapper">
      <NuxtLink :to="props.to ? props.to : `/plats/${props.plat.id}`" class="plat-link" :aria-label="props.plat.name">
      <div class="plat-card" :style="cardStyle">
        <div class="card-overlay">
          <div class="card-text">
            <h2 class="plat-name">{{ props.plat.name }}</h2>
            <p class="plat-price">{{ props.plat.price }} €</p>
          </div>
          <button v-if="isUser" class="add-cart-btn" @click.prevent="addToCart" aria-label="Ajouter au panier">+</button>
        </div>
      </div>
      </NuxtLink>
      <button v-if="props.showActions" class="delete-btn" @click.prevent="emit('delete', props.plat.id)" aria-label="Supprimer">×</button>
    </div>
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

.plat-wrapper { position: relative; }
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,0.92);
  color: var(--error);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(12,14,20,0.08);
}
.delete-btn:hover { transform: translateY(-2px); }

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

.add-cart-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,0.92);
  color: var(--accent, #E53935);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(12,14,20,0.08);
}
.add-cart-btn:hover { transform: translateY(-2px); }

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