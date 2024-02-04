<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['object']),
  },
}
</script>

<template>
  <div id="vuex-object">
    <h2>Vuex Object</h2>
    <pre>{{ object }}</pre>
  </div>
</template>

<style scoped>

</style>
