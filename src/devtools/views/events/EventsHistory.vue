<template>
  <scroll-pane>
    <action-header slot="header">
      <div
        v-tooltip="$t('EventsHistory.filter.tooltip')"
        class="search"
      >
        <VueIcon icon="search" />
        <input
          ref="filterEvents"
          v-model.trim="filter"
          placeholder="Filter events"
        >
      </div>
      <a
        v-tooltip="$t('EventsHistory.clear.tooltip')"
        :class="{ disabled: !events.length }"
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
        v-tooltip="$t(`EventsHistory.${enabled ? 'stopRecording' : 'startRecording'}.tooltip`)"
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
        v-if="filteredEvents.length === 0"
        class="no-events"
      >
        No events found<span v-if="!enabled"><br>(Recording is paused)</span>
      </div>
      <template v-else>
        <div
          v-for="(event, index) in filteredEvents"
          ref="entries"
          :key="index"
          :class="{ active: inspectedIndex === filteredEvents.indexOf(event) }"
          class="entry list-item"
          @click="inspect(filteredEvents.indexOf(event))"
        >
          <span class="event-name">{{ event.eventName }}</span>
          <span class="event-type">{{ event.type }}</span>
          <span class="event-source">
            by
            <span>&lt;</span>
            <span class="component-name">{{ displayComponentName(event.instanceName) }}</span>
            <span>&gt;</span>
          </span>
          <span class="time">{{ event.timestamp | formatTime }}</span>
        </div>
      </template>
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
  BACKSPACE
} from '../../mixins/keyboard'
import EntryList from '../../mixins/entry-list'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { classify, focusInput } from 'src/util'

export default {
  components: {
    ScrollPane,
    ActionHeader
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
            if (key === DEL || key === BACKSPACE) {
              this.reset()
              return false
            } else if (key === 'f') {
              focusInput(this.$refs.filterEvents)
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
    ...mapState('events', [
      'enabled',
      'events',
      'inspectedIndex'
    ]),

    ...mapGetters('events', [
      'filteredEvents'
    ]),

    filter: {
      get () {
        return this.$store.state.events.filter
      },
      set (filter) {
        this.$store.commit('events/UPDATE_FILTER', filter)
        this.$store.commit('events/INSPECT', -1)
      }
    }
  },

  methods: {
    ...mapMutations('events', {
      reset: 'RESET',
      toggleRecording: 'TOGGLE'
    }),

    ...mapActions('events', [
      'inspect'
    ]),

    displayComponentName (name) {
      return this.$shared.classifyComponents ? classify(name) : name
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../variables"

.no-events
  color #ccc
  text-align center
  margin-top 50px
  line-height 30px

.entry
  position relative;
  font-family Menlo, Consolas, monospace
  cursor pointer
  padding 10px 20px
  font-size 12px
  box-shadow 0 1px 5px rgba(0,0,0,.12)
  .event-name
    font-weight 600
  .event-source
    color #999
  .component-name
    color $component-color
  .event-type
    color #999
    margin-left 8px
  &.active
    .time, .event-type, .component-name
      color lighten($active-color, 75%)
    .event-name
      color: #fff
    .event-source
      color #ddd

.time
  font-size 11px
  color #999
  float right
</style>
