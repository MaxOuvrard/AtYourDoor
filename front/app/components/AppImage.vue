<template>
  <picture>
    <source v-if="srcAvif" :srcset="srcAvif" type="image/avif" @error="hideAvif" />
    <source v-if="srcWebp && showWebp" :srcset="srcWebp" type="image/webp" @error="hideWebp" />
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      loading="lazy"
      decoding="async"
      v-bind="$attrs"
    />
  </picture>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  src: string
  alt?: string
  width?: number | string
  height?: number | string
}>()

defineOptions({ inheritAttrs: false })

const isJpeg = computed(() => /\.(jpg|jpeg)$/i.test(props.src))

const srcWebp = computed(() =>
  isJpeg.value ? props.src.replace(/\.(jpg|jpeg)$/i, '.webp') : ''
)
const srcAvif = computed(() =>
  isJpeg.value ? props.src.replace(/\.(jpg|jpeg)$/i, '.avif') : ''
)

const showWebp = ref(true)
function hideAvif(e: Event) { (e.target as HTMLSourceElement).remove() }
function hideWebp() { showWebp.value = false }
</script>

<style scoped>
picture { display: contents; }
img { display: block; }
</style>
