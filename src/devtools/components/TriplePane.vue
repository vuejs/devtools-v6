<template>
  <div style="height: 100%;">
    <div class="left" style="width: 20%; float: left; height: 100%; border-right: 1px solid #ddd;">
      <slot name="left"></slot>
    </div>
    <div style="width: 80%; float: right;" class="split-pane"
      @mousemove="dragMove"
      @mouseup="dragEnd"
      @mouseleave="dragEnd"
      :class="{ dragging: dragging }">
      <div class="middle" :style="{ width: split + '%' }">
        <slot name="middle"></slot>
        <div class="dragger" @mousedown="dragStart"></div>
      </div>
      <div class="right" :style="{ width: (100 - split) + '%' }">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      split: 50,
      dragging: false
    }
  },
  methods: {
    dragStart (e) {
      this.dragging = true
      this.startX = e.pageX
      this.startSplit = this.split
    },
    dragMove (e) {
      if (this.dragging) {
        const dx = e.pageX - this.startX
        const totalWidth = this.$el.offsetWidth
        this.split = this.startSplit + ~~(dx / totalWidth * 100)
      }
    },
    dragEnd () {
      this.dragging = false
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../common"

.split-pane
  display flex
  height 100%
  &.dragging
    cursor ew-resize

.middle, .right
  position relative

.middle
  border-right 1px solid $border-color
  .app.dark &
    border-right 1px solid $dark-border-color

.dragger
  position absolute
  z-index 99
  top 0
  bottom 0
  right -5px
  width 10px
  cursor ew-resize
</style>
