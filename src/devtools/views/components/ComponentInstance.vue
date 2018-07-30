<template>
  <div
    :class="{
      inactive: instance.inactive,
      selected: selected
    }"
    class="instance"
  >
    <div
      ref="self"
      :class="{ selected: selected }"
      :style="{ paddingLeft: depth * 15 + 'px' }"
      class="self selectable-item"
      @click.stop="select"
      @dblclick.stop="toggle"
      @mouseenter="enter"
      @mouseleave="leave"
    >
      <!-- Component tag -->
      <span class="content">
        <!-- arrow wrapper for better hit box -->
        <span
          v-if="instance.children.length"
          class="arrow-wrapper"
          @click.stop="toggle"
        >
          <span
            :class="{ rotated: expanded }"
            class="arrow right"
          />
        </span>

        <span class="angle-bracket">&lt;</span>

        <span class="item-name">{{ displayName }}</span>

        <span
          v-if="componentHasKey"
          class="attr"
        >
          <span class="attr-title"> key</span>=<span class="attr-value">{{ instance.renderKey }}</span>
        </span>

        <span class="angle-bracket">&gt;</span>
      </span>
      <span
        v-if="instance.consoleId"
        v-tooltip="$t('ComponentInstance.consoleId.tooltip', { id: instance.consoleId })"
        class="info console"
      >
        = {{ instance.consoleId }}
      </span>
      <span
        v-if="instance.isRouterView"
        class="info router-view"
      >
        router-view{{ instance.matchedRouteSegment ? ': ' + instance.matchedRouteSegment : null }}
      </span>
      <span
        v-if="instance.isFragment"
        class="info fragment"
      >
        fragment
      </span>
      <span
        v-if="instance.inactive"
        class="info inactive"
      >
        inactive
      </span>

      <span class="spacer" />

      <VueIcon
        v-tooltip="'Scroll into view'"
        class="icon-button"
        icon="visibility"
        @click="scrollToInstance"
      />
    </div>

    <div v-if="expanded">
      <component-instance
        v-for="child in sortedChildren"
        :key="child.id"
        :instance="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script>
import { classify, scrollIntoView, UNDEFINED } from '../../../util'

export default {
  name: 'ComponentInstance',

  props: {
    instance: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      required: true
    }
  },

  computed: {
    scrollToExpanded () {
      return this.$store.state.components.scrollToExpanded
    },

    expanded () {
      return !!this.$store.state.components.expansionMap[this.instance.id]
    },

    selected () {
      return this.instance.id === this.$store.state.components.inspectedInstance.id
    },

    sortedChildren () {
      return this.instance.children.slice().sort((a, b) => {
        return a.top === b.top
          ? a.id - b.id
          : a.top - b.top
      })
    },

    displayName () {
      return this.$shared.classifyComponents ? classify(this.instance.name) : this.instance.name
    },

    componentHasKey () {
      return !!this.instance.renderKey && this.instance.renderKey !== UNDEFINED
    }
  },

  watch: {
    scrollToExpanded: {
      handler (value, oldValue) {
        if (value !== oldValue && value === this.instance.id) {
          this.scrollIntoView()
        }
      },
      immediate: true
    }
  },

  created () {
    // expand root by default
    if (this.depth === 0) {
      this.expand()
    }
  },

  methods: {
    toggle (event) {
      this.toggleWithValue(!this.expanded, event.altKey)
    },

    expand () {
      this.toggleWithValue(true)
    },

    collapse () {
      this.toggleWithValue(false)
    },

    toggleWithValue (val, recursive = false) {
      this.$store.dispatch('components/toggleInstance', {
        instance: this.instance,
        expanded: val,
        recursive
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
    },

    scrollToInstance () {
      bridge.send('scroll-to-instance', this.instance.id)
    },

    scrollIntoView (center = true) {
      this.$nextTick(() => {
        scrollIntoView(this.$globalRefs.leftScroll, this.$refs.self, center)
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../variables"

.instance
  font-family Menlo, Consolas, monospace
  &.inactive
    opacity .5

.self
  cursor pointer
  position relative
  overflow hidden
  z-index 2
  border-radius 3px
  font-size 14px
  line-height 22px
  height 22px
  white-space nowrap
  display flex
  align-items center
  padding-right 6px

  &:hidden
    display none

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
  &.console
    color #fff
    background-color transparent
    top 0
  &.router-view
    background-color #ff8344
  &.fragment
    background-color #b3cbf7
  &.inactive
    background-color #aaa
  &:not(.console)
    margin-left 6px

.arrow-wrapper
  position absolute
  display inline-block
  width 16px
  height 16px
  top 1px
  left 4px

.arrow
  position absolute
  top 5px
  left 4px
  transition transform .1s ease
  &.rotated
    transform rotate(90deg)

.angle-bracket
  color $darkerGrey

.item-name
  color $component-color
  margin 0 1px

.attr
  opacity .5
  font-size 12px

.attr-title
  color purple
  .vue-ui-dark-mode &
    color lighten(purple, 60%)

.spacer
  flex auto 1 1

.icon-button
  width 16px
  height 16px

  .self:not(:hover) &
    visibility hidden

  .self.selected & >>> svg
    fill $white

.self.selected
  .attr
    opacity 1
  .attr-title
    color lighten($purple, 70%)
</style>
