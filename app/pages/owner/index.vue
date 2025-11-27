<template>
    <Header />
	<div class="owner-root">
		<div class="owner-content" style="width:100vw;">
			<div class="owner-card">
				<h1>{{ $t('owner.title') }}</h1>
				<form class="owner-form">
					<div class="form-group">
						<input type="text" v-model="name" :placeholder="$t('owner.name_placeholder')" />
					</div>
					<div class="form-group">
						<input type="text" v-model="address" :placeholder="$t('owner.address_placeholder')" />
					</div>
					<div class="form-group">
						<input type="text" v-model="postal" :placeholder="$t('owner.postal_placeholder')" />
					</div>
					<div class="form-group">
						<input type="text" v-model="city" :placeholder="$t('owner.city_placeholder')" />
					</div>
					<button type="button" class="owner-btn" @click="updateRestaurant">{{ $t('owner.update_btn') }}</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const name = ref('Le clos des sens')
const address = ref('13 Rue Jean Mermoz')
const postal = ref('74000')
const city = ref('Annecy')

function updateRestaurant() {
	// Ajoute ici la logique de sauvegarde
	alert('Restaurant modifié !')
}
</script>


<style scoped>
.owner-root {
	min-height: 100vh;
	background: var(--bg);
	font-family: 'Poppins', Inter, system-ui, Arial, sans-serif;
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
