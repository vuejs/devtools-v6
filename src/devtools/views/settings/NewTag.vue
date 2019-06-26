<template>
  <div
    v-if="version > currentSettingsVersion"
    class="new-tag"
  >
    New
  </div>
</template>

<script>
export default {
  inject: [
    'currentSettingsVersion'
  ],

  props: {
    version: {
      type: Number,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
.new-tag
  display inline-block
  background $vue-ui-color-info
  color $vue-ui-color-light
  font-size 9px
  font-weight bold
  text-transform uppercase
  padding 1px 3px
  border-radius $br
</style>
