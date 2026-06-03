<script setup lang="ts">
import { useUserStore } from '../stores/userStore'
import { onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
userStore.initUserFromStorage()

const config = useRuntimeConfig();
console.log(config.public.apiUrl);

// Routes where we want to enforce "no scroll when content fits" by toggling body.no-scroll
const targetRoutes = ['/login']

function applyLoginScrollingLock() {
  try {
    if (typeof document === 'undefined') return
    const body = document.body
    const doc = document.documentElement
    const needsScroll = doc.scrollHeight > window.innerHeight
    if (!needsScroll) {
      body.classList.add('no-scroll')
    } else {
      body.classList.remove('no-scroll')
    }
  } catch (e) {}
}

function applyDefaultOverflow() {
  try {
    if (typeof document === 'undefined') return
    const body = document.body
    const doc = document.documentElement
    body.classList.remove('no-scroll')
    const needsScroll = doc.scrollHeight > window.innerHeight
    doc.style.overflowY = needsScroll ? 'auto' : 'hidden'
  } catch (e) {}
}

const route = useRoute()

function updateForRoute() {
  if (targetRoutes.includes(route.path)) {
    applyLoginScrollingLock()
  } else {
    applyDefaultOverflow()
  }
}

onMounted(() => {
  nextTick(updateForRoute)
  window.addEventListener('resize', updateForRoute)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateForRoute)
  try { if (typeof document !== 'undefined') document.documentElement.style.overflowY = '' } catch (e) {}
})

watch(() => route.fullPath, async () => { await nextTick(); updateForRoute() })

</script>

<template>
  <div>
    <a class="skip-link" href="#main-content">Aller au contenu</a>
    <NuxtLayout>
      <main id="main-content" class="page-offset"><NuxtPage /></main>
    </NuxtLayout>
  </div>
</template>

<style scoped>
/* Offset the page content so it isn't hidden under the fixed header. Adjust the value if header height changes. */
.page-offset {
  padding-top: 72px; /* space for header */
  padding-left: 16px;
  padding-right: 16px;
}

/* Skip link: initially hidden, visible on keyboard focus */
.skip-link {
  position: absolute;
  left: -999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-link:focus {
  left: 12px;
  top: 12px;
  width: auto;
  height: auto;
  padding: 8px 12px;
  background: #fff;
  color: #000;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  z-index: 200;
}

@media (max-width: 640px) {
  .page-offset { padding-top: 68px; padding-left: 12px; padding-right: 12px }
}
</style>
