<template>
  <div class="settings grid">
    <GlobalPreferences />
  </div>
</template>

<script>
import GlobalPreferences from './GlobalPreferences.vue'
import { mapState } from 'vuex'

export default {
  components: { GlobalPreferences },

  computed: mapState('events', [
    'enabled'
  ])
}
</script>

<style lang="stylus" scoped>
.settings
  >>> .preferences
    display flex
    flex-wrap wrap
    padding 1rem 1.5rem

    > *
      flex-basis 300px
      margin 10px 18px
</style>
