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
      const obj = {
        [this.view === 'vertical' ? 'width' : 'height']: `${this.boundSplit}%`
      }
      return obj
    },
    rightStyles () {
      const obj = {
        [this.view === 'vertical' ? 'width' : 'height']: `${100 - this.boundSplit}%`
      }
      return obj
    },
    classes () {
      return [
        { dragging: this.dragging },
        this.view
      ]
    },
    boundSplit () {
      const split = this.split
      if (split < 20) {
        return 20
      } else if (split > 80) {
        return 80
      } else {
        return split
      }
    }
  },
  methods: {
    dragStart (e) {
      this.dragging = true
      this.startPosition = this.view === 'vertical' ? e.pageX : e.pageY
      this.startSplit = this.boundSplit
    },
    dragMove (e) {
      if (this.dragging) {
        let position
        let totalSize
        if (this.view === 'vertical') {
          position = e.pageX
          totalSize = this.$el.offsetWidth
        } else {
          position = e.pageY
          totalSize = this.$el.offsetHeight
        }
        const dPosition = position - this.startPosition
        this.split = this.startSplit + ~~(dPosition / totalSize * 100)
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

  &.dragging
    .left,
    .right
      pointer-events none
    &.vertical
      cursor ew-resize
    &.horizontal
      cursor ns-resize

.left,
.right
  position relative

.horizontal
  .bottom
    box-shadow 0 -2px 10px rgba(0, 0, 0, 0.1)
    border-top 1px solid $border-color
    .dark &
      border-top 1px solid $dark-border-color

.vertical
  .left
    border-right 1px solid $border-color
    .dark &
      border-right 1px solid $dark-border-color

.dragger
  position absolute
  z-index 99

  .vertical &
    top 0
    bottom 0
    right -5px
    width 10px
    cursor ew-resize

  .horizontal &
    left 0
    right 0
    bottom -5px
    height 10px
    cursor ns-resize

</style>
