<template>
  <div>
    <h1>Events</h1>
    <event-child @event="log" @event-1="log" @event-2="log"></event-child>
    <event-child-1 @log="log"></event-child-1>
  </div>
</template>

<script>
import EventChild from './EventChild.vue'
import EventChild1 from './EventChild1.vue'
export default {
  name: 'Event',
  components: { 
    EventChild,
    EventChild1
  },
  methods: {
    log (data) {
      console.log('Event fired from child component with data', data)
    }
  }
}
</script>
