<template>
  <div class="commande-item">
    <div class="commande-header">
        <div>
          <strong class="commande-title">{{ commande.name || ('Commande #' + commande.id) }}</strong>
          <div class="meta">Utilisateur: {{ commande.userId }} • Resto: {{ commande.id_restaurant }}</div>
        </div>
        <div class="status" :class="`status-${commande.status || 'pending'}`">{{ (commande.status || 'pending').toString() }}</div>
      </div>
    <ul class="plats-list">
      <li v-for="(p, i) in commande.plats" :key="(p.id ?? p.name ?? i)"> {{ p.name }} — {{ p.price }} € <span v-if="p.quantity">×{{ p.quantity }}</span></li>
    </ul>
    <div class="commande-footer">
      <div class="price">{{ Number(commande.total).toFixed(2) }} €</div>
      <div class="actions" v-if="showActions">
        <button class="btn btn-primary" @click="$emit('confirm', commande.id)">Confirmer</button>
        <button class="btn btn-ghost danger" @click="$emit('cancel', commande.id)">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { commande, showActions = false } = defineProps<{ commande: any, showActions?: boolean }>()
</script>

<style scoped>
.commande-item { padding:14px; border:1px solid var(--card-border, #eee); border-radius:10px; margin-bottom:12px; background: var(--card, #fff); box-shadow: 0 6px 18px rgba(12,14,20,0.04); }
.commande-header { display:flex; justify-content:space-between; align-items:center; gap:12px }
.commande-title { display:block; font-size:1rem; margin-bottom:4px }
.meta { font-size:12px; color:#6b7280 }
.status { font-weight:700; padding:6px 10px; border-radius:999px; font-size:12px; text-transform:capitalize }
.status-pending { background:#fff7ed; color:#92400e; border:1px solid #ffedd5 }
.status-preparing { background:#eef2ff; color:#3730a3; border:1px solid #e0e7ff }
.status-delivering { background:#ecfeff; color:#056674; border:1px solid #cffafe }
.status-delivered { background:#ecfdf5; color:#065f46; border:1px solid #bbf7d0 }
.status-cancelled { background:#fff1f2; color:#9f1239; border:1px solid #fecaca }
.plats-list { margin:10px 0 0 0; padding-left:16px }
.commande-footer { display:flex; justify-content:space-between; align-items:center; margin-top:12px }
.price { font-weight:700; color:var(--text, #0f172a) }
.actions { display:flex; gap:8px }
.btn { padding:8px 12px; border-radius:8px; border:1px solid transparent; cursor:pointer; font-weight:600 }
.btn-primary { background:var(--accent, #E53935); color:#fff }
.btn-ghost { background:transparent; color:var(--text, #0f172a); border:1px solid rgba(15,23,42,0.06) }
.danger { color:#b91c1c }
</style>
