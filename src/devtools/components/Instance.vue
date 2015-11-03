<template>
  <div class="instance" :class="{ inactive: instance.inactive }">
    <div class="self"
      @click.stop="select"
      @mouseenter="enter"
      @mouseleave="leave"
      :class="{ selected: selected }"
      :style="{ paddingLeft: depth * 15 + 'px' }">
      <span class="content">
        <span class="arrow right"
          :class="{ rotated: expanded }"
          v-if="instance.children.length"
          @click.stop="toggle">
        </span>
        <span class="angle-bracket">&lt;</span><span class="instance-name">{{ instance.name }}</span><span class="angle-bracket">&gt;</span>
      </span>
      <span>{{ instance.inactive ? '(inactive)' : '' }}</span>
    </div>
    <div class="children"
      v-if="expanded"
      transition="expand"
      :style="{ height: height + 'px' }">
      <instance
        v-for="child in instance.children | orderBy 'inactive'"
        track-by="id"
        transition="expand"
        :instance="child"
        :depth="depth + 1">
      </instance>
    </div>
  </div>
</template>

<script>
const expansionMap = {}
let selectedInstance = null

export default {
  name: 'Instance',
  props: {
    instance: Object,
    depth: Number
  },
  data () {
    return {
      height: this.depth === 0 ? this.instance.children.length * 22 : 0,
      expanded: expansionMap[this.instance.id] || false,
      selected: selectedInstance && this.instance.id === selectedInstance.instance.id
    }
  },
  created () {
    if (this.selected) {
      selectedInstance = this
    }
  },
  methods: {
    select () {
      if (selectedInstance) {
        selectedInstance.selected = false
      }
      selectedInstance = this
      this.selected = true
      this.$dispatch('selected', this)
    },
    toggle () {
      this.expanded = !this.expanded
      expansionMap[this.instance.id] = this.expanded
      // trigger reflow in the tree component
      this.$dispatch('reflow')
    },
    enter () {
      bridge.send('enter-instance', this.instance.id)
    },
    leave () {
      bridge.send('leave-instance', this.instance.id)
    }
  }
}
</script>

<style lang="stylus" scoped>
.instance
  font-family Menlo, Consolas, monospace
  &.inactive
    opacity .5

.self
  cursor pointer
  position relative
  z-index 2
  background-color #fff
  transition background-color .1s ease
  border-radius 3px
  font-size 14px
  line-height 22px
  height 22px
  &:hidden
    display none
  &:hover
    background-color #E5F2FF
  &.selected
    background-color #44A1FF
    .arrow
      border-left-color #fff
    .instance-name
      color #fff

.children
  position relative
  z-index 1

.content
  position relative
  padding-left 22px

.arrow
  transition transform .1s ease, border-left-color .1s ease
  position absolute
  top 4px
  left 8px
  &.rotated
    transform rotate(90deg)

.angle-bracket
  color #ccc

.instance-name
  color #0062C3
  margin 0 1px
  transition color .1s ease

.children
  transform-origin top center
  transform translate3d(0,0,0)
  opacity 1

.expand-transition
  transition all .2s ease

.expand-enter, .expand-leave
  opacity 0
  transform translate3d(0, -22px, 0)
</style>
