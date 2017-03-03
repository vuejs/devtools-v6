<template>
  <div style="height: 100%;" class="split-pane"
    @mousemove="dragMove"
    @mouseup="dragEnd"
    @mouseleave="dragEnd"
    :class="{ dragging: dragging }">
    <div class="left" :style="{ width: widthLeft + '%' }">
      <slot name="left"></slot>
      <div class="dragger" @mousedown="dragStartLeft"></div>
    </div>
    <div class="middle" :style="{ width: widthMiddle + '%' }">
      <slot name="middle"></slot>
      <div class="dragger" @mousedown="dragStartRight"></div>
    </div>
    <div class="right" :style="{ width: widthRight + '%' }">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      widthLeft: 20,
      widthMiddle: 40,
      widthRight: 40,
      draggingLeft: false,
      draggingRight: false
    }
  },
  computed: {
    dragging () {
      return this.draggingLeft && this.draggingRight
    }
  },
  methods: {
    dragStartLeft (e) {
      this.draggingLeft = true
      this.startXLeft = e.pageX
      this.startSplitLeft = this.widthLeft
      this.startSplitMiddle = this.widthMiddle
    },
    dragStartRight (e) {
      this.draggingRight = true
      this.startXRight = e.pageX
      this.startSplitRight = this.widthRight
      this.startSplitMiddle = this.widthMiddle
    },
    dragMove (e) {
      if (this.draggingLeft) {
        const diff = this.getDiff(e, this.startXLeft)
        this.widthLeft = this.startSplitLeft + diff
        this.widthMiddle = this.startSplitMiddle - diff
      }
      if (this.draggingRight) {
        const diff = this.getDiff(e, this.startXRight)
        this.widthMiddle = this.startSplitMiddle + diff
        this.widthRight = this.startSplitRight - diff
      }
    },
    getDiff (e, start) {
      const dx = e.pageX - start
      const totalWidth = this.$el.offsetWidth
      return ~~(dx / totalWidth * 100)
    },
    dragEnd () {
      this.draggingLeft = false
      this.draggingRight = false
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

.left, .right, .middle
  position relative

.left, .middle
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
