<template>
  <div class="scroll-pane">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="scroll">
      <slot name="scroll"></slot>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../common"

.scroll-pane
  display flex
  flex-direction column
  height 100%

.scroll
  flex 1
  overflow overlay

// Keeping this here in case `overflow: overlay`
// doesn't float everyone's boat.
.scroll--themed
  &::-webkit-scrollbar
    width 5px
    height 0
    &-thumb
      background $active-color
</style>