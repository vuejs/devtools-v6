<script setup>
// eslint-disable-next-line no-undef
defineEmits([
  'foo',
])
</script>

<template>
  <div style="display: inline-block;">
    <button @click="$emit('foo', 42, 'a')">
      Emit event
    </button>
  </div>
</template>
