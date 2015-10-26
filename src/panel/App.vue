<template>
<div class="app">
  <h1>Vue Devtools</h1>
  <p>{{message}}</p>
</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hi!'
    }
  }
}
</script>

<style scoped>
h1 {
  color: red;
}
</style>
