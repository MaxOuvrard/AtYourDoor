<script setup lang="ts">
definePageMeta({ middleware: ('auth' as unknown) as any })
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/userStore'
import { storeToRefs } from 'pinia'
import { mapPaginatedRestaurants } from '../../../utils/mappers'
import { apiFetch } from '../../../utils/api'
import { friendlyError } from '../../../utils/errors'

const userStore = useUserStore()
const { user, isAuthenticated } = storeToRefs(userStore)
const router = useRouter()

onMounted(() => {
  if (!isAuthenticated.value || user.value?.role !== 'ADMIN') {
    router.replace('/login')
  }
})

const { data: rawRestaurants, refresh } = await useAsyncData('restaurants-admin', () =>
  apiFetch('/api/restaurants?limit=100')
)
const { data: rawUsers } = await useAsyncData('users-admin', () =>
  apiFetch('/api/users')
)

const restaurants = computed(() => mapPaginatedRestaurants(rawRestaurants.value))
const totalUsers = computed(() => (Array.isArray(rawUsers.value) ? rawUsers.value.length : 0))
const totalRestaurants = computed(() => restaurants.value.length)
const openCount = computed(() => restaurants.value.filter((r: any) => r.status === 'OPEN').length)

// Delete
const showConfirm = ref(false)
const restaurantToDelete = ref<string | null>(null)
const restaurantToDeleteName = ref('')
const errorDelete = ref('')

function askDelete(id: string, name: string) {
  restaurantToDelete.value = id
  restaurantToDeleteName.value = name
  showConfirm.value = true
  errorDelete.value = ''
}

function removeFromList(id: string) {
  if (rawRestaurants.value?.data) {
    rawRestaurants.value = {
      ...rawRestaurants.value,
      data: rawRestaurants.value.data.filter((r: any) => r.id !== id),
    }
  }
}

async function confirmDelete() {
  if (!restaurantToDelete.value) return
  const id = restaurantToDelete.value
  removeFromList(id)
  showConfirm.value = false
  try {
    await apiFetch(`/api/restaurants/${id}`, { method: 'DELETE' })
  } catch (e) {
    errorDelete.value = friendlyError(e, 'Erreur lors de la suppression.')
    refresh()
  }
  restaurantToDelete.value = null
}

function cancelDelete() {
  showConfirm.value = false
  restaurantToDelete.value = null
  errorDelete.value = ''
}

const CATEGORY_COLORS: Record<string, string> = {
  pizzas: '#ef4444', sushis: '#3b82f6', burger: '#f97316',
  français: '#10b981', marocaine: '#8b5cf6', default: '#6b7280',
}
function catColor(cat: string) {
  return CATEGORY_COLORS[cat?.toLowerCase()] ?? CATEGORY_COLORS.default
}

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg,#f97316,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#6366f1)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#3b82f6,#6366f1)',
]
const ICONS = ['🍕','🍣','🥙','🍔','🥐','🍜','🌮','🍱']
function hashStr(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}
function placeholder(name: string) {
  const i = hashStr(name)
  return { bg: PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length], icon: ICONS[i % ICONS.length] }
}
</script>

