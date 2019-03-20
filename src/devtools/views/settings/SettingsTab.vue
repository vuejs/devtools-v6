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
    padding 12px 4px

    > *
      flex-basis 300px
      margin 16px 24px

    .vue-ui-form-field
      > .wrapper > .content
       min-height 32px
       justify-content center
</style>
