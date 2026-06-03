<script setup lang="ts">
definePageMeta({ middleware: ('auth' as unknown) as any })
import Header from '~/components/header.vue'
import CommandeItem from '~/components/CommandeItem.vue'
import { useCommandeStore } from '../../../stores/commandeStore'
import { useUserStore } from '../../../stores/userStore'
import { useRestaurantWS } from '../../composables/useRestaurantWS'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

const commandeStore = useCommandeStore()
const userStore = useUserStore()
const { commandes, loading } = storeToRefs(commandeStore as any) as any
const { user } = storeToRefs(userStore)

onMounted(() => {
  commandeStore.fetchCommandes(user.value?.role || 'USER')
})

const isOwner = computed(() => user.value?.role === 'OWNER')
const filteredCommandes = computed(() => commandes.value || [])
const pendingCount = computed(() => filteredCommandes.value.filter((c: any) => c.status === 'pending').length)

async function onConfirm(id: any) {
  await commandeStore.updateCommande(id, { status: 'confirmed' } as any)
}
async function onCancel(id: any) {
  await commandeStore.updateCommande(id, { status: 'cancelled' } as any)
}
async function onCancelUser(id: any) {
  try { await (commandeStore as any).cancelOrder(id) } catch {}
}

// ── WebSocket (OWNER only) ────────────────────────────────────────
const wsNotifs = ref<{ id: string; orderId: string; totalPrice: number; itemCount: number; createdAt: string; dismissed: boolean }[]>([])

function handleNewOrder(notif: any) {
  wsNotifs.value.unshift({ ...notif, id: String(Date.now()), dismissed: false })
  // Recharge la liste pour inclure la nouvelle commande
  commandeStore.fetchCommandes('OWNER')
}

function dismissNotif(id: string) {
  const n = wsNotifs.value.find(n => n.id === id)
  if (n) n.dismissed = true
  setTimeout(() => { wsNotifs.value = wsNotifs.value.filter(n => n.id !== id) }, 400)
}

const { connected: wsConnected, wsError } = isOwner.value
  ? useRestaurantWS(handleNewOrder)
  : { connected: ref(false), wsError: ref('') }
</script>

<template>
  <div class="page">
    <Header />

    <!-- Banner -->
    <div class="page-banner">
      <div class="container" style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div>
          <h1>{{ $t('commandes.title') }}</h1>
          <p v-if="!loading && filteredCommandes.length > 0">
            {{ filteredCommandes.length }} commande{{ filteredCommandes.length > 1 ? 's' : '' }}
            <template v-if="pendingCount > 0"> · <strong style="color:#fff;">{{ pendingCount }} en attente</strong></template>
          </p>
        </div>
        <!-- WS status badge (OWNER) -->
        <div v-if="isOwner" style="position:relative;z-index:1;">
          <span v-if="wsConnected" class="ws-badge ws-on">
            <span class="ws-dot"></span> Temps réel actif
          </span>
          <span v-else class="ws-badge ws-off">
            <span class="ws-dot"></span> Hors ligne
          </span>
        </div>
      </div>
    </div>

    <div class="container" style="padding-top: 28px; padding-bottom: 56px;">

      <!-- WS error -->
      <div v-if="wsError" class="error-banner" style="margin-bottom:16px;">{{ wsError }}</div>

      <!-- New order notifications (OWNER) -->
      <transition-group name="notif" tag="div" style="margin-bottom:12px;">
        <div
          v-for="n in wsNotifs.filter(n => !n.dismissed)"
          :key="n.id"
          class="notif-card"
        >
          <div class="notif-card__icon">🛎️</div>
          <div class="notif-card__body">
            <strong>Nouvelle commande reçue !</strong>
            <span>{{ n.itemCount }} article{{ n.itemCount > 1 ? 's' : '' }} · {{ Number(n.totalPrice).toFixed(2) }} €</span>
          </div>
          <button class="notif-card__close" @click="dismissNotif(n.id)">×</button>
        </div>
      </transition-group>

      <!-- Loading -->
      <div v-if="loading" class="orders-skeleton">
        <div v-for="i in 3" :key="i" class="skeleton" style="height:140px;border-radius:16px;"></div>
      </div>

      <!-- Orders list -->
      <div v-else-if="filteredCommandes.length > 0" style="display:flex;flex-direction:column;gap:14px;">
        <CommandeItem
          v-for="cmd in filteredCommandes"
          :key="String(cmd.id)"
          :commande="cmd"
          :showActions="isOwner"
          :canCancel="!isOwner && cmd.status === 'pending'"
          @confirm="onConfirm"
          @cancel="onCancel"
          @cancelUser="onCancelUser"
        />
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
        <h3>Aucune commande</h3>
        <p>Vos commandes apparaîtront ici.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.orders-skeleton { display: flex; flex-direction: column; gap: 14px; }

/* WS badge */
.ws-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.76rem; font-weight: 700; padding: 5px 12px;
  border-radius: 9999px; letter-spacing: 0.3px;
}
.ws-on  { background: rgba(255,255,255,0.2); color: #fff; }
.ws-off { background: rgba(0,0,0,0.15); color: rgba(255,255,255,0.65); }
.ws-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.ws-on .ws-dot { animation: pulse 1.4s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

/* Notification card */
.notif-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 4px 20px rgba(229,57,53,0.14);
  border-left: 4px solid var(--accent);
  margin-bottom: 10px;
}
.notif-card__icon { font-size: 1.5rem; flex-shrink: 0; }
.notif-card__body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.notif-card__body strong { font-size: 0.92rem; color: var(--text); }
.notif-card__body span  { font-size: 0.82rem; color: var(--text-muted); }
.notif-card__close {
  background: none; border: none; font-size: 1.2rem; color: var(--text-muted);
  cursor: pointer; padding: 4px; border-radius: 6px; line-height: 1;
}
.notif-card__close:hover { background: #F4F0EA; }

/* Transition */
.notif-enter-active, .notif-leave-active { transition: all 0.3s ease; }
.notif-enter-from { opacity: 0; transform: translateY(-12px); }
.notif-leave-to   { opacity: 0; transform: translateX(20px); }
</style>
