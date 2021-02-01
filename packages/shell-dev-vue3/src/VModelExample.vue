<script>
export default {
  data () {
    return {
      message: 'Hi!'
    }
  }
}
</script>

<template>
  <div>
    <input v-model="message">

    <p>{{ message }}</p>
  </div>
</template>
