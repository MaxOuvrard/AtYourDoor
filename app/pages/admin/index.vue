
<script setup lang="ts">
// middleware expects NavigationGuard types in TS; cast string to any to keep runtime behavior
definePageMeta({ middleware: ('auth' as unknown) as any })
import type { Restaurant } from "../../modules/restaurant/types";
import { useUserStore } from "../../../stores/userStore";
import { storeToRefs } from "pinia";
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const userStore = useUserStore();
const { user, isAuthenticated } = storeToRefs(userStore);
const router = useRouter();

onMounted(() => {
  // Si non connecté ou pas admin, rediriger vers /login
  if (!isAuthenticated.value || user.value?.role !== 'ADMIN') {
    router.replace('/login');
  }
});

const { data: restaurants, refresh } = await useAsyncData("restaurants-admin", () =>
  $fetch<Restaurant[]>("/api/restaurants")
);

import { ref } from 'vue';
const showConfirm = ref(false);
const restaurantToDelete = ref<number|null>(null);
const errorDelete = ref('');

function askDelete(id: number) {
  restaurantToDelete.value = id;
  showConfirm.value = true;
  errorDelete.value = '';
}

function removeRestaurantFromList(id: number) {
  import LazyImage from '~/components/LazyImage.vue'
  if (restaurants.value) {
    restaurants.value = restaurants.value.filter(r => r.id !== id);
  }
}

async function confirmDelete() {
  if (restaurantToDelete.value !== null) {
    const id = restaurantToDelete.value;
    removeRestaurantFromList(id); // MAJ immédiate côté UI
    showConfirm.value = false;
    try {
      await $fetch(`/api/restaurants/delete?restaurant_id=${id}`, { method: 'DELETE' });
    } catch (e) {
      errorDelete.value = $t('admin.delete_error');
      refresh(); // rollback si erreur
    }
    restaurantToDelete.value = null;
  }
}

function cancelDelete() {
  showConfirm.value = false;
  restaurantToDelete.value = null;
  errorDelete.value = '';
}
</script>

<template>
  <Header/>
  <div style="max-width: 900px; margin: 40px auto 0 auto; background: var(--card); border-radius: 18px; box-shadow: var(--shadow); padding: 36px 24px; position: relative;">
    <NuxtLink
      to="/admin/ajouter"
      style="position: absolute; top: 36px; right: 24px; background: linear-gradient(90deg, var(--accent), var(--accent-600)); color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(229,57,53,0.08); transition: background 0.18s; font-size: 1.05rem; text-decoration: none; display: inline-block; text-align: center;"
    >
      {{ $t('admin.add_restaurant') }}
    </NuxtLink>
    <h1 style="margin-bottom: 24px; color: var(--accent);">{{ $t('admin.title') }}</h1>
    <table style="width: 100%; border-collapse: collapse; background: none;">
      <thead>
        <tr style="background: var(--bg);">
          <th style="padding: 12px 8px; text-align: left;">{{ $t('admin.image') }}</th>
          <th style="padding: 12px 8px; text-align: left;">{{ $t('admin.name') }}</th>
          <th style="padding: 12px 8px; text-align: left;">{{ $t('admin.city') }}</th>
          <th style="padding: 12px 8px; text-align: left;">{{ $t('admin.category') }}</th>
          <th style="padding: 12px 8px; text-align: center;">{{ $t('admin.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="restaurant in restaurants" :key="restaurant.id" style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 8px;">
            <LazyImage :src="restaurant.image" :alt="restaurant.name" />
          </td>
          <td style="padding: 10px 8px; font-weight: 600;">{{ restaurant.name }}</td>
          <td style="padding: 10px 8px;">{{ restaurant.city }}</td>
          <td style="padding: 10px 8px;">{{ restaurant.category }}</td>
          <td style="padding: 10px 8px; text-align: center;">
            <button
              style="background: linear-gradient(90deg, var(--accent), var(--accent-600)); color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(229,57,53,0.08); transition: background 0.18s;"
              @click.prevent="askDelete(restaurant.id)"
            >
              {{ $t('admin.delete') }}
            </button>
          </td>
        </tr>
        <tr v-if="!restaurants || restaurants.length === 0">
          <td colspan="5" style="text-align: center; color: var(--muted); padding: 24px 0;">{{ $t('admin.none_found') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-if="showConfirm" class="modal-overlay">
    <div class="modal-confirm">
      <h3 style="color: var(--accent); margin-bottom: 12px;">{{ $t('admin.confirm_delete_title') }}</h3>
      <p>{{ $t('admin.confirm_delete_text') }}</p>
      <div style="margin-top: 22px; display: flex; gap: 16px; justify-content: flex-end;">
        <button @click="cancelDelete" style="background: var(--bg); color: var(--text); border: 1px solid #eee; border-radius: 8px; padding: 8px 18px; font-weight: 600; cursor: pointer;">{{ $t('admin.cancel') }}</button>
        <button @click="confirmDelete" style="background: linear-gradient(90deg, var(--accent), var(--accent-600)); color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-weight: 600; cursor: pointer;">{{ $t('admin.delete') }}</button>
      </div>
      <div v-if="errorDelete" style="color: var(--accent); margin-top: 10px;">{{ errorDelete }}</div>
    </div>
    <div class="modal-backdrop" @click="cancelDelete"></div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-confirm {
  background: var(--card, #fff);
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.13);
  padding: 32px 28px 24px 28px;
  min-width: 320px;
  max-width: 90vw;
  position: relative;
  z-index: 1001;
}
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15,23,42,0.18);
  z-index: 1000;
}
</style>
