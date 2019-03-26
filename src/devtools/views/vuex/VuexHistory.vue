<template>
  <scroll-pane>
    <action-header slot="header">
      <div
        v-tooltip="$t('VuexHistory.filter.tooltip')"
        class="search"
      >
        <VueIcon icon="search" />
        <input
          ref="filterMutations"
          v-model.trim="filter"
          :class="{ invalid: filterRegexInvalid }"
          placeholder="Filter mutations"
        >
      </div>
      <a
        v-tooltip="$t('VuexHistory.commitAll.tooltip')"
        :class="{ disabled: !history.length }"
        class="button commit-all"
        @click="commitAll"
      >
        <VueIcon icon="get_app" />
        <span>Commit All</span>
      </a>
      <a
        v-tooltip="$t('VuexHistory.revertAll.tooltip')"
        :class="{ disabled: !history.length }"
        class="button reset"
        @click="revertAll"
      >
        <VueIcon
          class="small"
          icon="do_not_disturb"
        />
        <span>Revert All</span>
      </a>
      <a
        v-tooltip="$t(`VuexHistory.${enabled ? 'stopRecording' : 'startRecording'}.tooltip`)"
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
    <div
      slot="scroll"
      class="history"
    >
      <div
        ref="baseEntry"
        :class="{ active: activeIndex === -1, inspected: inspectedIndex === -1 }"
        class="entry list-item"
        @click="inspect(null)"
      >
        <span class="mutation-type">Base State</span>
        <span class="entry-actions">
          <a
            v-tooltip="'Time Travel to This State'"
            class="action"
            @click.stop="timeTravelTo(null)"
          >
            <VueIcon
              class="medium"
              icon="restore"
            />
            <span>Time Travel</span>
          </a>
        </span>
        <span class="time">
          {{ lastCommit | formatTime }}
        </span>
        <span
          v-if="activeIndex === -1"
          class="label active"
        >active</span>
        <span
          v-if="inspectedIndex === -1"
          class="label inspected"
        >inspected</span>
      </div>
      <div
        v-for="(entry, index) in filteredHistory"
        ref="entries"
        :key="index"
        :class="{ inspected: isInspected(entry), active: isActive(entry) }"
        class="entry list-item"
        @click="inspect(entry)"
      >
        <span class="mutation-type">{{ entry.mutation.type }}</span>
        <span class="entry-actions">
          <a
            v-tooltip="'Commit This Mutation'"
            class="action"
            @click.stop="commit(entry)"
          >
            <VueIcon
              class="medium"
              icon="get_app"
            />
            <span>Commit</span>
          </a>
          <a
            v-tooltip="'Revert This Mutation'"
            class="action"
            @click.stop="revert(entry)"
          >
            <VueIcon
              class="small"
              icon="do_not_disturb"
            />
            <span>Revert</span>
          </a>
          <a
            v-if="!isActive(entry)"
            v-tooltip="'Time Travel to This State'"
            class="action"
            @click.stop="timeTravelTo(entry)"
          >
            <VueIcon
              class="medium"
              icon="restore"
            />
            <span>Time Travel</span>
          </a>
        </span>
        <span
          v-tooltip="entry.timestamp"
          class="time"
        >
          {{ entry.timestamp | formatTime }}
        </span>
        <span
          v-if="isActive(entry)"
          class="label active"
        >active</span>
        <span
          v-if="isInspected(entry)"
          class="label inspected"
        >inspected</span>
      </div>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

import Keyboard, {
  UP,
  DOWN,
  DEL,
  BACKSPACE,
  ENTER
} from '../../mixins/keyboard'
import EntryList from '../../mixins/entry-list'
import { mapState, mapGetters, mapActions } from 'vuex'
import { focusInput } from 'src/util'

export default {
  components: {
    ActionHeader,
    ScrollPane
  },

  filters: {
    formatTime (timestamp) {
      return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
    }
  },

  mixins: [
    Keyboard({
      onKeyDown ({ key, modifiers }) {
        switch (modifiers) {
          case 'ctrl':
            if (key === ENTER) {
              this.commitAll()
              return false
            } else if (key === DEL || key === BACKSPACE) {
              this.revertAll()
              return false
            } else if (key === 'f') {
              focusInput(this.$refs.filterMutations)
              return false
            }
            break
          case '':
            if (key === UP) {
              this.inspect(this.inspectedIndex - 1)
              return false
            } else if (key === DOWN) {
              this.inspect(this.inspectedIndex + 1)
              return false
            } else if (key === 'r') {
              this.toggleRecording()
            }
        }
      }
    }),
    EntryList
  ],

  computed: {
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
    ]),

    filter: {
      get () {
        return this.$store.state.vuex.filter
      },
      set (filter) {
        this.$store.dispatch('vuex/updateFilter', filter)
        this.$store.commit('vuex/INSPECT', -1)
      }
    }
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
      return this.activeIndex === this.filteredHistory.indexOf(entry)
    },

    isInspected (entry) {
      return this.inspectedIndex === this.filteredHistory.indexOf(entry)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../variables"

$inspected_color = #af90d5

.entry
  font-family Menlo, Consolas, monospace
  cursor pointer
  padding 7px 20px
  font-size 12px
  box-shadow 0 1px 5px rgba(0,0,0,.12)
  min-height 34px
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
    .label.inspected
      background-color darken($inspected_color, 10%)
  @media (max-width: $wide)
    .label
      display none
    &.inspected
      border-left 4px solid darken($inspected_color, 15%)
      padding-left 16px
  .vue-ui-icon, span, a
    display inline-block
    vertical-align middle
  .mutation-type
    line-height 20px
    overflow-wrap break-word
    max-width 100%
  .entry-actions
    display none
  &:hover
    .entry-actions
      display inline-block
  .vue-ui-dark-mode &
    .mutation-type
      color #e36eec
    &.active
      .mutation-type
        color #fff

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
  .vue-ui-icon
    width 18px
    height @width
    margin-right 2px
  &:hover
    color $active-color
    .vue-ui-icon >>> svg
      fill $active-color

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
