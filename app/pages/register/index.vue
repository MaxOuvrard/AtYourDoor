<template>
  <Header />
  <div class="register-page-center">
    <div class="register-container">
      <h1>{{ $t('register.title') }}</h1>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="name">{{ $t('register.name') }}</label>
          <input v-model="form.name" type="text" id="name" required />
        </div>
        <div class="form-group">
          <label for="email">{{ $t('register.email') }}</label>
          <input v-model="form.email" type="email" id="email" required placeholder="exemple@email.com" autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="password">{{ $t('register.password') }}</label>
          <input v-model="form.password" type="password" id="password" required :placeholder="$t('register.password_placeholder')" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">{{ $t('register.confirmPassword') }}</label>
          <input v-model="form.confirmPassword" type="password" id="confirmPassword" required :placeholder="$t('register.confirmPassword_placeholder')" />
        </div>
        <div class="form-group">
          <label for="role">{{ $t('register.role') }}</label>
          <select v-model="form.role" id="role" required>
            <option value="USER">{{ $t('register.role_user') }}</option>
          </select>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <button type="submit">{{ $t('register.submit') }}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/userStore';
import { useSeoMeta } from 'nuxt/app';

useSeoMeta({
	title: "Inscription - AtYourDoor",
	description: "Créez un compte sur AtYourDoor pour commander vos plats préférés et profiter de la livraison à domicile.",
	ogTitle: "Inscription - AtYourDoor",
	ogDescription: "Rejoignez AtYourDoor et accédez à la meilleure plateforme de livraison de repas.",
	ogImage: "/images/home/home_jap.jpg",
	twitterCard: "summary_large_image"
});

const router = useRouter();
const userStore = useUserStore();
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'USER'
});
const error = ref('');

const register = async () => {
  error.value = '';
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }
  try {
    const res = await userStore.register(
      form.value.name,
      form.value.email,
      form.value.password,
      form.value.role
    );
    if (res && (res as any).error) {
      error.value = (res as any).error;
      return;
    }
    router.push('/login');
  } catch (e) {
    error.value = "Erreur lors de l'inscription.";
  }
};
</script>

<style scoped>
.register-page-center {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
}
.register-container {
	max-width: 400px;
	width: 100%;
	margin: 0;
	padding: 2rem;
	background: var(--card, #fff);
	border-radius: var(--radius, 10px);
	box-shadow: var(--shadow, 0 2px 8px rgba(69,90,100,0.08));
	font-family: 'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}
.form-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 1.2rem;
}
label {
	font-size: 13px;
	color: #000;
	font-weight: 500;
	margin-bottom: 0.4rem;
}
input[type="text"],
input[type="password"],
input[type="email"],
select {
	width: 100%;
	padding: 10px 12px;
	font-size: 15px;
	border-radius: 8px;
	border: 1px solid #aaaaaa;
	background: linear-gradient(180deg, rgba(245,245,245,0.95), rgba(235,235,235,0.95));
	box-sizing: border-box;
	transition: box-shadow 150ms ease, border-color 150ms ease, transform 80ms ease;
	color: var(--text);
	font-family: inherit;
}
input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus,
select:focus {
	outline: none;
	border-color: var(--accent);
	box-shadow: 0 6px 18px rgba(69,90,100,0.10);
	transform: translateY(-1px);
	background: #fff;
}
input::placeholder {
	color: rgba(15,23,42,0.55);
	opacity: 1;
}
button {
	width: 100%;
	padding: 0.7rem;
	background: linear-gradient(180deg, var(--accent), var(--accent-600));
	color: #fff;
	border: none;
	border-radius: 10px;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.2s, transform 120ms, box-shadow 120ms, opacity 120ms;
	box-shadow: 0 8px 20px rgba(69,90,100,0.10);
}
button:hover {
	background: linear-gradient(180deg, var(--accent-600), var(--accent));
	transform: translateY(-2px);
}
.error {
	color: var(--error, #d32f2f);
	margin-bottom: 1rem;
	text-align: center;
	font-weight: 600;
}
</style>
