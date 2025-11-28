<template>
  <Header />
  <div class="page-root">
    
    <!-- Background carousel (behind content) -->
      <div class="bg-carousel" aria-hidden="true">
        <div
          v-for="(img, i) in slides"
          :key="i"
          :class="['slide', { active: i === currentIndex }]"
          :style="{ backgroundImage: `url('${img}'), linear-gradient(135deg, rgba(229,57,53,0.25), rgba(255,143,0,0.15))` }"
        ></div>
        <div class="bg-overlay"></div>
      </div>
    
    <div class="login-container">
      <h1>{{ $t('login.title') }}</h1>
      <form @submit.prevent="handleLogin()">
        <div class="form-group">
          <label for="username">{{ $t('login.username') }}</label>
          <input type="text" id="username" v-model="username" required :placeholder="$t('login.username_placeholder')" />
        </div>

        <div class="form-group">
          <label for="password">{{ $t('login.password') }}</label>
          <input type="password" id="password" v-model="password" required :placeholder="$t('login.password_placeholder')" />
        </div>

        <div class="form-group" v-if="error" style="color:var(--error, #c00);">
          {{ error }}
        </div>

        <div class="form-group" v-if="loading">
          <div class="loading"><span class="spinner" aria-hidden></span> {{ $t('login.signing_in') }}</div>
        </div>

        <div class="form-group">
          <button type="submit" :disabled="loading">{{ loading ? $t('login.logging_in') : $t('login.login_btn') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/userStore'
import { useSeoMeta } from 'nuxt/app';

useSeoMeta({
  title: "Connexion - AtYourDoor",
  description: "Connectez-vous à votre compte AtYourDoor pour accéder à vos commandes et restaurants favoris.",
  ogTitle: "Connexion - AtYourDoor",
  ogDescription: "Accédez à votre espace personnel sur AtYourDoor, la plateforme de livraison de repas.",
  ogImage: "/images/home/home_jap.jpg",
  twitterCard: "summary_large_image"
});

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()
const userStore = useUserStore()

// Build slides array from images in public/images/home
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
    // Si l'API retourne une erreur explicite
    if (res && typeof res === 'object' && 'error' in res && res.error) {
      error.value = res.error
      return
    }
    // Si le store a bien été mis à jour, on utilise userStore.user
    const role = userStore.user?.role
    if (role === 'OWNER') {
      await router.push('/owner')
    } else if (role === 'ADMIN') {
      await router.push('/admin')
    } else if (role) {
      await router.push('/restaurants')
    } else {
      error.value = "Erreur inconnue."
    }
  } catch (e: any) {
    error.value = e?.message || 'Erreur lors de la connexion.'
  } finally {
    loading.value = false
  }
}

// Carousel control: show each image for 15s then move to next, loop
const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  document?.body?.classList?.add('no-scroll')
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % slides.length
  }, 15000) // 15 seconds per slide
})
onUnmounted(() => {
  document?.body?.classList?.remove('no-scroll')
  if (intervalId) clearInterval(intervalId)
})
</script>

<style src="../../assets/css/style.css"></style>

