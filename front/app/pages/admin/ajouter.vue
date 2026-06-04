<script setup lang="ts">
definePageMeta({ middleware: ('auth' as unknown) as any })
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../../../utils/api'
import { friendlyError } from '../../../utils/errors'

const router = useRouter()

const CATEGORIES = ['Pizzas', 'Sushis', 'Burgers', 'Français', 'Marocaine', 'Asiatique', 'Tapas', 'Sandwichs', 'Végétarien']

const form = ref({
  name: '',
  description: '',
  address: '',
  phone: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

async function submitForm() {
  error.value = ''
  success.value = false
  loading.value = true
  try {
    await apiFetch('/api/restaurants', {
      method: 'POST',
      body: {
        name: form.value.name,
        description: form.value.description || undefined,
        address: form.value.address,
        phone: form.value.phone || undefined,
      }
    })
    success.value = true
    form.value = { name: '', description: '', address: '', phone: '' }
  } catch (e) {
    error.value = friendlyError(e, 'Erreur lors de la création du restaurant.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Header />
  <div class="page">

    <!-- Banner -->
    <div class="page-banner">
      <div class="container">
        <div style="display:flex;align-items:center;gap:16px;position:relative;z-index:1;">
          <button class="btn-back" @click="router.push('/admin')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1>Ajouter un restaurant</h1>
            <p>Créer un nouveau restaurant sur la plateforme</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container form-layout">
      <div class="form-card">

        <div v-if="success" class="alert-success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Restaurant créé avec succès !
          <NuxtLink to="/admin" class="alert-link">Voir la liste →</NuxtLink>
        </div>

        <div v-if="error" class="alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ error }}
        </div>

        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">Nom du restaurant <span class="required">*</span></label>
            <input id="name" v-model="form.name" type="text" required placeholder="Ex : Chez Mario" />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" v-model="form.description" rows="3" placeholder="Décrivez la cuisine proposée…"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="address">Adresse <span class="required">*</span></label>
              <input id="address" v-model="form.address" type="text" required placeholder="Ex : 12 rue de la Paix, 75001 Paris" />
            </div>
            <div class="form-group">
              <label for="phone">Téléphone</label>
              <input id="phone" v-model="form.phone" type="tel" placeholder="Ex : 0142010203" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="router.push('/admin')">Annuler</button>
            <button type="submit" class="btn-submit" :disabled="loading">
              <svg v-if="loading" class="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              {{ loading ? 'Création…' : 'Créer le restaurant' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Banner */
.page-banner h1 { font-size: 1.4rem; }

.btn-back {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
  color: #fff; cursor: pointer; flex-shrink: 0;
  transition: background 150ms;
}
.btn-back:hover { background: rgba(255,255,255,0.35); }

/* Layout */
.form-layout {
  padding-top: 32px;
  padding-bottom: 48px;
  display: flex;
  justify-content: center;
}

.form-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  padding: 32px;
  width: 100%;
  max-width: 640px;
}

/* Alerts */
.alert-success {
  display: flex; align-items: center; gap: 10px;
  background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d;
  border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;
  font-size: 0.88rem; font-weight: 500;
}
.alert-error {
  display: flex; align-items: center; gap: 10px;
  background: #fff1f2; border: 1px solid #fecdd3; color: #be123c;
  border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;
  font-size: 0.88rem; font-weight: 500;
}
.alert-link {
  margin-left: auto; font-weight: 600; color: #15803d; text-decoration: underline;
}

/* Form */
.form-group {
  display: flex; flex-direction: column; gap: 6px;
  margin-bottom: 20px;
}
.form-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
@media (max-width: 520px) { .form-row { grid-template-columns: 1fr; } }

label {
  font-size: 0.85rem; font-weight: 600; color: #374151;
}
.required { color: var(--tomato, #E53935); }

input, textarea, select {
  padding: 10px 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.92rem;
  font-family: inherit;
  background: #fafafa;
  color: #1e293b;
  transition: border-color 150ms, box-shadow 150ms;
  width: 100%;
  box-sizing: border-box;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--tomato, #E53935);
  box-shadow: 0 0 0 3px rgba(229,57,53,0.1);
  background: #fff;
}
textarea { resize: vertical; min-height: 90px; }
input::placeholder, textarea::placeholder { color: #9ca3af; }

/* Actions */
.form-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  margin-top: 28px; padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}
.btn-cancel {
  padding: 10px 20px; border-radius: 10px;
  border: 1.5px solid #e5e7eb; background: #fff;
  color: #64748b; font-weight: 600; font-size: 0.88rem; cursor: pointer;
}
.btn-cancel:hover { background: #f8fafc; }
.btn-submit {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 24px; border-radius: 10px; border: none;
  background: var(--tomato, #E53935); color: #fff;
  font-weight: 600; font-size: 0.88rem; cursor: pointer;
  transition: opacity 150ms;
}
.btn-submit:hover:not(:disabled) { opacity: 0.88; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner-icon { animation: spin 1s linear infinite; }
</style>
