<template>
  <Header />
  <div>
    <!-- Carousel background -->
    <div class="bg-carousel" aria-hidden="true">
      <div
        v-for="(img, i) in slides" :key="i"
        :class="['slide', { active: i === currentIndex }]"
        :style="{ backgroundImage: `url('${img}')` }"
      ></div>
      <div class="bg-overlay"></div>
    </div>

    <!-- Hero -->
    <div class="hero">
      <span class="hero-eyebrow">🍽️ Livraison à domicile</span>
      <h1>La nourriture que<br>vous aimez, livrée</h1>
      <p>Découvrez des centaines de restaurants près de chez vous et commandez en quelques clics.</p>
      <div class="hero-actions">
        <NuxtLink to="/restaurants">
          <button class="btn btn-primary btn-xl">Voir les restaurants</button>
        </NuxtLink>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <strong>200+</strong>
          <span>Restaurants</span>
        </div>
        <div class="hero-stat">
          <strong>30 min</strong>
          <span>Livraison moy.</span>
        </div>
        <div class="hero-stat">
          <strong>24/7</strong>
          <span>Disponible</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const slides = [
  '/images/home/home_jap.jpg',
  '/images/home/menu_burger.jpg',
  '/images/home/menu_maroc.jpg',
  '/images/home/menu_pizza.jpg',
]

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

<style src="../assets/css/style.css"></style>
