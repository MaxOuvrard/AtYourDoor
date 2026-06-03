<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AppImage from '~/components/AppImage.vue';
import { useGlobalStore } from '../../../../stores/globalStore';
import { useUserStore } from '../../../../stores/userStore';
import { storeToRefs } from 'pinia';
import { useSeoMeta } from 'nuxt/app';
import useResource from '../../../../composables/useResource';
import { mapPlat } from '../../../../utils/mappers';
import apiFetch from '../../../../utils/api';

const route = useRoute();
const platId = String(route.params.plat_id);

const { data: rawPlat, error: platError, refresh: refreshPlat } = await useResource<any>(
  `plat-${platId}`,
  () => apiFetch(`/api/dishes/${platId}`),
  null
);

const plat = computed(() => {
  const raw = rawPlat.value
  return mapPlat(raw?.data ?? raw)
})

watch(
  () => plat.value,
  (p: any) => {
    if (p) {
      useSeoMeta({
        title: `${p.name} - Dish on AtYourDoor`,
        description: p.description || 'Discover this dish on AtYourDoor.',
        ogTitle: `${p.name} - Dish on AtYourDoor`,
        ogImage: p.image || '/images/home/menu_pizza.jpg',
        twitterCard: 'summary_large_image'
      });
    }
  },
  { immediate: true }
);

const supplements = ref([
  { id: 1, name: 'Fries', price: 2 },
  { id: 2, name: 'Salad', price: 1.5 },
  { id: 3, name: 'House sauce', price: 1 },
  { id: 4, name: 'Grated cheese', price: 1 },
]);
const selectedSupplements = ref<number[]>([]);

const totalPrice = computed(() => {
  if (!plat.value) return 0;
  const suppTotal = supplements.value
    .filter((s: any) => selectedSupplements.value.includes(s.id))
    .reduce((sum: number, s: any) => sum + s.price, 0);
  return (plat.value as any).price + suppTotal;
});

const cartMessage = ref('');

function addToCart() {
  const userStore = useUserStore();
  const { isAuthenticated, user } = storeToRefs(userStore);
  if (!isAuthenticated.value || user.value?.role !== 'USER') {
    cartMessage.value = 'Please log in as a user to add this to your cart.';
    setTimeout(() => { cartMessage.value = ''; }, 3000);
    return;
  }
  const globalStore = useGlobalStore();
  const supplementsSelected = supplements.value.filter((s: any) => selectedSupplements.value.includes(s.id));
  const p = plat.value as any;
  const item = {
    id: p?.id,
    name: p?.name,
    price: Number(totalPrice.value.toFixed(2)),
    id_restaurant: p?.id_restaurant,
    image: p?.image,
    supplements: supplementsSelected,
  };
  globalStore.ajouterAuPanier(item as any);
  cartMessage.value = 'Added to cart! Total: ' + Number(item.price).toFixed(2) + ' €';
  setTimeout(() => { cartMessage.value = ''; }, 3000);
}
</script>

<template>
  <Header />
  <div class="plat-detail-page">
    <div v-if="platError" class="fetch-error" style="padding:12px; text-align:center; color:var(--error);">
      <div>Erreur : {{ (platError as any)?.message || platError }}</div>
      <button @click="refreshPlat?.()">Retry</button>
    </div>
    <section v-if="plat">
      <NuxtLink :to="`/restaurants/${(plat as any).id_restaurant}`" class="nuxt-link-back">← View restaurant</NuxtLink>
      <div class="plat-detail">
        <AppImage class="plat-detail-image" :src="(plat as any).image" :alt="(plat as any).name" />
        <div class="plat-detail-info">
          <h1>{{ (plat as any).name }}</h1>
          <p class="plat-price">{{ (plat as any).price }} €</p>
          <p class="plat-description">{{ (plat as any).description }}</p>
          <div class="supplements-section">
            <h2 class="supplements-title">Extras</h2>
            <ul class="supplements-list">
              <li v-for="supp in supplements" :key="supp.id">
                <label class="supplement-item">
                  <input type="checkbox" :value="supp.id" v-model="selectedSupplements" />
                  <span>{{ supp.name }} <span class="supplement-price">+{{ supp.price }} €</span></span>
                </label>
              </li>
            </ul>
          </div>
          <div v-if="cartMessage" class="cart-message">{{ cartMessage }}</div>
          <button class="add-to-cart-btn" @click="addToCart">
            Add to cart — {{ totalPrice.toFixed(2) }} €
          </button>
        </div>
      </div>
    </section>
    <section v-else><p>Loading dish...</p></section>
  </div>
</template>
