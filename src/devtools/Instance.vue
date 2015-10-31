<template>
  <div class="instance" :class="{ inactive: instance.inactive }">
    <div class="self"
      @click.stop="select"
      :class="{ selected: selected }"
      :style="{ paddingLeft: depth * 15 + 'px' }">
      <span class="content">
        <span class="arrow right"
          :class="{ rotated: expanded }"
          v-if="instance.children.length"
          @click.stop="expanded = !expanded">
        </span>
        <span class="angle-bracket">&lt;</span><span class="instance-name">{{ instance.name }}</span><span class="angle-bracket">&gt;</span>
      </span>
      <span>{{ instance.inactive ? '(inactive)' : '' }}</span>
    </div>
    <div class="children" v-show="expanded" transition="slide">
      <instance
        v-for="child in instance.children | orderBy 'inactive'"
        track-by="id"
        :instance="child"
        :depth="depth + 1">
      </instance>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Instance',
  props: {
    instance: Object,
    depth: Number
  },
  data () {
    return {
      expanded: this.instance.name === 'Root',
      selected: false
    }
  },
  methods: {
    select () {
      this.$dispatch('selected', this)
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
  font-size 14px
  line-height 22px
  height 22px
  &:hover
    background-color #E5F2FF
  &.selected
    background-color #44A1FF
    .instance-name
      color #fff

.children
  position relative
  z-index 1

.content
  position relative
  padding-left 22px

.arrow
  transition transform .1s ease-in-out
  display inline-block
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

.slide-transition
  transition all .2s ease
  transform-origin top center
  transform translate3d(0,0,0)
  opacity 1

.slide-enter, .slide-leave
  opacity 0
  transform translate3d(0, -10px, 0)
</style>
