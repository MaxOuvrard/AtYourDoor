<template>
  <div class="auth-bg page-root">

    <!-- Carousel background -->
    <div class="bg-carousel" aria-hidden="true">
      <div
        v-for="(img, i) in slides" :key="i"
        :class="['slide', { active: i === currentIndex }]"
        :style="{ backgroundImage: `url('${img}')` }"
      ></div>
      <div class="bg-overlay"></div>
    </div>

    <div class="auth-card">
      <div class="auth-card__logo">
        <img src="/images/Logo_header.png" alt="AtYourDoor" />
      </div>
      <h1 class="auth-card__title">{{ $t('login.title') }}</h1>
      <p class="auth-card__sub">Bon retour ! Connectez-vous à votre compte.</p>

      <div v-if="error" class="auth-error">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">{{ $t('login.username') }}</label>
          <input type="text" id="username" v-model="username" required :placeholder="$t('login.username_placeholder')" />
        </div>
        <div class="form-group">
          <label for="password">{{ $t('login.password') }}</label>
          <input type="password" id="password" v-model="password" required :placeholder="$t('login.password_placeholder')" />
        </div>

        <button type="submit" class="btn btn-primary" style="width:100%;padding:13px;font-size:0.95rem;border-radius:12px;margin-top:4px;" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? $t('login.logging_in') : $t('login.login_btn') }}
        </button>
      </form>

      <div class="auth-card__footer">
        Pas encore de compte ? <NuxtLink to="/register">Créer un compte</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/userStore'
import { useSeoMeta } from 'nuxt/app';

useSeoMeta({
  title: "Connexion - AtYourDoor",
  description: "Connectez-vous à votre compte AtYourDoor.",
  ogTitle: "Connexion - AtYourDoor",
  ogImage: "/images/home/home_jap.jpg",
  twitterCard: "summary_large_image"
});

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const slides = [
  '/images/home/home_jap.jpg',
  '/images/home/menu_burger.jpg',
  '/images/home/menu_maroc.jpg',
  '/images/home/menu_pizza.jpg',
]

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const res: any = await userStore.login(username.value, password.value)
    if (res && typeof res === 'object' && 'error' in res && res.error) {
      try { error.value = typeof res.error === 'string' ? t(res.error as string) : String(res.error) }
      catch { error.value = String(res.error) }
      return
    }
    const role = userStore.user?.role
    if (role === 'OWNER') await router.push('/owner')
    else if (role === 'ADMIN') await router.push('/admin')
    else if (role) await router.push('/restaurants')
    else error.value = 'Erreur inconnue.'
  } catch (e: any) {
    error.value = e?.message || 'Erreur lors de la connexion.'
  } finally {
    loading.value = false
  }
}

const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  document?.body?.classList?.add('no-scroll')
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % slides.length
  }, 5000)
})
onUnmounted(() => {
  document?.body?.classList?.remove('no-scroll')
  if (intervalId) clearInterval(intervalId)
})
</script>

<style src="../../assets/css/style.css"></style>
