<template>
  <scroll-pane scroll-event="vuex:mutation">
    <action-header slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input :class="{ invalid: filterRegexInvalid }" placeholder="Filter mutations" v-model.trim="filter">
      </div>
      <a class="button commit-all" :class="{ disabled: !history.length }" @click="commitAll" title="Commit All">
        <i class="material-icons">get_app</i>
        <span>Commit All</span>
      </a>
      <a class="button reset" :class="{ disabled: !history.length }" @click="revertAll" title="Revert All">
        <i class="material-icons small">do_not_disturb</i>
        <span>Revert All</span>
      </a>
      <a class="button toggle-recording" @click="toggleRecording" :title="enabled ? 'Stop Recording' : 'Start Recording'">
        <i class="material-icons small" :class="{ enabled }">lens</i>
        <span>{{ enabled ? 'Recording' : 'Paused' }}</span>
      </a>
    </action-header>
    <div slot="scroll" class="history">
      <div class="entry" :class="{ active: activeIndex === -1, inspected: inspectedIndex === -1 }" @click="inspect(null)">
        <span class="mutation-type">Base State</span>
        <span class="entry-actions">
          <a class="action"
             @click.stop="timeTravelTo(null)" title="Time Travel to This State">
            <i class="material-icons medium">restore</i>
            <span>Time Travel</span>
          </a>
        </span>
        <span class="time">
          {{ lastCommit | formatTime }}
        </span>
        <span class="label active" v-if="activeIndex === -1">active</span>
        <span class="label inspected" v-if="inspectedIndex === -1">inspected</span>
      </div>
      <div class="entry"
        v-for="entry in filteredHistory"
        :class="{ inspected: isInspected(entry), active: isActive(entry) }"
        @click="inspect(entry)">
        <span class="mutation-type">{{ entry.mutation.type }}</span>
        <span class="entry-actions">
          <a class="action" @click.stop="commit(entry)" title="Commit This Mutation">
            <i class="material-icons medium">get_app</i>
            <span>Commit</span>
          </a>
          <a class="action" @click.stop="revert(entry)" title="Revert This Mutation">
            <i class="material-icons small">do_not_disturb</i>
            <span>Revert</span>
          </a>
          <a v-if="!isActive(entry)"
             class="action"
             @click.stop="timeTravelTo(entry)"
             title="Time Travel to This State">
            <i class="material-icons medium">restore</i>
            <span>Time Travel</span>
          </a>
        </span>
        <span class="time" :title="entry.timestamp">
          {{ entry.timestamp | formatTime }}
        </span>
        <span class="label active" v-if="isActive(entry)">active</span>
        <span class="label inspected" v-if="isInspected(entry)">inspected</span>
      </div>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

import keyNavMixin from '../../mixins/key-nav'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  mixins: [keyNavMixin],
  components: {
    ActionHeader,
    ScrollPane
  },
  computed: {
    filter: {
      get () {
        return this.$store.state.vuex.filter
      },
      set (filter) {
        this.$store.dispatch('vuex/updateFilter', filter)
      }
    },
    ...mapState('vuex', [
      'enabled',
      'history',
      'lastCommit',
      'inspectedIndex',
      'activeIndex',
      'filterRegex',
      'filterRegexInvalid'
    ]),
    ...mapGetters('vuex', [
      'filteredHistory'
    ])
  },
  methods: {
    ...mapActions('vuex', [
      'commitAll',
      'revertAll',
      'toggleRecording',
      'commit',
      'revert',
      'inspect',
      'timeTravelTo',
      'updateFilter'
    ]),
    isActive (entry) {
      return this.activeIndex === this.history.indexOf(entry)
    },
    isInspected (entry) {
      return this.inspectedIndex === this.history.indexOf(entry)
    },
    onKeyNav (dir) {
      if (dir === 'up') {
        this.inspect(this.inspectedIndex - 1)
      } else if (dir === 'down') {
        this.inspect(this.inspectedIndex + 1)
      }
    }
  },
  filters: {
    formatTime (timestamp) {
      return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common"

$inspected_color = #af90d5

.entry
  font-family Menlo, Consolas, monospace
  color #881391
  cursor pointer
  padding 10px 20px
  font-size 12px
  background-color $background-color
  box-shadow 0 1px 5px rgba(0,0,0,.12)
  height 40px
  &.active
    color #fff
    background-color $active-color
    .time
      color lighten($active-color, 75%)
    .action
      color lighten($active-color, 75%)
      .material-icons
        color lighten($active-color, 75%)
      &:hover
        color lighten($active-color, 95%)
        .material-icons
          color lighten($active-color, 95%)
    .label.inspected
      background-color darken($inspected_color, 10%)
  @media (max-width: $wide)
    .label
      display none
    &.inspected
      border-left 4px solid darken($inspected_color, 15%)
      padding-left 16px
  .material-icons, span, a
    display inline-block
    vertical-align middle
  .mutation-type
    line-height 20px
  .entry-actions
    display none
  &:hover
    .entry-actions
      display inline-block
  .app.dark &
    background-color $dark-background-color
    &.active
      background-color $active-color

.action
  color #999
  font-size 11px
  display inline-block
  vertical-align middle
  margin-left 10px
  white-space nowrap
  span
    display none
    @media (min-width: 1080px)
      display inline
  .material-icons
    font-size 20px
    margin-right 2px
  &:hover
    color $active-color
    .material-icons
      color $active-color

.time
  font-size 11px
  color #999
  float right
  margin-top 3px

.label
  float right
  font-size 10px
  padding 4px 8px
  border-radius 6px
  margin-right 8px
  &.active
    background-color darken($active-color, 25%)
  &.inspected
    color #fff
    background-color $inspected_color
</style>
