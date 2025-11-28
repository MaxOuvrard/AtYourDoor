<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AppImage from '~/components/AppImage.vue'
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../../../stores/userStore';
import { useRestaurantStore } from '../../../../stores/restaurantStore';
import type { Plat } from '~/modules/plat/types';

const route = useRoute();
const router = useRouter();
const platId = Number(route.params.plat_id);
const userStore = useUserStore();

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

const form = ref<Partial<Plat>>({});
const restaurantStore = useRestaurantStore();
const categories = ref<string[]>([]);
const imageError = ref(false);
const imageVersion = ref(0);
const imageSrc = computed(() => {
  const url = (form.value as any)?.image;
  if (!url) return '/images/home/menu_pizza.jpg';
  // append a version to force reload when URL changes
  return `${url}${url.includes('?') ? '&' : '?'}v=${imageVersion.value}`;
});

function onImageError() {
  imageError.value = true;
}

// validate image by preloading it; update error state and version to force <img> reload
async function validateImage(url?: string) {
  const src = url ?? (form.value as any)?.image;
  if (!src) {
    imageError.value = false;
    imageVersion.value++;
    return;
  }
  imageError.value = false;
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageError.value = false;
      imageVersion.value++;
      resolve();
    };
    img.onerror = () => {
      imageError.value = true;
      imageVersion.value++;
      resolve();
    };
    img.src = src;
  });
}

watch(() => (form.value as any)?.image, (newVal) => {
  imageError.value = false;
  validateImage(newVal as string).catch(() => {});
});

// Use useAsyncData to load plat and categories
const { data: platData, pending: platPending, error: platFetchError } = await useAsyncData<Plat | null>(`plat-${platId}`, () => $fetch(`/api/plats/${platId}`));
const { data: catsData } = await useAsyncData<string[]>(`categories`, () => $fetch('/api/restaurants/categories'));

// Initialize form and categories when async data arrives
watch(platData, (val) => {
  if (val) {
    form.value = { ...val };
    if (typeof (form.value as any).available === 'undefined') (form.value as any).available = false;
    if (typeof (form.value as any).category === 'undefined') (form.value as any).category = '';
  }
});

watch(catsData, (val) => {
  if (Array.isArray(val)) {
    categories.value = val;
    if ((!form.value.category || form.value.category === '') && categories.value.length) {
      form.value.category = categories.value[0];
    }
  }
});

// Also set initial values immediately if async data already present
if (platData && platData.value) {
  form.value = { ...platData.value };
  if (typeof (form.value as any).available === 'undefined') (form.value as any).available = false;
  if (typeof (form.value as any).category === 'undefined') (form.value as any).category = '';
}
if (catsData && Array.isArray(catsData.value)) {
  categories.value = catsData.value;
  if ((!form.value.category || form.value.category === '') && categories.value.length) {
    form.value.category = categories.value[0];
  }
}

async function save() {
  if (!userStore.token) {
    error.value = $t('editPlat.not_authenticated');
    return;
  }
  saving.value = true;
  try {
    // Validation
    if (!form.value.name || String(form.value.name).trim() === '') {
      error.value = $t('editPlat.name_required');
      saving.value = false;
      return;
    }
    if (typeof form.value.price === 'undefined' || Number(form.value.price) < 0) {
      error.value = $t('editPlat.price_positive');
      saving.value = false;
      return;
    }

    // Use POST to new API endpoint to update plats.json
    const res = await $fetch('/api/plats/update', {
      method: 'POST',
      body: form.value,
      headers: {
        Authorization: `Bearer ${userStore.token}`,
      }
    }).catch((e: any) => { throw e; });
    // show success message (no redirect)
    success.value = $t('editPlat.saved');
    error.value = '';
  } catch (e: any) {
    error.value = e?.message || $t('editPlat.network_error');
  } finally {
    saving.value = false;
  }
}

function cancel() {
  router.back();
}
</script>

