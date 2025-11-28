<script setup lang="ts">
// middleware expects NavigationGuard types in TS; cast string to any to keep runtime behavior
definePageMeta({ middleware: ('auth' as unknown) as any })
import Header from '~/components/header.vue'
import CommandeItem from '~/components/CommandeItem.vue'
import { useCommandeStore } from '../../../stores/commandeStore'
import { useUserStore } from '../../../stores/userStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useRestaurantStore } from '../../../stores/restaurantStore'

const commandeStore = useCommandeStore()
const userStore = useUserStore()
const { commandes, loading } = storeToRefs(commandeStore as any)
const { user } = storeToRefs(userStore)

onMounted(() => {
    commandeStore.fetchCommandes()
})

const restaurantStore = useRestaurantStore()
const isOwner = computed(() => user.value?.role === 'OWNER')

const ownerRestaurantId = computed(() => {
    if (!isOwner.value || !user.value) return null
    const resto = restaurantStore.restaurants.find((r:any) => r.name === user.value.name)
    return resto ? resto.id : null
})

const filteredCommandes = computed(() => {
    if (!commandes.value) return []
    if (user.value?.role === 'USER') {
        return commandes.value.filter((c:any) => Number(c.userId) === Number(user.value.id))
    }
    if (isOwner.value) {
        // ownerRestaurantId may be null; if so, fall back to any commandes that match by restaurant name via join
        if (ownerRestaurantId.value) {
            return commandes.value.filter((c:any) => Number(c.id_restaurant) === Number(ownerRestaurantId.value))
        }
        // fallback: try to match by restaurant name using restaurantStore
        const allRestoNames = restaurantStore.restaurants.map((r:any) => r.name)
        return commandes.value.filter((c:any) => {
            // if commande has no id_restaurant, try to match if any plat or name contains a restaurant name
            if (c.id_restaurant) return false
            const text = (c.name || '') + ' ' + (c.plats || []).map((p:any) => p.name).join(' ')
            return allRestoNames.some((rn:any) => rn && text.includes(rn))
        })
    }
    return []
})

async function onConfirm(id:any) {
    await commandeStore.updateCommande(id, { status: 'preparing' } as any)
}
async function onCancel(id:any) {
    await commandeStore.updateCommande(id, { status: 'cancelled' } as any)
}
</script>

<template>
    <div class="commandes-list">
        <Header />
        <h1>{{ $t('commandes.title') }}</h1>
        <div v-if="loading">Chargement...</div>
        <div v-else>
            <div v-if="filteredCommandes.length">
                <CommandeItem v-for="cmd in filteredCommandes" :key="String(cmd.id)" :commande="cmd" :showActions="isOwner" @confirm="onConfirm" @cancel="onCancel" />
            </div>
            <div v-else>
                <p>Aucune commande trouvée.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.commandes-list { max-width: 980px; margin: 18px auto; padding: 18px; }
.commandes-list h1 { font-size: 1.5rem; margin-bottom: 12px; color: var(--accent); }
.commandes-list p { color:#6b7280 }
.commandes-list > div { background: transparent }
</style>

