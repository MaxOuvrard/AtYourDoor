<template>
  <picture>
    <source v-if="srcAvif" :srcset="srcAvif" type="image/avif" />
    <source v-if="srcWebp" :srcset="srcWebp" type="image/webp" />
    <img :src="src" :alt="alt" loading="lazy" decoding="async" :width="width" :height="height" />
  </picture>
</template>

<script setup lang="ts">
defineProps<{ src: string; alt?: string; width?: number | string; height?: number | string }>()
const props = defineProps<{ src: string; alt?: string; width?: number | string; height?: number | string }>()
const src = props.src
// Heuristic: try common alternative extensions
const srcWebp = src ? src.replace(/\.(png|jpg|jpeg)($|\?)/i, '.webp$2') : ''
const srcAvif = src ? src.replace(/\.(png|jpg|jpeg)($|\?)/i, '.avif$2') : ''
</script>

<style scoped>
img { display: block; width: 100%; height: auto; object-fit: cover; }
</style>
