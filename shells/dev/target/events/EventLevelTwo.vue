<template>
  <div>
    <button @click="emitLogEvent">Emit from L2</button>
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
