<script setup lang="ts">
// middleware expects NavigationGuard types in TS; cast string to any to keep runtime behavior
definePageMeta({ middleware: ('auth' as unknown) as any })
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../../stores/userStore';
import { defineAsyncComponent } from 'vue'
const PlatItem = defineAsyncComponent(() => import('~/components/PlatItem.vue'))
import { useRouter } from 'vue-router';
import type { Plat } from '~/modules/plat/types';
import { apiFetch } from '../../../utils/api'
import { mapPaginatedPlats, mapRestaurant } from '../../../utils/mappers'
import { useAsyncData } from '#app'

const userStore = useUserStore();
const mesPlats = ref<Plat[]>([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const router = useRouter();
const currentRestaurant = ref<any | null>(null)

const { data: myRestaurantData } = await useAsyncData('my-restaurant-plats', async () => {
	const data = await apiFetch('/api/restaurants/me')
	currentRestaurant.value = mapRestaurant(data)
	return data
})

async function fetchMesPlats() {
	const token = userStore.token;
	if (!token) {
		error.value = $t('mesplats.not_authenticated');
		return;
	}
	const restaurantId = currentRestaurant.value?.id || userStore.restaurantId;
	if (!restaurantId) {
		error.value = 'No restaurant is associated with this account.';
		mesPlats.value = [];
		return;
	}
	loading.value = true;
	try {
		const response = await apiFetch<{ data?: unknown[] }>(`/api/restaurants/${restaurantId}/dishes`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		mesPlats.value = mapPaginatedPlats(response) ?? [];
		error.value = '';
	} catch (e) {
		error.value = $t('mesplats.network_error');
		mesPlats.value = [];
	} finally {
		loading.value = false;
	}
}

const pendingDeleteId = ref<number|null>(null);

function askDelete(id: number) {
	pendingDeleteId.value = id;
}

async function supprimerPlat(id: number) {
	const token = userStore.token;
	if (!token) {
		error.value = $t('mesplats.not_authenticated');
		return;
	}
	try {
		await apiFetch(`/api/dishes/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		});
		success.value = 'Dish deleted.';
		mesPlats.value = mesPlats.value.filter(p => p.id !== id);
		setTimeout(() => { success.value = ''; }, 3500);
		pendingDeleteId.value = null;
	} catch (e) {
		error.value = $t('mesplats.network_error');
	}
}

onMounted(fetchMesPlats);

watch(myRestaurantData, () => {
	fetchMesPlats()
})
</script>

<template>
	<Header />
	<main class="restaurant-page">
		<div class="container">
			<section class="plats-section">
				<div class="page-header" style="display:flex;align-items:center;justify-content:space-between;padding:0 18px 8px;">
					<h1 class="plats-title">{{ $t('mesplats.title') }}</h1>
					<NuxtLink to="/owner/ajouter" class="ajouter-btn">{{ $t('mesplats.add') }}</NuxtLink>
				</div>

				<div style="padding: 0 18px 18px;">
					<div v-if="loading" class="no-plats">{{ $t('mesplats.loading') }}</div>
					<div v-else-if="error" class="no-plats" style="color: var(--error);">{{ error }}</div>
				</div>

								<div style="padding: 0 18px 8px;">
									<div v-if="error" class="no-plats" style="color: var(--error);">{{ error }}</div>
									<div v-if="success" class="no-plats" style="color: var(--success, #1a7f37);">{{ success }}</div>
									<div v-if="pendingDeleteId !== null" class="delete-confirm" style="text-align:center;padding:8px 0;">
										<span>{{ $t('mesplats.confirm_delete') || 'Confirmer la suppression ?' }}</span>
										<button @click="supprimerPlat(pendingDeleteId)" style="margin-left:10px;padding:6px 10px;border-radius:8px;background:var(--accent);color:#fff;border:none;">{{ $t('delete') || 'Delete' }}</button>
										<button @click="pendingDeleteId = null" style="margin-left:6px;padding:6px 10px;border-radius:8px;border:1px solid #ddd;background:#fff;">{{ $t('cancel') || 'Cancel' }}</button>
									</div>
								</div>
								<ul v-if="!loading && !error && mesPlats.length" class="plats-list">
										<PlatItem v-for="plat in mesPlats" :key="plat.id" :plat="plat" :to="`/plats/${plat.id}/edit`" :showActions="true" @delete="askDelete" />
								</ul>

				<div v-else-if="!loading && !error && !mesPlats.length" class="plats-list">
					<p class="no-plats">{{ $t('mesplats.none_found') }}</p>
				</div>
			</section>
		</div>
	</main>
</template>

<style scoped>
.ajouter-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	border-radius: 12px;
	color: #fff;
	text-decoration: none;
	font-weight: 700;
	background: linear-gradient(90deg, var(--accent), var(--accent-600));
	box-shadow: 0 6px 18px rgba(229,57,53,0.10);
	transition: transform 0.12s, box-shadow 0.12s, opacity 0.12s;
}
.ajouter-btn:hover { transform: translateY(-2px); }

/* Ensure plats-list uses global grid styles but keep spacing consistent inside scoped CSS */
.plats-list {
	list-style: none;
	padding: 18px;
	margin: 0;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 18px;
}

.page-header h1.plats-title { margin: 0; }

.no-plats { color: var(--muted); font-style: italic; text-align: center; padding: 24px; }
</style>
