<script setup lang="ts">
const config = useRuntimeConfig();

console.log(config.public.apiUrl);
</script>
<template>
  <div>
    <NuxtLayout><NuxtPage /></NuxtLayout>
  </div>
</template>