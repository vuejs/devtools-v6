<template>
  <div>
    <div class="buttons">
      <a class="button" :class="{ disabled: !history.length }" @click="commitAll">
        <i class="material-icons">get_app</i>
        <span>Commit All</span>
      </a>
      <a class="button" :class="{ disabled: !history.length }" @click="revertAll">
        <i class="material-icons">restore</i>
        <span>Revert All</span>
      </a>
      <a class="button" @click="reset">
        <i class="material-icons">cached</i>
        <span>Reset</span>
      </a>
    </div>
    <div class="history">
      <div class="entry"
        :class="{ active: activeIndex === -1 }"
        @click="step(-1)">
        Base State
        <span class="time">
          {{ lastCommit | formatTime }}
        </span>
      </div>
      <div class="entry"
        v-for="entry in history"
        :class="{ active: activeIndex === $index }"
        @click="step($index)">
        <span class="mutation-type">{{ entry.mutation.type }}</span>
        <span v-if="activeIndex === $index">
          <a class="action" @click.stop="commitSelected">
            <i class="material-icons">get_app</i>
            <span>Commit</span>
          </a>
          <a class="action" @click.stop="revertSelected">
            <i class="material-icons">restore</i>
            <span>Revert</span>
          </a>
        </span>
        <span class="time">
          {{ entry.timestamp | formatTime }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import keyNavMixin from '../mixins/key-nav'

export default {
  mixins: [keyNavMixin],
  vuex: {
    getters: {
      history: state => state.vuex.history,
      lastCommit: state => state.vuex.lastCommit,
      activeIndex: state => state.vuex.activeIndex
    },
    actions: {
      commitAll ({ dispatch, state }) {
        if (state.vuex.history.length > 0) {
          dispatch('vuex/COMMIT_ALL')
          travelTo(state)
        }
      },
      revertAll ({ dispatch, state }) {
        if (state.vuex.history.length > 0) {
          dispatch('vuex/REVERT_ALL')
          travelTo(state)
        }
      },
      commitSelected ({ dispatch, state }) {
        dispatch('vuex/COMMIT_SELECTED')
        travelTo(state)
      },
      revertSelected ({ dispatch, state }) {
        dispatch('vuex/REVERT_SELECTED')
        travelTo(state)
      },
      reset ({ dispatch, state }) {
        dispatch('vuex/RESET')
        travelTo(state)
      },
      step ({ dispatch, state }, index) {
        dispatch('vuex/STEP', index)
        travelTo(state)
      }
    }
  },
  filters: {
    formatTime (timestamp) {
      return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
    }
  },
  methods: {
    onKeyNav (dir) {
      if (dir === 'up') {
        this.step(this.activeIndex - 1)
      } else if (dir === 'down') {
        this.step(this.activeIndex + 1)
      }
    }
  }
}

/**
 * Notify application to travel to corresponding state.
 *
 * @param {Object} state
 */

function travelTo (state) {
  const { history, activeIndex, base } = state.vuex
  const targetState = activeIndex > -1
    ? history[activeIndex].state
    : base
  bridge.send('vuex:travel-to-state', targetState)
}
</script>

<style lang="stylus" scoped>
$blue = #44A1FF

.buttons
  padding 15px 30px 5px 20px
  border-bottom 1px solid #eee

.button
  color #555
  cursor pointer
  display inline-block
  font-size 13px
  margin 0 20px 10px 0
  transition color .2s ease
  &:hover
    color $blue
  &.disabled
    color #aaa
    cursor not-allowed
  .material-icons
    font-size 16px
  .material-icons, span
    vertical-align middle

.history
  height calc(100% - 48px)
  overflow-x hidden
  overflow-y auto

.entry
  font-family Menlo, Consolas, monospace
  color #881391
  cursor pointer
  padding 10px 20px
  font-size 14px
  background-color #fff
  box-shadow 0 1px 5px rgba(0,0,0,.12)
  &.active
    color #fff
    background-color $blue
    .time
      color lighten($blue, 75%)
  .mutation-type
    display inline-block
    vertical-align middle

.action
  color lighten($blue, 75%)
  font-size 11px
  dispatch inline-block
  vertical-align middle
  margin-left 8px
  white-space nowrap
  .material-icons
    font-size 14px
    margin-right -4px
  .material-icons, span
    vertical-align middle
  &:hover
    color #fff

.time
  font-size 11px
  color #999
  float right
  margin-top 3px
</style>
