<template>
  <div>
    <div class="buttons">
      <a class="button" :class="{ disabled: !history.length }" @click="commit">
        <i class="material-icons">get_app</i>
        <span>Commit</span>
      </a>
      <a class="button" :class="{ disabled: !history.length }" @click="revert">
        <i class="material-icons">restore</i>
        <span>Revert</span>
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
        {{ entry.mutation.type }}
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
      commit ({ dispatch, state }) {
        if (state.vuex.history.length > 0) {
          dispatch('vuex/COMMIT')
        }
      },
      revert ({ dispatch, state }) {
        if (state.vuex.history.length > 0) {
          dispatch('vuex/REVERT')
          bridge.send('vuex:travel-to-state', state.vuex.base)
        }
      },
      reset ({ dispatch, state }) {
        dispatch('vuex/RESET')
        bridge.send('vuex:travel-to-state', state.vuex.initial)
      },
      step ({ dispatch, state }, n) {
        if (n === -1) {
          dispatch('vuex/STEP', n)
          bridge.send('vuex:travel-to-state', state.vuex.base)
        } else {
          const entry = state.vuex.history[n]
          if (entry || n === -1) {
            dispatch('vuex/STEP', n)
            bridge.send('vuex:travel-to-state', entry.state)
          }
        }
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
  .material-icons
    font-size 16px
  .material-icons, span
    vertical-align middle
  &:hover
    color $blue
  &.disabled
    color #aaa
    cursor not-allowed

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

.time
  font-size 11px
  color #999

  float right
</style>
