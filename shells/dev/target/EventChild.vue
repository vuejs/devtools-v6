<template>
  <div>
    <button @click="emitEventWithObject">Emit event</button>
  </div>
</template>

<script>
export default {
  name: 'EventChild',
  data () {
    return {
      eventData: {
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
    }
  },
  methods: {
    emitEventWithObject () {
      this.$emit('log', this.eventData)
    }
  }
}
</script>