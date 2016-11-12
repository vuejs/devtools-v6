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
      <div class="search">
        <i class="material-icons">search</i>
        <input class="search-box" placeholder="Filter mutations" v-model="userInputFilter">
        <span class="invalid-regex" v-show="invalidRegex">Invalid RegEx!</span>
      </div>
      <a class="button" @click="clearFilter" v-show="userInputFilter">
        <i class="material-icons">clear</i>
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
        v-for="(entry, index) in filteredHistory"
        :class="{ active: activeIndex === index }"
        @click="step(index)">
        <span class="mutation-type">{{ entry.mutation.type }}</span>
        <span v-if="activeIndex === index">
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
import { mapState, mapActions } from 'vuex'

const REGEX_RE = /^\/(.*?)\/(\w*)/

export default {
  mixins: [keyNavMixin],
  data () {
    return {
      userInputFilter: '',
      invalidRegex: false
    }
  },
  computed: {
    ...mapState({
      history: state => state.vuex.history,
      lastCommit: state => state.vuex.lastCommit,
      activeIndex: state => state.vuex.activeIndex
    }),
    compiledFilter () {
      const regexParts = this.userInputFilter.match(REGEX_RE)
      if (regexParts !== null) {
        // looks like it might be a regex -> try to compile it
        try {
          const re = new RegExp(regexParts[1], regexParts[2])
          this.invalidRegex = false
          return re
        } catch (e) {
          this.invalidRegex = true
          return new RegExp('.*', 'i')
        }
      }
      // simple case-insensitve search
      return new RegExp(this.escapeStringForRegExp(this.userInputFilter), 'i')
    },
    filteredHistory () {
      return this.history.filter((entry) => {
        return this.compiledFilter.test(entry.mutation.type)
      })
    }
  },
  filters: {
    formatTime (timestamp) {
      return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
    }
  },
  methods: {
    ...mapActions([
      'commitAll',
      'revertAll',
      'commitSelected',
      'revertSelected',
      'reset',
      'step'
    ]),
    onKeyNav (dir) {
      if (dir === 'up') {
        this.step(this.activeIndex - 1)
      } else if (dir === 'down') {
        this.step(this.activeIndex + 1)
      }
    },
    clearFilter () {
      this.userInputFilter = ''
      this.invalidRegex = false
    },
    escapeStringForRegExp (str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
    }
  }
}
</script>

<style lang="stylus" scoped>
$blue = #44A1FF

.buttons
  padding 15px 30px 5px 20px
  border-bottom 1px solid #eee
  .material-icons
    font-size 16px
  .material-icons, span
    vertical-align middle
    
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

.search
  width 300px
  display inline-block
  font-size 13px
  margin 0 0 10px 0
  box-sizing border-box

.search-box
  font-family Roboto
  box-sizing border-box
  color #666
  position relative
  z-index 0
  vertical-align middle
  font-size 13px
  border none
  outline none
  width calc(100% - 110px)
  background transparent

.invalid-regex 
  display inline-block
  width 85px
  color #ff4141
  
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
