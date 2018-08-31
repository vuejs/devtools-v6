<template>
  <div
    class="instance"
    :class="{ selected: selected }"
  >
    <div
      class="self"
      :class="{ selected: selected }"
      :style="{ paddingLeft: depth * 15 + 'px' }"
      @click.stop="inspect(routeId)"
      @dblclick="toggleExpand"
    >
      <span class="content">
        <!-- arrow wrapper for better hit box -->
        <span
          v-if="route.children && route.children.length"
          class="arrow-wrapper"
          @click="toggleExpand"
        >
          <span
            class="arrow right"
            :class="{ rotated: expanded }"
          />
        </span>
        <span class="instance-name">
          {{ route.path }}
        </span>
      </span>
      <span
        v-if="route.name"
        class="info name"
      >
        {{ route.name }}
      </span>
      <span
        v-if="route.alias"
        class="info alias"
      >
        alias: <b>{{ route.alias }}</b>
      </span>
      <span
        v-if="route.redirect"
        class="info redirect"
      >
        redirect: <b>{{ route.redirect }}</b>
      </span>
      <span
        v-if="isActive"
        class="info active"
      >
        active
      </span>
    </div>
    <div v-if="expanded">
      <routes-tree-item
        v-for="(child, key) in route.children"
        :key="child.path"
        :route="child"
        :route-id="routeId + '_' + key"
        :depth="depth + 1"
      />
    </div>
  </div>

</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  name: 'RoutesTreeItem',
  props: {
    routeId: {
      type: [String, Number],
      required: true
    },
    route: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      expanded: false
    }
  },
  computed: {
    ...mapState('routes', [
      'inspectedIndex'
    ]),
    ...mapGetters('routes', [
      'activeRoute'
    ]),
    selected () {
      return this.inspectedIndex === this.routeId
    },
    isActive () {
      return this.activeRoute && this.activeRoute.path === this.route.path
    }
  },
  methods: {
    ...mapMutations('routes', {
      inspect: 'INSPECT'
    }),
    toggleExpand () {
      this.expanded = !this.expanded
    }
  }
}
</script>

<style lang="stylus" scoped>
.instance
  font-family Menlo, Consolas, monospace

.self
  cursor pointer
  position relative
  overflow hidden
  z-index 2
  transition background-color .1s ease
  border-radius 3px
  font-size 14px
  line-height 22px
  height 22px
  white-space nowrap
  display flex
  align-items center
  &.selected
    background-color $active-color
    .arrow
      border-left-color #fff
    .instance-name
      color #fff

  .high-density &
    font-size 12px
    height 15px

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
  .high-density &
    padding 1px 4px 0
    top 0
  &.name
    background-color $purple
  &.alias
    background-color $orange
  &.redirect
    background-color $darkerGrey
  &.active
    background-color $red
</style>
