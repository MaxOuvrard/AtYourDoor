<script setup lang="ts">
import { computed } from 'vue';
import type { Plat } from "~/modules/plat/types";
import { useGlobalStore } from '../../stores/globalStore'
import { useUserStore } from '../../stores/userStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  plat: Plat;
  to?: string;
  showActions?: boolean;
}>()

const emit = defineEmits<{ (e: 'delete', id: number): void }>()

const globalStore = useGlobalStore()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const isUser = computed(() => user.value?.role === 'USER')

function addToCart(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  globalStore.ajouterAuPanier(props.plat as any)
}
</script>

<template>
  <div class="plat-wrap">
    <NuxtLink :to="props.to ?? `/plats/${props.plat.id}`" class="plat-card">
      <div class="plat-card__img" :style="props.plat.image ? { backgroundImage: `url(${props.plat.image})` } : {}">
        <span class="plat-card__price">{{ Number(props.plat.price).toFixed(2) }} €</span>
        <button v-if="isUser" class="plat-card__add" @click="addToCart" aria-label="Ajouter au panier">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      <div class="plat-card__body">
        <span class="plat-card__name">{{ props.plat.name }}</span>
        <p v-if="props.plat.description" class="plat-card__desc">{{ props.plat.description }}</p>
      </div>
    </NuxtLink>
    <button v-if="props.showActions" class="plat-card__del" @click.prevent="emit('delete', props.plat.id)" aria-label="Supprimer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
    </button>
  </div>
</template>

<style scoped>
.plat-wrap { position: relative; }

.plat-card {
  display: flex; flex-direction: column;
  background: #fff; border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  transition: transform 200ms cubic-bezier(.2,.9,.2,1), box-shadow 200ms;
  text-decoration: none; color: inherit;
}
.plat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.13);
}

.plat-card__img {
  aspect-ratio: 4/3; width: 100%; position: relative;
  background: #E8E4DD center/cover no-repeat;
}

.plat-card__price {
  position: absolute; top: 10px; right: 10px;
  background: rgba(255,255,255,0.97); color: #E53935;
  font-size: 0.82rem; font-weight: 700; padding: 4px 11px;
  border-radius: 9999px; box-shadow: 0 1px 8px rgba(0,0,0,0.12);
}

.plat-card__add {
  position: absolute; bottom: 10px; right: 10px;
  width: 36px; height: 36px; border-radius: 10px;
  background: #E53935; color: #fff; border: none;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(229,57,53,0.32);
  transition: transform 120ms, box-shadow 120ms;
}
.plat-card__add:hover {
  transform: scale(1.12);
  box-shadow: 0 6px 20px rgba(229,57,53,0.42);
}

.plat-card__body { padding: 12px 14px 16px; }

.plat-card__name {
  display: block; font-size: 0.92rem; font-weight: 700;
  color: #263238; margin-bottom: 5px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.plat-card__desc {
  font-size: 0.78rem; color: #78909C; line-height: 1.4;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

.plat-card__del {
  position: absolute; top: 10px; left: 10px; z-index: 2;
  width: 32px; height: 32px; border-radius: 9px; border: none;
  background: rgba(255,255,255,0.95); color: #C62828;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: background var(--t-fast);
}
.plat-card__del:hover { background: #FFEBEE; }
</style>