<template>
  <Header />
  <div class="admin-page">

    <!-- Banner -->
    <div class="admin-banner">
      <div class="container">
        <div class="admin-banner__inner">
          <div>
            <h1>Tableau de bord</h1>
            <p>Gestion de la plateforme AtYourDoor</p>
          </div>
          <div class="admin-banner__actions">
            <NuxtLink to="/admin/users" class="btn-admin btn-admin--ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Utilisateurs
            </NuxtLink>
            <NuxtLink to="/admin/ajouter" class="btn-admin btn-admin--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Ajouter un restaurant
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="container admin-body">

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(229,57,53,0.1); color: #E53935;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <div class="stat-card__value">{{ totalRestaurants }}</div>
            <div class="stat-card__label">Restaurants</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <div class="stat-card__value">{{ openCount }}</div>
            <div class="stat-card__label">Ouverts</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div class="stat-card__value">{{ totalUsers }}</div>
            <div class="stat-card__label">Utilisateurs</div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorDelete" class="alert-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorDelete }}
      </div>

      <!-- Table -->
      <div class="table-card">
        <div class="table-card__header">
          <h2>Restaurants</h2>
          <span class="table-card__count">{{ totalRestaurants }} au total</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Adresse</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in restaurants" :key="r.id">
                <td>
                  <div class="resto-cell">
                    <div
                      class="resto-cell__thumb"
                      :style="r.image
                        ? { backgroundImage: `url(${r.image})` }
                        : { background: placeholder(r.name).bg }"
                    >
                      <span v-if="!r.image">{{ placeholder(r.name).icon }}</span>
                    </div>
                    <span class="resto-cell__name">{{ r.name }}</span>
                  </div>
                </td>
                <td class="cell-muted">{{ r.city }}</td>
                <td>
                  <span v-if="r.category" class="badge" :style="{ background: catColor(r.category) + '1a', color: catColor(r.category) }">
                    {{ r.category }}
                  </span>
                  <span v-else class="cell-muted">—</span>
                </td>
                <td>
                  <span :class="['status-dot', r.status === 'OPEN' ? 'status-dot--open' : 'status-dot--closed']">
                    {{ r.status === 'OPEN' ? 'Ouvert' : 'Fermé' }}
                  </span>
                </td>
                <td>
                  <button class="btn-delete" @click="askDelete(r.id, r.name)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    Supprimer
                  </button>
                </td>
              </tr>
              <tr v-if="restaurants.length === 0">
                <td colspan="5" class="table-empty">Aucun restaurant enregistré.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal confirmation -->
  <Teleport to="body">
    <div v-if="showConfirm" class="modal-backdrop" @click.self="cancelDelete">
      <div class="modal">
        <div class="modal__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3>Supprimer ce restaurant ?</h3>
        <p>Vous êtes sur le point de supprimer <strong>{{ restaurantToDeleteName }}</strong>. Cette action est irréversible et supprimera également tous ses plats.</p>
        <div class="modal__actions">
          <button class="btn-cancel" @click="cancelDelete">Annuler</button>
          <button class="btn-confirm-delete" @click="confirmDelete">Supprimer définitivement</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.admin-page { min-height: 100vh; background: var(--bg, #F4F0EA); }

/* Banner */
.admin-banner {
  background: linear-gradient(135deg, var(--tomato, #E53935) 0%, var(--orange, #FF8F00) 100%);
  padding: 32px 0;
  position: relative;
  overflow: hidden;
}
.admin-banner::after {
  content: '';
  position: absolute; bottom: -1px; left: 0; right: 0; height: 36px;
  background: var(--bg, #F4F0EA); border-radius: 36px 36px 0 0;
}
.admin-banner__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}
.admin-banner h1 { color: #fff; font-size: 1.5rem; font-weight: 700; margin: 0; }
.admin-banner p  { color: rgba(255,255,255,0.82); font-size: 0.88rem; margin: 4px 0 0; }
.admin-banner__actions { display: flex; gap: 10px; flex-wrap: wrap; }

.btn-admin {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 10px; font-weight: 600;
  font-size: 0.88rem; cursor: pointer; border: none;
  text-decoration: none; transition: opacity 150ms;
  position: relative; z-index: 1;
}
.btn-admin:hover { opacity: 0.88; }
.btn-admin--primary { background: #fff; color: var(--tomato, #E53935); }
.btn-admin--ghost   { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.3); }

/* Body */
.admin-body { padding-top: 28px; padding-bottom: 48px; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}
.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}
.stat-card__icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card__value { font-size: 1.6rem; font-weight: 800; color: #1e293b; line-height: 1; }
.stat-card__label { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; font-weight: 500; }

/* Alert */
.alert-error {
  display: flex; align-items: center; gap: 10px;
  background: #fff1f2; border: 1px solid #fecdd3; color: #be123c;
  border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;
  font-size: 0.88rem; font-weight: 500;
}

/* Table card */
.table-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  overflow: hidden;
}
.table-card__header {
  display: flex; align-items: center; gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
}
.table-card__header h2 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.table-card__count {
  font-size: 0.78rem; font-weight: 600;
  background: #f1f5f9; color: #64748b;
  padding: 2px 10px; border-radius: 9999px;
}

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
thead tr { background: #f8fafc; }
th {
  padding: 11px 16px; text-align: left;
  font-size: 0.75rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.5px;
  white-space: nowrap;
}
td { padding: 14px 16px; border-top: 1px solid #f1f5f9; vertical-align: middle; }
tbody tr:hover { background: #fafafa; }

.cell-muted { color: #94a3b8; font-size: 0.88rem; }

.resto-cell { display: flex; align-items: center; gap: 12px; }
.resto-cell__thumb {
  width: 40px; height: 40px; border-radius: 10px;
  background-size: cover; background-position: center;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.resto-cell__name { font-weight: 600; color: #1e293b; font-size: 0.92rem; }

.badge {
  display: inline-block;
  padding: 3px 10px; border-radius: 9999px;
  font-size: 0.72rem; font-weight: 700;
  text-transform: capitalize;
}

.status-dot {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.8rem; font-weight: 600;
}
.status-dot::before {
  content: ''; width: 7px; height: 7px; border-radius: 50%;
}
.status-dot--open  { color: #059669; }
.status-dot--open::before  { background: #10b981; }
.status-dot--closed { color: #dc2626; }
.status-dot--closed::before { background: #ef4444; }

.btn-delete {
  display: inline-flex; align-items: center; gap: 6px;
  background: #fff1f2; color: #be123c;
  border: 1px solid #fecdd3; border-radius: 8px;
  padding: 6px 12px; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: background 150ms;
}
.btn-delete:hover { background: #ffe4e6; }

.table-empty {
  text-align: center; color: #94a3b8;
  padding: 48px 0; font-size: 0.92rem;
}

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 16px;
}
.modal {
  background: #fff; border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  padding: 32px 28px; max-width: 420px; width: 100%;
  text-align: center;
}
.modal__icon { margin-bottom: 16px; }
.modal h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 10px; }
.modal p  { font-size: 0.88rem; color: #64748b; line-height: 1.6; margin: 0; }
.modal__actions { display: flex; gap: 10px; justify-content: center; margin-top: 24px; }

.btn-cancel {
  padding: 10px 20px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: #f8fafc; color: #475569; font-weight: 600;
  cursor: pointer; font-size: 0.88rem;
}
.btn-cancel:hover { background: #f1f5f9; }
.btn-confirm-delete {
  padding: 10px 20px; border-radius: 10px; border: none;
  background: #ef4444; color: #fff; font-weight: 600;
  cursor: pointer; font-size: 0.88rem; transition: background 150ms;
}
.btn-confirm-delete:hover { background: #dc2626; }
</style>
