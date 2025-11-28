<template>
	<Header />
	<div class="owner-root">
		<div class="owner-content" style="width:100vw;">
			<div class="owner-card">
				<h1>{{ $t('owner.title') }}</h1>
				<form class="owner-form">
					<div class="form-group">
						<label for="name">{{ $t('owner.name_label') }}</label>
						<input id="name" type="text" v-model="name" :placeholder="$t('owner.name_placeholder')" />
					</div>
					<div class="form-group">
						<label for="city">{{ $t('owner.city_label') }}</label>
						<input id="city" type="text" v-model="city" :placeholder="$t('owner.city_placeholder')" />
					</div>
					<div class="form-group">
						<label for="category">{{ $t('owner.category_label') }}</label>
						<select id="category" v-model="category">
							<option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
						</select>
					</div>
					<div class="form-group">
						<label for="image">{{ $t('owner.image_label') }}</label>
						<input id="image" type="file" accept="image/*" @change="onImageChange" />
						<div v-if="imagePreview" style="margin-top:8px;text-align:center;">
							<LazyImage :src="imagePreview" :alt="$t('owner.image_alt')" />
						</div>
					</div>
					<button type="button" class="owner-btn" :disabled="restaurantStore.loading" @click="updateRestaurant">
						<span v-if="restaurantStore.loading">{{ $t('owner.updating') || 'Mise à jour...' }}</span>
						<span v-else>{{ $t('owner.update_btn') }}</span>
					</button>
				</form>

				<div v-if="restaurantStore.error" style="color:#b91c1c;margin-top:10px;text-align:center;">
					{{ restaurantStore.error }}
				</div>
				<div v-if="restaurantStore.success" style="color:#065f46;margin-top:10px;text-align:center;">
					{{ restaurantStore.success }}
				</div>

			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// middleware expects NavigationGuard types in TS; cast string to any to keep runtime behavior
definePageMeta({ middleware: ('auth' as unknown) as any })

import { useAsyncData } from '#app'
import { useRestaurantStore } from '../../../stores/restaurantStore'
import { useUserStore } from '../../../stores/userStore'
import { computed, watch, onMounted, ref } from 'vue'
import LazyImage from '~/components/LazyImage.vue'

const name = ref('')
const city = ref('')
const category = ref('')
const image = ref<File|null>(null)
const imagePreview = ref('')

const userStore = useUserStore()
const restaurantStore = useRestaurantStore()
// commande logic removed from this page; commandes live in /commandes

const { data: restaurantsData } = useAsyncData('restaurants', async () => {
  const data = await $fetch('/api/restaurants')
  restaurantStore.setRestaurants(data)
  return data
})

const categories = computed(() => {
  const all = restaurantStore.restaurants.map(r => r.category).filter(Boolean)
  return Array.from(new Set(all))
})

function fillRestaurantFields() {
	if (!userStore.user || userStore.user.role !== 'OWNER' || !restaurantStore.restaurants.length) return
	const resto = restaurantStore.restaurants.find((r) => r.name === userStore.user.name)
	if (resto) {
		name.value = resto.name
		city.value = resto.city
		category.value = resto.category || ''
		imagePreview.value = resto.image || ''
		image.value = null
	}
}

function onImageChange(e: Event) {
	const target = e.target as HTMLInputElement
	if (target.files && target.files[0]) {
		image.value = target.files[0]
		imagePreview.value = URL.createObjectURL(target.files[0])
	}
}

onMounted(() => {
	fillRestaurantFields()
})

async function updateRestaurant() {
	if (!userStore.user) {
		restaurantStore.error = 'Utilisateur non connecté'
		return
	}

	const currentResto = restaurantStore.restaurants.find(r => r.name === userStore.user.name)
	if (!currentResto) {
		restaurantStore.error = 'Aucun restaurant trouvé pour cet utilisateur'
		return
	}

	const form = new FormData()
	form.append('restaurant_id', String(currentResto.id))
	form.append('name', name.value)
	form.append('city', city.value)
	form.append('category', category.value)
	if (image.value) form.append('image', image.value)

	try {
		const res: any = await restaurantStore.saveRestaurant(form)
		name.value = res.name || name.value
		city.value = res.city || city.value
		category.value = res.category || category.value
		imagePreview.value = res.image || imagePreview.value
		image.value = null
	} catch (err) {
		console.error('Update failed:', err)
	}
}

// commandes management intentionally handled in /commandes route

// Watch restaurants and user changes to refill fields reactively
watch(
	() => [restaurantStore.restaurants, userStore.user],
	() => {
		fillRestaurantFields()
	},
	{ immediate: true, deep: true }
)

</script>


