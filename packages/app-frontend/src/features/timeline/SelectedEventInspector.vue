<script>
import StateInspector from '../inspector/StateInspector.vue'

import { useInspectedEvent } from '.'

export default {
  components: { StateInspector },
  setup () {
    return {
      ...useInspectedEvent()
    }
  }
}
</script>

<template>
  <div v-if="inspectedEventState">
    <StateInspector
      :state="{
        'event info': inspectedEventState
      }"
    />
  </div>
</template>
