import { useUserStore } from '~/stores/userStore'

export default defineNuxtRouteMiddleware((to) => {
  // client-side authentication guard: init store from localStorage and redirect if no token
  if (process.server) return
  const userStore = useUserStore()
  userStore.initUserFromStorage()
  if (!userStore.isAuthenticated) {
    const redirectTo = encodeURIComponent(to.fullPath || '/')
    return navigateTo(`/login?redirect=${redirectTo}`)
  }
})