<template>
  <Header />
  <main class="container" style="padding: 18px 0;">
    <div class="page-actions">
      <button type="button" class="btn-primary back-page" @click="router.back()">{{ $t('editPlat.back') }}</button>
    </div>
    <section class="edit-plat">
      <div class="card-wrap">
        <h1>{{ $t('editPlat.title') }}</h1>

        <div v-if="loading">{{ $t('editPlat.loading') }}</div>

        <form v-else @submit.prevent="save" class="plat-edit-form">
        <div v-if="error" class="form-error">{{ error }}</div>
        <div v-if="success" class="form-success">{{ success }}</div>

        <label>
          {{ $t('editPlat.name') }}
          <input v-model="form.name" type="text" required />
        </label>

        <label>
          {{ $t('editPlat.price') }}
          <input class="form-control" v-model.number="form.price" type="number" step="0.01" required />
        </label>

        <label>
          {{ $t('editPlat.description') }}
          <textarea class="form-control" v-model="form.description" rows="4"></textarea>
        </label>

        <label>
          {{ $t('editPlat.image_url') }}
          <input class="form-control" v-model="form.image" type="text" />
        </label>

        <!-- main photo display -->
        <div class="main-photo">
          <AppImage :key="(form.image || '') + '-' + imageVersion" :src="imageSrc" :alt="$t('editPlat.title')" @error="onImageError" />
        </div>

        <label>
          {{ $t('editPlat.category') }}
          <select class="form-control" v-model="form.category">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>

        <div style="display:flex;gap:12px;margin-top:12px">
          <button type="submit" :disabled="saving" class="btn-primary">{{ saving ? $t('editPlat.saving') : $t('editPlat.save') }}</button>
        </div>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.edit-plat { display:flex; justify-content:center; align-items:center; padding:24px 0; min-height:calc(100vh - 120px); }
.card-wrap { width:100%; max-width:760px; background:#ffffff; padding:20px; border-radius:12px; box-shadow:0 8px 30px rgba(16,24,40,0.08); }
.card-wrap h1 { margin:0 0 12px 0; text-align:left; font-size:1.4rem }
.page-actions { display:flex; justify-content:flex-start; gap:12px; margin-bottom:14px }
.back-page { padding:10px 14px; font-weight:700; font-family: inherit; font-size:1rem; line-height:1; border-radius:8px }
.back-page:hover { opacity:0.95 }

.form-success { color: #059669; background: rgba(5,150,105,0.06); padding:8px; border-radius:8px; margin-bottom:6px }
.form-error { color: #dc2626; background: rgba(220,38,38,0.06); padding:8px; border-radius:8px; margin-bottom:6px }
.plat-edit-form { display:flex;flex-direction:column;gap:12px;max-width:100%;padding:0;border-radius:8px;background:transparent; }
.plat-edit-form label { display:flex;flex-direction:column;font-weight:600 }
.plat-edit-form .form-control { padding:10px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.08); background:#fff; font-size:1rem; line-height:1.4; box-sizing:border-box; width:100% }
.plat-edit-form textarea.form-control { min-height:110px; resize:vertical; }
.plat-edit-form input[type="number"].form-control { appearance:textfield; -moz-appearance:textfield; }
.plat-edit-form select.form-control { appearance:none; -webkit-appearance:none; -moz-appearance:none; max-width:100%; background:linear-gradient(180deg,#fff,#fafafa) }
.plat-edit-form select:focus { outline:2px solid rgba(100,116,255,0.12); box-shadow:0 0 0 4px rgba(100,116,255,0.04) }
.btn-primary { background: linear-gradient(90deg,var(--accent),var(--accent-600)); color:#fff; padding:10px 14px; border-radius:8px; border:none }
.btn-secondary { background:transparent;border:1px solid rgba(0,0,0,0.08);padding:10px 14px;border-radius:8px }
.image-preview { margin-top:8px }
.image-preview img { max-width:240px; border-radius:8px; display:block; box-shadow:0 6px 18px rgba(0,0,0,0.06) }

.main-photo { margin-bottom:12px; display:flex; justify-content:center }
.main-photo img { width:100%; max-width:460px; height:auto; border-radius:10px; box-shadow:0 8px 30px rgba(16,24,40,0.08); display:block }

@media (max-width: 520px) {
  .card-wrap { padding:16px }
  .image-preview img { max-width:100% }
}
</style>
