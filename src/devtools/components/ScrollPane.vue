<template>
  <div class="scroll-pane">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div ref="scrollContainer" class="scroll">
      <slot name="scroll"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    scrollEvent: String
  },
  mounted () {
    if (this.scrollEvent) {
      bridge.on(this.scrollEvent, this.scroll)
    }
  },
  destroyed () {
    if (this.scrollEvent) {
      bridge.removeListener(this.scrollEvent, this.scroll)
    }
  },
  methods: {
    scroll () {
      this.$nextTick(() => {
        const container = this.$refs.scrollContainer
        if (container.children.length) {
          container.scrollTop = container.children[0].offsetHeight
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../common"

.scroll-pane
  display flex
  flex-direction column
  height 100%

.scroll
  flex 1
  overflow overlay
  .app.dark &::-webkit-scrollbar
    background: $dark-background-color
    border-left: 1px solid $dark-border-color
  .app.dark &::-webkit-scrollbar-thumb
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
</style>
