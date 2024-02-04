<template>
  <div class="vue-ui-icon">
    <svg>
      <use :href="`#ic_${icon}_standard`" />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
})
</script>
