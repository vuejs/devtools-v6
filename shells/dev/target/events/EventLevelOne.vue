<template>
  <div>
    <button @click="emitEvent">Emit From L1</button>
    <button @click="emitEventWithComplexData">Emit From L1 w. compl.</button>
    <event-level-two @log="log"></event-level-two>
  </div>
</template>

<script>

import EventLevelTwo from './EventLevelTwo.vue'

export default {
  components: {
    EventLevelTwo
  },
  methods: {
    emitEvent () {
      this.$emit('event', {
        eventName: 'event'
      })
    },
    emitEventWithComplexData () {
      let complexData = {
        componentName: 'EventChild',
        string: 'Lorem ipsum',
        complex: {
          string: 'Lorem ipsum',
          object: {
            number: 23,
            boolean: true,
            array: [1,2,3,4,5]
          }
        }
      }
      this.$emit('event-2', complexData)
    },
    log (data) {
      console.log('Event fired from child component with data', data)
    }
  }
}
</script>
