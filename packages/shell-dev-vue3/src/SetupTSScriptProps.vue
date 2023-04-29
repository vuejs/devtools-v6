<script lang="ts" setup>
const props = defineProps<{
  myProp: string
}>()
</script>

<template>
  <pre>{{ props }}</pre>
</template>
