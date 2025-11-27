<script setup lang="ts">
import { useUserStore } from '../stores/userStore'
const userStore = useUserStore()
userStore.initUserFromStorage()

const config = useRuntimeConfig();
console.log(config.public.apiUrl);
</script>
<template>
  <div>
    <NuxtLayout><NuxtPage /></NuxtLayout>
  </div>
</template>