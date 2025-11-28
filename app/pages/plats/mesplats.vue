<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../../stores/userStore';
import PlatItem from '~/components/PlatItem.vue';
import type { Plat } from '~/modules/plat/types';

const userStore = useUserStore();
const mesPlats = ref<Plat[]>([]);
const loading = ref(false);
const error = ref('');

async function fetchMesPlats() {
	const token = userStore.token;
	if (!token) {
		error.value = $t('mesplats.not_authenticated');
		return;
	}
	loading.value = true;
	try {
		const res = await fetch('/api/plats/mesplats', {
			headers: {
			Authorization: `Bearer ${token}`,
		},
		});
		if (!res.ok) {
			const err = await res.json();
			error.value = err.error || $t('mesplats.load_error');
			mesPlats.value = [];
		} else {
			mesPlats.value = await res.json();
			error.value = '';
		}
	} catch (e) {
		error.value = $t('mesplats.network_error');
		mesPlats.value = [];
	} finally {
		loading.value = false;
	}
}

onMounted(fetchMesPlats);
</script>

<template>
	<Header />
	<div>
		<h1>{{ $t('mesplats.title') }}</h1>
		<NuxtLink to="/owner/ajouter" class="ajouter-btn">{{ $t('mesplats.add') }}</NuxtLink>
		<div v-if="loading">{{ $t('mesplats.loading') }}</div>
		<div v-else-if="error">{{ error }}</div>
		<ul v-else-if="mesPlats.length" class="plats-list">
			<PlatItem v-for="plat in mesPlats" :key="plat.id" :plat="plat" />
		</ul>
		<div v-else>
			<p>{{ $t('mesplats.none_found') }}</p>
		</div>
	</div>
</template>

<style scoped>
.ajouter-btn {
	display: inline-block;
	margin-bottom: 18px;
	padding: 8px 18px;
	background: #2563eb;
	color: #fff;
	border-radius: 6px;
	text-decoration: none;
	font-weight: 600;
	transition: background 0.18s;
}
.ajouter-btn:hover {
	background: #1d4ed8;
}
.plats-list {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
	padding: 0;
	margin: 0;
}
</style>
