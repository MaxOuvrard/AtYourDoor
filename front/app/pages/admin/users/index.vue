<script setup lang="ts">
definePageMeta({ middleware: ('auth' as unknown) as any })
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../../../stores/userStore'
import { useRouter } from 'vue-router'
import { apiFetch } from '../../../../utils/api'

const userStore = useUserStore()
const router = useRouter()

onMounted(() => {
  if (userStore.user?.role !== 'ADMIN') router.replace('/login')
})

type User = { id: string; email: string; firstName?: string; lastName?: string; role: string; createdAt?: string }

const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const res: any = await apiFetch('/api/users')
    const list = Array.isArray(res) ? res : (res?.data || [])
    users.value = list
  } catch (e: any) {
    error.value = e?.message || 'Erreur lors du chargement.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

const filtered = computed(() =>
  users.value.filter(u =>
    !search.value ||
    (u.email + ' ' + (u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase().includes(search.value.toLowerCase())
  )
)

// ── Create ──────────────────────────────────────────────────────
const showCreate = ref(false)
const creating = ref(false)
const createForm = ref({ email: '', firstName: '', lastName: '', password: '', role: 'USER' })
const createError = ref('')

async function createUser() {
  createError.value = ''
  creating.value = true
  try {
    const res: any = await apiFetch('/api/users', { method: 'POST', body: createForm.value })
    users.value.unshift(res)
    showCreate.value = false
    createForm.value = { email: '', firstName: '', lastName: '', password: '', role: 'USER' }
  } catch (e: any) {
    createError.value = e?.message || 'Erreur lors de la création.'
  } finally {
    creating.value = false
  }
}

// ── Edit ─────────────────────────────────────────────────────────
const editingUser = ref<User | null>(null)
const editForm = ref({ email: '', firstName: '', lastName: '', role: 'USER' })
const editError = ref('')
const saving = ref(false)

function openEdit(u: User) {
  editingUser.value = u
  editForm.value = { email: u.email, firstName: u.firstName || '', lastName: u.lastName || '', role: u.role }
  editError.value = ''
}

async function saveEdit() {
  if (!editingUser.value) return
  editError.value = ''
  saving.value = true
  try {
    const res: any = await apiFetch(`/api/users/${editingUser.value.id}`, { method: 'PUT', body: editForm.value })
    const idx = users.value.findIndex(u => u.id === editingUser.value!.id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], ...res }
    editingUser.value = null
  } catch (e: any) {
    editError.value = e?.message || 'Erreur lors de la modification.'
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────
const deletingId = ref<string | null>(null)
const deleteError = ref('')

async function deleteUser(id: string) {
  deleteError.value = ''
  try {
    await apiFetch(`/api/users/${id}`, { method: 'DELETE' })
    users.value = users.value.filter(u => u.id !== id)
  } catch (e: any) {
    deleteError.value = e?.message || 'Erreur lors de la suppression.'
  } finally {
    deletingId.value = null
  }
}

const ROLE_LABELS: Record<string, string> = { USER: 'Client', ADMIN: 'Admin', RESTAURANT: 'Restaurateur' }
</script>

<template>
  <Header />
  <div class="page">
    <div class="page-banner">
      <div class="container" style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>{{ users.length }} utilisateur{{ users.length > 1 ? 's' : '' }} enregistré{{ users.length > 1 ? 's' : '' }}</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:1;">
          <NuxtLink to="/admin" class="btn btn-ghost btn-sm">← Restaurants</NuxtLink>
          <button class="btn btn-light btn-sm" @click="showCreate = true">+ Ajouter</button>
        </div>
      </div>
    </div>

    <div class="container" style="padding-top:24px;padding-bottom:56px;">

      <div v-if="error" class="error-banner">{{ error }}</div>
      <div v-if="deleteError" class="error-banner">{{ deleteError }}</div>

      <!-- Search -->
      <div class="search-wrap" style="margin-bottom:20px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
        <input v-model="search" type="text" placeholder="Rechercher par email ou nom…" />
      </div>

      <!-- Loading -->
      <div v-if="loading" style="display:flex;flex-direction:column;gap:10px;">
        <div v-for="i in 4" :key="i" class="skeleton" style="height:56px;border-radius:12px;"></div>
      </div>

      <!-- Table -->
      <div v-else class="users-table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Inscrit le</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filtered" :key="u.id">
              <td class="td-email">{{ u.email }}</td>
              <td>{{ [u.firstName, u.lastName].filter(Boolean).join(' ') || '—' }}</td>
              <td>
                <span :class="`role-badge role-${u.role.toLowerCase()}`">{{ ROLE_LABELS[u.role] ?? u.role }}</span>
              </td>
              <td class="td-date">{{ u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—' }}</td>
              <td style="text-align:right;">
                <div style="display:flex;gap:8px;justify-content:flex-end;">
                  <button class="btn btn-sm btn-light" @click="openEdit(u)">Modifier</button>
                  <button
                    v-if="deletingId !== u.id"
                    class="btn btn-sm btn-danger"
                    @click="deletingId = u.id"
                  >Supprimer</button>
                  <template v-else>
                    <button class="btn btn-sm btn-danger" @click="deleteUser(u.id)">Confirmer</button>
                    <button class="btn btn-sm btn-light" @click="deletingId = null">Annuler</button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted);">Aucun utilisateur trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Create modal -->
  <div v-if="showCreate" class="modal-backdrop" @click.self="showCreate = false">
    <div class="modal-card">
      <h3>Créer un utilisateur</h3>
      <div v-if="createError" class="error-message">{{ createError }}</div>
      <form @submit.prevent="createUser">
        <div class="form-group"><label>Email</label><input v-model="createForm.email" type="email" required placeholder="email@exemple.com" /></div>
        <div class="form-group"><label>Prénom</label><input v-model="createForm.firstName" type="text" placeholder="Prénom" /></div>
        <div class="form-group"><label>Nom</label><input v-model="createForm.lastName" type="text" placeholder="Nom" /></div>
        <div class="form-group">
          <label>Rôle</label>
          <select v-model="createForm.role">
            <option value="USER">Client</option>
            <option value="ADMIN">Admin</option>
            <option value="RESTAURANT">Restaurateur</option>
          </select>
        </div>
        <div class="form-group"><label>Mot de passe</label><input v-model="createForm.password" type="password" required placeholder="Mot de passe" /></div>
        <div style="display:flex;gap:10px;margin-top:8px;">
          <button type="submit" class="btn btn-primary" style="flex:1;" :disabled="creating">
            <span v-if="creating" class="spinner"></span>
            {{ creating ? 'Création…' : 'Créer' }}
          </button>
          <button type="button" class="btn btn-light" style="flex:1;" @click="showCreate = false">Annuler</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Edit modal -->
  <div v-if="editingUser" class="modal-backdrop" @click.self="editingUser = null">
    <div class="modal-card">
      <h3>Modifier l'utilisateur</h3>
      <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:16px;">{{ editingUser.email }}</p>
      <div v-if="editError" class="error-message">{{ editError }}</div>
      <form @submit.prevent="saveEdit">
        <div class="form-group"><label>Prénom</label><input v-model="editForm.firstName" type="text" placeholder="Prénom" /></div>
        <div class="form-group"><label>Nom</label><input v-model="editForm.lastName" type="text" placeholder="Nom" /></div>
        <div class="form-group">
          <label>Rôle</label>
          <select v-model="editForm.role">
            <option value="USER">Client</option>
            <option value="ADMIN">Admin</option>
            <option value="RESTAURANT">Restaurateur</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;margin-top:8px;">
          <button type="submit" class="btn btn-primary" style="flex:1;" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
          <button type="button" class="btn btn-light" style="flex:1;" @click="editingUser = null">Annuler</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.users-table-wrap {
  background: #fff; border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07); overflow: hidden;
}
.users-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.users-table thead tr { background: #F4F0EA; }
.users-table th {
  padding: 12px 16px; text-align: left;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: var(--text-muted);
}
.users-table td { padding: 13px 16px; border-bottom: 1px solid #F4F0EA; vertical-align: middle; }
.users-table tbody tr:last-child td { border-bottom: none; }
.users-table tbody tr:hover { background: #FAFAF8; }

.td-email { font-weight: 600; color: var(--slate-dark); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-date { color: var(--text-faint); font-size: 0.8rem; }

.role-badge {
  display: inline-block; padding: 3px 10px; border-radius: 9999px;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase;
}
.role-user       { background: #E3F2FD; color: #1565C0; }
.role-admin      { background: #FCE4EC; color: #880E4F; }
.role-restaurant { background: #E8F5E9; color: #1B5E20; }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 20px;
}
.modal-card {
  background: #fff; border-radius: 20px; padding: 32px 28px;
  width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-card h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 16px; }
</style>
