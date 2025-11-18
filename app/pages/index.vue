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
      <form @submit.prevent="handleLogin()">
        <div class="form-group">
          <label for="username">Username: </label>
          <input type="text" id="username" v-model="username" required placeholder="Entrez votre nom d'utilisateur" />
        </div>

        <div class="form-group">
          <label for="password">Password: </label>
          <input type="password" id="password" v-model="password" required placeholder="Entrez votre mot de passe" />
        </div>

        <div class="form-group" v-if="error" style="color:var(--error, #c00);">
          {{ error }}
        </div>

        <div class="form-group" v-if="loading">
          <div class="loading"><span class="spinner" aria-hidden></span> Signing in…</div>
        </div>

        <div class="form-group">
          <button type="submit" :disabled="loading">{{ loading ? 'Logging in...' : 'Login' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Build slides array from images in public/images/home
const slides = [
  '/images/home/home_jap.jpg',
  '/images/home/menu_burger.jpg',
  '/images/home/menu_maroc.jpg',
  '/images/home/menu_pizza.jpg',
]

function handleLogin() {
  // minimal stub to avoid compile errors; replace with real logic
  loading.value = true
  error.value = ''
  setTimeout(() => {
    loading.value = false
  }, 800)
}

// Carousel control: show each image for 5s then move to next, loop
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

<style src="../assets/css/style.css"></style>

