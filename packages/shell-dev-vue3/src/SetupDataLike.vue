<script>
export default {
  setup () {
    return {
      msg: 'hello from script src!'
    }
  }
}
</script>

<template>
  <div>
    <div>{{ msg }}</div>
    <input v-model="msg">
  </div>
</template>
