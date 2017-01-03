<template>
  <scroll-pane>
    <action-header slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input :class="{ invalid: invalidRegex }" placeholder="Filter mutations" v-model="userInputFilter">
      </div>
      <a class="button commit-all" :class="{ disabled: !history.length }" @click="commitAll" title="Commit All">
        <i class="material-icons">get_app</i>
        <span>Commit All</span>
      </a>
      <a class="button revert-all" :class="{ disabled: !history.length }" @click="revertAll" title="Revert All">
        <i class="material-icons">restore</i>
        <span>Revert All</span>
      </a>
      <a class="button reset" @click="reset" title="Reset">
        <i class="material-icons">cached</i>
        <span>Reset</span>
      </a>
    </action-header>
    <div slot="scroll" class="history">
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
          <a class="action" @click.stop="commitSelected" title="Commit">
            <i class="material-icons">get_app</i>
            <span>Commit</span>
          </a>
          <a class="action" @click.stop="revertSelected" title="Revert">
            <i class="material-icons">restore</i>
            <span>Revert</span>
          </a>
        </span>
        <span class="time" :title="entry.timestamp">
          {{ entry.timestamp | formatTime }}
        </span>
      </div>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

import keyNavMixin from '../../mixins/key-nav'
import { mapState, mapActions } from 'vuex'

const REGEX_RE = /^\/(.*?)\/(\w*)/

export default {
  mixins: [keyNavMixin],
  components: {
    ActionHeader,
    ScrollPane
  },
  data () {
    return {
      userInputFilter: '',
      invalidRegex: false
    }
  },
  computed: {
    ...mapState('vuex', {
      history: state => state.history,
      lastCommit: state => state.lastCommit,
      activeIndex: state => state.activeIndex
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
      this.invalidRegex = false
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
    ...mapActions('vuex', [
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
    escapeStringForRegExp (str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common"

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
    background-color $active-color
    .time
      color lighten($active-color, 75%)
  .mutation-type
    display inline-block
    vertical-align middle

.action
  color lighten($active-color, 75%)
  font-size 11px
  display inline-block
  vertical-align middle
  margin-left 8px
  white-space nowrap
  span
    display none
    @media (min-width: $wide)
      display inline
  .material-icons
    color lighten($active-color, 75%)
    font-size 20px
    margin-right -4px
  .material-icons, span
    vertical-align middle
  &:hover
    color lighten($active-color, 95%)
    .material-icons
      color lighten($active-color, 95%)

.time
  font-size 11px
  color #999
  float right
  margin-top 3px
</style>
