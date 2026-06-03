<template>
  <Header />
  <div class="page">
    <div class="page-banner">
      <div class="container">
        <h1>Mon profil</h1>
        <p>Gérez vos informations personnelles</p>
      </div>
    </div>

    <div class="container" style="padding-top: 32px; padding-bottom: 56px; max-width: 560px;">

      <!-- Update form -->
      <div class="form-card" style="margin-bottom: 24px;">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:20px;">Modifier mon profil</h2>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>

        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label for="email">Email</label>
            <input disabled type="email" id="email" v-model="email" />
          </div>
          <div class="form-group">
            <label for="name">Prénom</label>
            <input type="text" id="name" v-model="name" placeholder="Votre prénom" />
          </div>
          <div class="form-group">
            <label for="password">Nouveau mot de passe</label>
            <input type="password" id="password" v-model="password" placeholder="Laisser vide pour ne pas changer" />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Confirmer le nouveau mot de passe" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;padding:13px;border-radius:12px;" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Mise à jour…' : 'Enregistrer' }}
          </button>
        </form>
      </div>

      <!-- Danger zone -->
      <div class="form-card danger-zone">
        <h2 style="font-size:1.1rem;font-weight:700;color:var(--error);margin-bottom:8px;">Zone de danger</h2>
        <p style="font-size:0.87rem;color:var(--text-muted);margin-bottom:16px;">
          La suppression de votre compte est irréversible. Toutes vos données seront effacées.
        </p>
        <button v-if="!confirmingDelete" class="btn btn-danger" @click="confirmingDelete = true">
          Supprimer mon compte
        </button>
        <div v-else style="display:flex;flex-direction:column;gap:10px;">
          <p style="font-size:0.87rem;font-weight:600;color:var(--error);">Êtes-vous sûr ? Cette action est irréversible.</p>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-danger" style="flex:1;" :disabled="deletingAccount" @click="deleteAccount">
              <span v-if="deletingAccount" class="spinner" style="border-top-color:var(--error);"></span>
              {{ deletingAccount ? 'Suppression…' : 'Confirmer la suppression' }}
            </button>
            <button class="btn btn-light" style="flex:1;" @click="confirmingDelete = false">Annuler</button>
          </div>
          <div v-if="deleteError" class="error-message">{{ deleteError }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ('auth' as unknown) as any })
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../../stores/userStore'

const userStore = useUserStore()
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const saving = ref(false)

const confirmingDelete = ref(false)
const deletingAccount = ref(false)
const deleteError = ref('')

onMounted(() => {
  if (userStore.user) {
    email.value = userStore.user.email || ''
    name.value = userStore.user.name || userStore.user.firstName || ''
  }
})

async function updateProfile() {
  error.value = ''
  success.value = ''
  if (password.value && password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  saving.value = true
  try {
    await userStore.update({ email: email.value, name: name.value, password: password.value })
    password.value = ''
    confirmPassword.value = ''
    success.value = 'Profil mis à jour avec succès !'
  } catch (e: any) {
    error.value = e?.message || 'Erreur lors de la mise à jour.'
  } finally {
    saving.value = false
  }
}

async function deleteAccount() {
  deletingAccount.value = true
  deleteError.value = ''
  try {
    await userStore.deleteAccount()
  } catch (e: any) {
    deleteError.value = e?.message || 'Erreur lors de la suppression du compte.'
    deletingAccount.value = false
  }
}
</script>

<style scoped>
.danger-zone { border: 1.5px solid #FFCDD2; }
</style>
