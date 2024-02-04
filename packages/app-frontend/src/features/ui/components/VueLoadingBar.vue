<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'VueLoadingBar',
  props: {
    value: {
      type: Number,
      default: 0,
    },
    unknown: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div
    class="vue-ui-loading-bar"
    :class="unknown && 'unknown'"
  >
    <div
      class="bar"
      :style="!unknown ? { width: `${value * 100}%` } : undefined"
    />
  </div>
</template>
