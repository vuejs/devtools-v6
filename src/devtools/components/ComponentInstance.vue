<template>
  <div class="instance"
    :class="{
      inactive: instance.inactive,
      selected: selected
    }">
    <div class="self"
      @click.stop="select"
      @mouseenter="enter"
      @mouseleave="leave"
      :class="{ selected: selected }"
      :style="{ paddingLeft: depth * 15 + 'px' }">
      <span class="content">
        <!-- arrow wrapper for better hit box -->
        <span class="arrow-wrapper"
          v-if="instance.children.length"
          @click.stop="toggle()">
          <span class="arrow right" :class="{ rotated: expanded }">
          </span>
        </span>
        <span class="angle-bracket">&lt;</span><span class="instance-name">{{ instance.name }}</span><span class="angle-bracket">&gt;</span>
      </span>
      <span class="info router-view" v-if="instance.isRouterView">
        router-view{{ instance.matchedRouteSegment ? ': ' + instance.matchedRouteSegment : null }}
      </span>
      <span class="info fragment" v-if="instance.isFragment">
        fragment
      </span>
      <span class="info inactive" v-if="instance.inactive">
        inactive
      </span>
    </div>
    <div v-if="expanded">
      <component-instance
        v-for="child in sortedChildren"
        :key="child.id"
        :instance="child"
        :depth="depth + 1">
      </component-instance>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentInstance',
  props: {
    instance: Object,
    depth: Number
  },
  created () {
    // expand root by default
    if (this.depth === 0) {
      this.expand()
    }
  },
  computed: {
    expanded () {
      return !!this.$store.state.components.expansionMap[this.instance.id]
    },
    selected () {
      return this.instance.id === this.$store.state.components.inspectedInstance.id
    },
    sortedChildren () {
      return this.instance.children.slice().sort((a, b) => {
        return a.top - b.top
      })
    }
  },
  methods: {
    toggle () {
      this.toggleWithValue(!this.expanded)
    },
    expand () {
      this.toggleWithValue(true)
    },
    collapse () {
      this.toggleWithValue(false)
    },
    toggleWithValue (val) {
      this.$store.commit('TOGGLE_INSTANCE', {
        id: this.instance.id,
        expanded: val
      })
    },
    select () {
      bridge.send('select-instance', this.instance.id)
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
  overflow hidden
  z-index 2
  background-color #fff
  transition background-color .1s ease
  border-radius 3px
  font-size 14px
  line-height 22px
  height 22px
  white-space nowrap
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

.info
  color #fff
  font-size 10px
  padding 3px 5px 2px
  display inline-block
  line-height 10px
  border-radius 3px
  position relative
  top -1px
  &.router-view
    background-color #ff8344
  &.fragment
    background-color #b3cbf7
  &.inactive
    background-color #aaa

.arrow-wrapper
  position absolute
  display inline-block
  width 16px
  height 16px
  top 0
  left 4px

.arrow
  position absolute
  top 5px
  left 4px
  transition transform .1s ease, border-left-color .1s ease
  &.rotated
    transform rotate(90deg)

.angle-bracket
  color #ccc

.instance-name
  color #0062C3
  margin 0 1px
  transition color .1s ease
</style>
