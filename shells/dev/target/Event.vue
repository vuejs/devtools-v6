<template>
  <div>
    <h1>Events</h1>
    <event-child @log="log"></event-child>
  </div>
</template>

<script>
import EventChild from './EventChild.vue'
export default {
  name: 'Event',
  components: { 
    EventChild 
  },
  methods: {
    log (data) {
      console.log('event fired from child component with data', data)
    }
  }
}
</script>
