<template>
  <div>
    <button @click="emitLogEvent">Emit</button>
  </div>
</template>

<script>
export default {
  methods: {
    emitLogEvent () {
      this.$emit('log')
    }
  }
}
</script>
