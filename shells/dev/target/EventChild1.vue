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
      this.$emit('log')
    }
  }
}
</script>
