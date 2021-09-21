<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps<{
  myProp: string
}>()
</script>

<template>
  <pre>{{ props }}</pre>
</template>
