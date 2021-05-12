
<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  inject: [
    'currentSettingsVersion'
  ],

  props: {
    version: {
      type: Number,
      required: true
    }
  }
})
</script>

<template>
  <div
    v-if="version > currentSettingsVersion"
    class="new-tag"
  >
    New
  </div>
</template>

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
