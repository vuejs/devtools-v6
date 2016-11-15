<template>
  <div>
    <button @click="emitLogEvent">Emit</button>
  </div>
</template>

<script>
export default {
  name: 'EventChild1',
  methods: {
    emitLogEvent () {
      let data = {
        componentName: 'EventChild1',
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
      this.$emit('log', this.eventData)
    }
  }
}
</script>