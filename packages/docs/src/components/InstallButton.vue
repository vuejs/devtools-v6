<script lang="ts" setup>
// eslint-disable-next-line no-undef
defineProps<{
  logo: string
  label: string
  href: string
  external?: boolean
}>()
</script>

<template>
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    class="border border-gray-100 border-solid rounded flex items-center gap-4 p-4 hover:bg-green-100 hover:border-green-200 hover:no-underline"
  >
    <img
      :src="logo"
      class="max-w-8 max-h-8"
    >
    {{ label }}
  </a>
</template>
