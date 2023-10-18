<template>
  <VueButton v-close-popper="true" class="vue-ui-dropdown-button">
    <slot />
  </VueButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'VueDropdownButton',
})
</script>
