<template>
  <div class="split-pane"
    @mousemove="dragMove"
    @mouseup="dragEnd"
    @mouseleave="dragEnd"
    :class="classes">
    <div class="left top" :style="leftStyles">
      <slot name="left"></slot>
      <div class="dragger" @mousedown.prevent="dragStart"></div>
    </div>
    <div class="right bottom" :style="rightStyles">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      split: 50,
      dragging: false
    }
  },
  computed: {
    ...mapState([
      'view'
    ]),
    leftStyles () {
      return this.view === 'vertical'
        ? { width: `${this.split}%` }
        : 'auto'
    },
    rightStyles () {
      return this.view === 'vertical'
        ? { width: `${100 - this.split}%` }
        : 'auto'
    },
    classes () {
      return [
        { dragging: this.dragging },
        this.view
      ]
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
@import "../variables"

.split-pane
  display flex
  height 100%
  &.horizontal
    flex-direction column
    .top, .bottom
      height 50%

  &.dragging
    cursor ew-resize

.left, .right
  position relative

&.horizontal
  .dragger
    pointer-events none

  .bottom
    box-shadow 0 -2px 10px rgba(0, 0, 0, 0.1)
    border-top 1px solid $border-color
    .app.dark &
      border-top 1px solid $dark-border-color

&.vertical
  .left
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
