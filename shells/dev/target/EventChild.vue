<template>
  <div>
    <button @click="emitEvent">Emit</button>
    <button @click="emitEvent1">Emit</button>
    <button @click="emitEvent2">Emit</button>
  </div>
</template>

<script>
export default {
  methods: {
    emitEvent () {
      let data = {
        eventName: 'event'
      }
      this.$emit('event', data)
    },
    emitEvent1 () {
      let data = {
        eventName: 'event-1'
      }
      this.$emit('event-1', data)
    },
    emitEvent2 () {
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
    }
  }
}
</script>
