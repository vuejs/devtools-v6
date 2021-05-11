<script lang="ts">
import EmptyPane from '@front/features/layout/EmptyPane.vue'

import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  components: {
    EmptyPane
  }
})
</script>

<template>
  <EmptyPane
    icon="extension"
  >
    Devtools plugins
  </EmptyPane>
</template>
