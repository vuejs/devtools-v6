<template>
  <scroll-pane scroll-event="routes:init">
    <action-header slot="header">
      <div class="search">
        <VueIcon icon="search" />
        <input
          ref="filterRoutes"
          v-model.trim="filter"
          placeholder="Filter routes"
        >
      </div>
      <a
        :class="{ disabled: !filteredRoutes.length }"
        class="button reset"
        @click="reset"
      >
        <VueIcon
          class="small"
          icon="do_not_disturb"
        />
        <span>Clear</span>
      </a>
      <a
        class="button toggle-recording"
        @click="toggleRecording"
      >
        <VueIcon
          :class="{ enabled }"
          class="small"
          icon="lens"
        />
        <span>{{ enabled ? 'Recording' : 'Paused' }}</span>
      </a>
    </action-header>
    <recycle-list
      slot="scroll"
      :items="filteredRoutes"
      :item-height="highDensity ? 22 : 34"
      class="history"
      :class="{
        'high-density': highDensity
      }"
    >
      <div
        v-if="filteredRoutes.length === 0"
        slot="after-container"
        class="no-routes"
      >
        No route transitions found<span v-if="!enabled"><br>(Recording is paused)</span>
      </div>

      <template slot-scope="{ item: route, index, active }">
        <div
          class="entry list-item"
          :class="{ active: inspectedIndex === index }"
          :data-active="active"
          @click="inspect(filteredRoutes.indexOf(route))"
        >
          <span class="route-name">{{ route.to.path }}</span>
          <span class="time">{{ route.timestamp | formatTime }}</span>
          <span
            v-if="route.to.redirectedFrom"
            class="label redirect"
          >
            redirect
          </span>
          <span
            v-if="isNotEmpty(route.to.name)"
            class="label name"
          >
            {{ route.to.name }}
          </span>
        </div>
      </template>
    </recycle-list>
  </scroll-pane>
</template>

<script>
import { UNDEFINED } from 'src/util'
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
  components: {
    ScrollPane,
    ActionHeader
  },
  computed: {
    filter: {
      get () {
        return this.$store.state.router.filter
      },
      set (filter) {
        this.$store.commit('router/UPDATE_FILTER', filter)
      }
    },
    highDensity () {
      const pref = this.$shared.displayDensity
      return (pref === 'auto' && this.totalCount > 12) || pref === 'high'
    },
    ...mapState('router', [
      'enabled',
      'routeChanges',
      'inspectedIndex'
    ]),
    ...mapGetters('router', [
      'filteredRoutes'
    ])
  },
  methods: {
    ...mapMutations('router', {
      inspect: 'INSPECT',
      reset: 'RESET',
      toggleRecording: 'TOGGLE'
    }),
    isNotEmpty (value) {
      return !!value && value !== UNDEFINED
    }
  }
}
</script>

<style lang="stylus" scoped>
.recycle-list
  height 100%

.no-routes
  color #ccc
  text-align center
  margin-top 50px
  line-height 30px

.entry
  font-family Menlo, Consolas, monospace
  cursor pointer
  padding 7px 20px
  font-size 12px
  line-height: 20px
  box-shadow inset 0 1px 0px rgba(0, 0, 0, .08)
  min-height 34px
  transition padding .15s, min-height .15s

  &::after
    content: ''
    display table
    clear both
  &.active
    .time
      color lighten($active-color, 75%)
    .action
      color lighten($active-color, 75%)
      .vue-ui-icon >>> svg
        fill  lighten($active-color, 75%)
      &:hover
        color lighten($active-color, 95%)
        .vue-ui-icon >>> svg
          fill  lighten($active-color, 95%)
  .high-density &
    padding 1px 20px
    min-height 22px
  span
    display inline-block
    vertical-align middle

.route-name
  font-weight: 600

.time
  font-size 11px
  color #999
  float right

.label
  float right
  font-size 10px
  padding 4px 8px
  border-radius 6px
  margin-right 8px
  margin-top: 1px
  line-height: 1
  color: #fff
  &.name
    background-color $purple
  &.alias
    background-color $orange
  &.redirect
    background-color $darkerGrey
</style>
