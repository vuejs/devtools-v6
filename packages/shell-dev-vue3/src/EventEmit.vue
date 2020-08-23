<template>
  <div>
    <button @click="$emit('foo', 42, 'a')">
      Emit event
    </button>
  </div>
</template>
