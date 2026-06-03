<script setup lang="ts">
definePageMeta({ middleware: ('auth' as unknown) as any })
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiFetch } from '../../../utils/api';

const router = useRouter();

const name = ref('');
const description = ref('');
const price = ref<number | null>(null);
const imageUrl = ref('');
const error = ref('');
const loading = ref(false);
const success = ref('');

async function ajouterPlat() {
  error.value = '';
  success.value = '';
  if (!name.value || price.value === null) {
    error.value = 'Le nom et le prix sont obligatoires.';
    return;
  }
  loading.value = true;
  try {
    await apiFetch('/api/dishes', {
      method: 'POST',
      body: {
        name: name.value,
        description: description.value || undefined,
        price: Number(price.value),
        imageUrl: imageUrl.value || undefined,
      },
    });
    success.value = 'Plat ajouté avec succès !';
    name.value = '';
    description.value = '';
    price.value = null;
    imageUrl.value = '';
  } catch (e: any) {
    error.value = e?.message || 'Erreur lors de l\'ajout du plat.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Header />
  <div class="page">
    <div class="page-banner">
      <div class="container">
        <button class="btn btn-ghost btn-sm" style="margin-bottom:12px;" @click="router.push('/plats/mesplats')">
          ← {{ $t('ajouterPlat.retour') }}
        </button>
        <h1>{{ $t('ajouterPlat.titre') }}</h1>
      </div>
    </div>

    <div class="container" style="padding-top: 32px; padding-bottom: 56px; max-width: 560px;">
      <div class="form-card">
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>

        <form @submit.prevent="ajouterPlat">
          <div class="form-group">
            <label for="name">{{ $t('ajouterPlat.nom') }}</label>
            <input id="name" v-model="name" type="text" required :placeholder="$t('ajouterPlat.nom')" />
          </div>

          <div class="form-group">
            <label for="description">{{ $t('ajouterPlat.description') }}</label>
            <textarea id="description" v-model="description" rows="3" style="resize:vertical;width:100%;padding:11px 14px;font-size:0.94rem;font-family:inherit;color:var(--text);background:#EDE9E2;border:1.5px solid transparent;border-radius:10px;outline:none;" :placeholder="$t('ajouterPlat.description')"></textarea>
          </div>

          <div class="form-group">
            <label for="price">{{ $t('ajouterPlat.prix') }}</label>
            <input id="price" v-model.number="price" type="number" min="0.01" step="0.01" required placeholder="0.00" />
          </div>

          <div class="form-group">
            <label for="imageUrl">{{ $t('ajouterPlat.image') }} (URL)</label>
            <input id="imageUrl" v-model="imageUrl" type="url" placeholder="https://exemple.com/image.jpg" />
            <div v-if="imageUrl" style="margin-top:10px;">
              <img :src="imageUrl" alt="Aperçu" style="max-width:100%;max-height:140px;border-radius:10px;object-fit:cover;" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;padding:13px;border-radius:12px;margin-top:8px;" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? $t('ajouterPlat.ajoutEnCours') : $t('ajouterPlat.ajouter') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
