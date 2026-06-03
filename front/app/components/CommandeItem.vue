<template>
  <div class="order-card">
    <div class="order-card__header">
      <div class="order-card__left">
        <span class="order-card__id">{{ commande.name || `Commande #${String(commande.id).slice(-6)}` }}</span>
        <span v-if="commande.deliveryAddress" class="order-card__addr">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ commande.deliveryAddress }}
        </span>
        <span v-if="commande.createdAt" class="order-card__date">
          {{ new Date(commande.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
        </span>
      </div>
      <span :class="`badge badge-${commande.status || 'pending'}`">{{ statusLabel(commande.status) }}</span>
    </div>

    <ul class="order-card__items">
      <li v-for="(p, i) in commande.plats" :key="p.id ?? p.name ?? i" class="order-card__item">
        <span class="order-card__item-qty">×{{ p.quantity || 1 }}</span>
        <span class="order-card__item-name">{{ p.name }}</span>
        <span class="order-card__item-price">{{ Number(p.price).toFixed(2) }} €</span>
      </li>
    </ul>

    <div class="order-card__footer">
      <span class="order-card__total">Total : <strong>{{ Number(commande.total).toFixed(2) }} €</strong></span>
      <div class="order-card__actions">
        <template v-if="showActions">
          <button class="btn btn-sm btn-primary" @click="$emit('confirm', commande.id)">Confirmer</button>
          <button class="btn btn-sm btn-danger" @click="$emit('cancel', commande.id)">Refuser</button>
        </template>
        <button
          v-if="canCancel"
          class="btn btn-sm btn-danger"
          @click="$emit('cancelUser', commande.id)"
        >Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { commande, showActions = false, canCancel = false } = defineProps<{
  commande: any
  showActions?: boolean
  canCancel?: boolean
}>()
defineEmits<{ confirm: [id: any], cancel: [id: any], cancelUser: [id: any] }>()

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', preparing: 'En préparation',
  delivering: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée',
}
function statusLabel(s?: string) { return STATUS_LABELS[s || 'pending'] ?? s ?? 'En attente' }
</script>

<style scoped>
.order-card {
  background: #fff; border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  transition: box-shadow 200ms;
}
.order-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.10); }

.order-card__header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 18px 20px 14px; border-bottom: 1px solid #F0EDE8;
}
.order-card__left { display: flex; flex-direction: column; gap: 4px; min-width: 0; }

.order-card__id { font-size: 0.97rem; font-weight: 700; color: #263238; }
.order-card__addr {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.79rem; color: #607D8B;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.order-card__date { font-size: 0.76rem; color: #B0BEC5; }

.order-card__items { padding: 12px 20px; display: flex; flex-direction: column; gap: 6px; }

.order-card__item {
  display: flex; align-items: center; gap: 8px; font-size: 0.86rem;
}
.order-card__item-qty {
  min-width: 28px; text-align: center;
  background: #F4F0EA; color: #455A64; font-weight: 700;
  font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;
}
.order-card__item-name { flex: 1; color: #263238; font-weight: 500; }
.order-card__item-price { color: #607D8B; font-weight: 600; white-space: nowrap; }

.order-card__footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px 18px; gap: 12px;
  border-top: 1px solid #F0EDE8;
}
.order-card__total { font-size: 0.9rem; color: #455A64; }
.order-card__total strong { color: #263238; font-size: 1rem; }

.order-card__actions { display: flex; gap: 8px; }

/* Override global btn-danger for this context */
.btn-danger { background: #FFEBEE; color: #C62828; }
.btn-danger:hover { background: #FFCDD2; }
</style>
