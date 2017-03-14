<template>
  <div class="events box">
    <h2>Events</h2>
    <p>Component for testing events in different components (see <b>Events Tab</b> in Dev-Tools).</p>
    <div class="actions"> 
      <event-level-one @event="log" @event-1="log" @event-2="log"></event-level-one>
      <button @click="toggleCond = !toggleCond">Toggle Cond</button>
      <event-conditional v-if="toggleCond" @log="log"></event-conditional>
    </div>
  </div>
</template>

<script>

import EventLevelOne from './EventLevelOne.vue'
import EventConditional from './EventConditional.vue'

export default {
  components: {
    EventLevelOne,
    EventConditional
  },
  data() {
    return {
      toggleCond: false
    }
  },
  methods: {
    log (data) {
      console.log('Event fired from child component with data', data)
    }
  }
}
</script>