<style scoped>
.owner-root {
	min-height: 100vh;
	background: var(--bg);
	font-family: 'Poppins', Inter, system-ui, Arial, sans-serif;
	overflow: hidden;
}
html, body {
	overflow-x: hidden !important;
	overflow-y: hidden !important;
}
.owner-content {
	width: 100vw;
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px 0;
}
.owner-card {
	width: 100%;
	max-width: 420px;
	background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,251,244,0.96));
	border-radius: calc(var(--radius) + 4px);
	box-shadow: 0 14px 40px rgba(12,14,20,0.18);
	padding: 32px 32px 28px 32px;
	box-sizing: border-box;
	border: 1px solid rgba(15,23,42,0.12);
	backdrop-filter: blur(6px);
	-webkit-backdrop-filter: blur(6px);
	position: relative;
	z-index: 30;
}
.owner-card h1 {
	margin: 0 0 22px 0;
	font-size: 22px;
	font-weight: 700;
	color: var(--accent);
	text-align: center;
	letter-spacing: -0.5px;
}
.owner-form {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.owner-form .form-group {
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.owner-form input[type="text"] {
	width: 100%;
	padding: 10px 12px;
	font-size: 15px;
	border-radius: 8px;
	border: 1px solid #aaaaaa;
	background: linear-gradient(180deg, rgba(245,245,245,0.95), rgba(235,235,235,0.95));
	box-sizing: border-box;
	box-shadow: inset 0 3px 8px rgba(0,0,0,0.10);
	color: var(--text);
	transition: box-shadow 150ms, border-color 150ms, transform 80ms;
}
.owner-form input[type="text"]:focus {
	outline: none;
	border-color: var(--accent);
	box-shadow: 0 6px 18px rgba(69,90,100,0.10);
	transform: translateY(-1px);
}
.owner-form input::placeholder {
	color: rgba(15,23,42,0.55);
	opacity: 1;
}
.owner-form input[type="file"] {
	width: 100%;
	padding: 10px 12px;
	font-size: 15px;
	border-radius: 8px;
	border: 1px solid #aaaaaa;
	background: linear-gradient(180deg, rgba(245,245,245,0.95), rgba(235,235,235,0.95));
	box-sizing: border-box;
	box-shadow: inset 0 3px 8px rgba(0,0,0,0.10);
	color: var(--text);
	transition: box-shadow 150ms, border-color 150ms, transform 80ms;
	margin-bottom: 4px;
}
.owner-form input[type="file"]:focus {
	outline: none;
	border-color: var(--accent);
	box-shadow: 0 6px 18px rgba(69,90,100,0.10);
	transform: translateY(-1px);
}
.owner-form select {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid #aaaaaa;
  background: linear-gradient(180deg, rgba(245,245,245,0.95), rgba(235,235,235,0.95));
  box-sizing: border-box;
  color: var(--text);
  transition: box-shadow 150ms, border-color 150ms, transform 80ms;
  margin-bottom: 4px;
}
.owner-form select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(69,90,100,0.10);
  transform: translateY(-1px);
}
.owner-form .form-group img {
	border: 2px solid var(--accent);
	background: #fff;
	margin-top: 6px;
	max-width: 100%;
	max-height: 140px;
	border-radius: 10px;
	box-shadow: 0 2px 12px #0002;
	object-fit: contain;
	transition: box-shadow 0.2s;
}
.owner-form .form-group img:hover {
	box-shadow: 0 4px 24px #0003;
}
.owner-btn {
	width: 100%;
	padding: 12px 0;
	font-size: 1.13rem;
	font-weight: 700;
	color: #fff;
	background: linear-gradient(90deg, var(--accent), var(--accent-600));
	border: none;
	border-radius: 10px;
	box-shadow: 0 4px 16px rgba(229,57,53,0.10);
	cursor: pointer;
	margin-top: 8px;
	transition: background 0.18s, box-shadow 0.18s, transform 0.12s;
}
.owner-btn:hover {
	background: linear-gradient(90deg, var(--accent-600), var(--accent));
	transform: translateY(-2px);
}
@media (max-width: 700px) {
	.owner-root {
		flex-direction: column;
	}
	.owner-sidebar {
		width: 100%;
		min-height: unset;
		border-right: none;
		border-bottom: 1.5px solid #eee;
		box-shadow: none;
		padding: 18px 0 0 0;
	}
	.owner-content {
		padding: 18px 0;
	}
	.owner-card {
		padding: 18px 8px 18px 8px;
		border-radius: 12px;
	}
}
</style>

<style scoped>
.owner-commands { margin-top: 20px; background: linear-gradient(180deg, #fff, #fff); padding: 12px; border-radius: 10px; box-shadow: 0 8px 24px rgba(12,14,20,0.04); }
.owner-commands h2 { margin: 0 0 10px 0; color: var(--accent); font-size:1.05rem }
.owner-commands ul { list-style:none; margin:0; padding:0 }
.owner-commands li { padding:10px 12px; border-bottom:1px solid rgba(15,23,42,0.04); display:block }
.owner-commands .price { font-weight:700 }
.owner-commands button { padding:8px 10px; border-radius:8px; border:none; cursor:pointer }
.owner-commands button:hover { transform: translateY(-1px) }
.owner-commands button[style] { margin-left:6px }
</style>
