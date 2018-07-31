<template>
  <div id="init">
    <p>Inited: {{ initCount }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      initCount: state => state.initCount
    })
  },
  created() {
    this.$store.commit('TEST_INIT')
  }
}
</script>
