<template>
  <div class="scroll-pane">
    <div class="header">
      <slot name="header" />
    </div>
    <div class="scroll">
      <slot
        v-if="defer(2)"
        name="scroll"
      />
    </div>
    <div
      v-if="$slots.footer"
      class="footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
import Defer from '@front/mixins/defer'

export default {
  mixins: [
    Defer()
  ]
}
</script>

<style lang="stylus" scoped>
.scroll-pane
  display flex
  flex-direction column
  height 100%

.scroll
  flex 1
  overflow auto
  &,
  >>> .vue-recycle-scroller
    .vue-ui-dark-mode &::-webkit-scrollbar
      background: $dark-background-color
      border-left: 1px solid $dark-border-color
    .vue-ui-dark-mode &::-webkit-scrollbar-thumb
      background: lighten($dark-background-color, 7%);
      border: 1px solid lighten($dark-border-color, 7%)

// Keeping this here in case `overflow: overlay`
// doesn't float everyone's boat.
.scroll--themed
  &::-webkit-scrollbar
    width 5px
    height 0
    &-thumb
      background $active-color

.footer
  border-top 1px solid $border-color
  .vue-ui-dark-mode &
    border-top-color $dark-border-color
</style>
