<template>
  <div class="instance"
      :class="{ selected: selected }">
    <div class="self"
      @click.stop="inspect(routeId)"
      :class="{ selected: selected }"
      :style="{ paddingLeft: depth * 15 + 'px' }">
      <span class="content">
        <!-- arrow wrapper for better hit box -->
        <span class="arrow-wrapper" v-if="route.children && route.children.length">
          <span class="arrow right" :class="{ rotated: expanded }">
          </span>
        </span>
        <span class="instance-name">
          {{ route.path }}
        </span>
      </span>
      <span class="info name" v-if="route.name">
        {{ route.name }}
      </span>
      <span class="info alias" v-if="route.alias">
        alias: <b>{{ route.alias }}</b>
      </span>
      <span class="info redirect" v-if="route.redirect">
        redirect: <b>{{ route.redirect }}</b>
      </span>
    </div>
    <div v-if="expanded">
      <routes-tree-item
        v-for="(child, key) in route.children"
        :key="child"
        :route="child"
        :routeId="routeId + '_' + key"
        :depth="depth + 1">
      </routes-tree-item>
    </div>
  </div>

</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'RoutesTreeItem',
  props: {
    routeId: String|Number,
    route: Object,
    depth: Number
  },
  created () {
    // expand root by default
    if (this.depth === 0) {
      // this.expand()
    }
  },
  computed: {
    ...mapState('routes', [
      'inspectedIndex'
    ]),
    expanded () {
      return !!this.route.children && this.route.children.length
    },
    selected () {
      return this.inspectedIndex === this.routeId
    }
  },
  methods: {
    ...mapMutations('routes', {
      inspect: 'INSPECT'
    })
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common"

.instance
  font-family Menlo, Consolas, monospace

.self
  cursor pointer
  position relative
  overflow hidden
  z-index 2
  background-color $background-color
  transition background-color .1s ease
  border-radius 3px
  font-size 14px
  line-height 22px
  height 22px
  white-space nowrap
  &.selected
    background-color $active-color
    .arrow
      border-left-color #fff
    .instance-name
      color #fff

.arrow
  position absolute
  top 5px
  left 4px
  transition transform .1s ease, border-left-color .1s ease
  &.rotated
    transform rotate(90deg)

.arrow-wrapper
  position absolute
  display inline-block
  width 16px
  height 16px
  top 0
  left 4px

.children
  position relative
  z-index 1

.content
  position relative
  padding-left 22px

.instance-name
  color $component-color
  margin 0 1px
  transition color .1s ease

.info
  color #fff
  font-size 10px
  padding 3px 5px 2px
  display inline-block
  line-height 10px
  border-radius 3px
  position relative
  top -1px
  margin-left 6px
  &.name
    background-color #b3cbf7
  &.alias
    background-color #ff8344
  &.redirect
    background-color #aaa
</style>
