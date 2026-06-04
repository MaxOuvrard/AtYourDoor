<template>
  <Header />
  <div class="auth-bg page-root">

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
      <h1 class="auth-card__title">{{ $t('register.title') }}</h1>
      <p class="auth-card__sub">Rejoignez AtYourDoor et commandez en quelques clics.</p>

      <div v-if="error" class="auth-error">{{ error }}</div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">{{ $t('register.name') }}</label>
          <input type="text" id="name" v-model="form.name" required :placeholder="$t('register.name')" />
        </div>
        <div class="form-group">
          <label for="email">{{ $t('register.email') }}</label>
          <input type="email" id="email" v-model="form.email" required placeholder="exemple@email.com" autocomplete="email" />
        </div>
        <div class="form-group">
          <label for="password">{{ $t('register.password') }}</label>
          <input type="password" id="password" v-model="form.password" required :placeholder="$t('register.password_placeholder')" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">{{ $t('register.confirmPassword') }}</label>
          <input type="password" id="confirmPassword" v-model="form.confirmPassword" required :placeholder="$t('register.confirmPassword_placeholder')" />
        </div>
        <div class="form-group">
          <label for="role">{{ $t('register.role') }}</label>
          <select id="role" v-model="form.role" required>
            <option value="USER">{{ $t('register.role_user') }}</option>
          </select>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          style="width:100%;padding:13px;font-size:0.95rem;border-radius:12px;margin-top:4px;"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Création en cours…' : $t('register.submit') }}
        </button>
      </form>

      <div class="auth-card__footer">
        Déjà un compte ? <NuxtLink to="/login">Se connecter</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/userStore'
import { useSeoMeta } from 'nuxt/app'
import { friendlyError } from '../../../utils/errors'

useSeoMeta({
  title: "Créer un compte - AtYourDoor",
  description: "Créez votre compte AtYourDoor pour commander vos plats préférés.",
  ogTitle: "Créer un compte - AtYourDoor",
  ogImage: "/images/home/home_jap.jpg",
  twitterCard: "summary_large_image"
})

const router = useRouter()
const userStore = useUserStore()

const form = ref({ name: '', email: '', password: '', confirmPassword: '', role: 'USER' })
const loading = ref(false)
const error = ref('')

const slides = [
  '/images/home/home_jap.jpg',
  '/images/home/menu_burger.jpg',
  '/images/home/menu_maroc.jpg',
  '/images/home/menu_pizza.jpg',
]

async function handleRegister() {
  error.value = ''
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  loading.value = true
  try {
    const res: any = await userStore.register(
      form.value.name,
      form.value.email,
      form.value.password,
      form.value.role
    )
    if (res && 'error' in res && res.error) {
      error.value = String(res.error)
      return
    }
    const role = userStore.user?.role
    if (role === 'OWNER') await router.push('/owner')
    else if (role === 'ADMIN') await router.push('/admin')
    else await router.push('/restaurants')
  } catch (e: any) {
    error.value = friendlyError(e, 'Erreur lors de la création du compte.')
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
