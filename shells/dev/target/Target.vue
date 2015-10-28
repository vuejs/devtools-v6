<template>
  <div id="target">
    <h1>{{msg}}</h1>
    <input v-model="msg">
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: 'hello'
    }
  }
}
</script>
