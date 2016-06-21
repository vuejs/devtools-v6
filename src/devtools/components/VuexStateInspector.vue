<template>
  <div>
    <section class="top">
      <div class="buttons">
        <a class="button" @click="copyStateToClipboard">
          <i class="material-icons">content_copy</i>
          <span>Export</span>
          <span class="message" transition="slide-up" v-show="showStateCopiedMessage">(Copied to clipboard!)</span>
        </a>
        <a class="button" @click="toggleImportStatePopup">
          <i class="material-icons">content_paste</i>
          <span>Import</span>
        </a>
      </div>

      <div class="import-state" transition="slide-up" v-if="showImportStatePopup">
        <textarea placeholder="Paste state object here to import it..."
          @input="importState"
          @keydown.esc="closeImportStatePopup"></textarea>
        <span class="message invalid-json" transition="slide-up" v-show="showBadJsonMessage">INVALID JSON!</span>
      </div>
    </section>
    <div class="vuex-state-inspector">
      <data-field
        v-for="(key, value) of activeState"
        track-by="$index"
        :field="{ key: key, value: value }"
        :depth="0">
      </data-field>
    </div>
  </div>
</template>

<script>
import CircularJSON from 'circular-json-es6'
import DataField from './DataField.vue'
import store from '../vuex/store'
import { stringify } from '../../util'

export default {
  components: {
    DataField
  },
  vuex: {
    getters: {
      activeState ({ vuex: { base, history, activeIndex }}) {
        const entry = history[activeIndex]
        const res = {}
        if (entry) {
          res.type = entry.mutation.type
          res.payload = CircularJSON.parse(entry.mutation.payload)
        }
        res.state = CircularJSON.parse(entry ? entry.state : base)
        return res
      },
      showStateCopiedMessage ({ vuex: { showStateCopiedMessage }}) {
        return showStateCopiedMessage
      },
      showBadJsonMessage ({ vuex: { showBadJsonMessage }}) {
        return showBadJsonMessage
      },
      showImportStatePopup ({ vuex: { showImportStatePopup }}) {
        return showImportStatePopup
      }
    }
  },
  watch: {
    showImportStatePopup (val) {
      if (val) {
        this.$nextTick(() => {
          this.$el.querySelector('textarea').focus()
        })
      }
    }
  },
  methods: {
    copyStateToClipboard () {
      const dummyTextArea = document.createElement('textarea')
      dummyTextArea.textContent = stringify(this.activeState.state)
      const body = document.getElementsByTagName('body')[0]
      body.appendChild(dummyTextArea)
      dummyTextArea.select()
      document.execCommand('copy')
      body.removeChild(dummyTextArea)

      store.dispatch('vuex/SHOW_STATE_COPIED_MESSAGE')
      window.setTimeout(() => store.dispatch('vuex/HIDE_STATE_COPIED_MESSAGE'), 2000)
    },
    toggleImportStatePopup () {
      if (this.showImportStatePopup) {
        this.closeImportStatePopup()
      } else {
        store.dispatch('vuex/SHOW_IMPORT_STATE_POPUP')
      }
    },
    closeImportStatePopup () {
      store.dispatch('vuex/HIDE_IMPORT_STATE_POPUP')
    },
    importState (e) {
      const importedStr = e.target.value

      if (importedStr.length === 0) {
        store.dispatch('vuex/HIDE_BAD_JSON_MESSAGE')
      } else {
        try {
          CircularJSON.parse(importedStr) // Try to parse
          bridge.send('vuex:travel-to-state', importedStr) // set it on app store
          store.dispatch('vuex/INIT', importedStr) // set it in dev tools
          store.dispatch('vuex/HIDE_BAD_JSON_MESSAGE')
        } catch (e) {
          store.dispatch('vuex/SHOW_BAD_JSON_MESSAGE')
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
$border-color = #e3e3e3
$blue = #44A1FF

.vuex-state-inspector
  padding 15px 20px

.top
  border-bottom 1px solid $border-color
  height 50px
  justify-content: space-between
  font-size 18px
  box-shadow: 0 0 8px rgba(0,0,0,0.15);

.button
  float left
  position relative
  align-items center
  font-size 12px
  color #666
  text-align center
  cursor pointer
  border-right 1px solid $border-color
  transition box-shadow .25s ease, color .2s ease
  height 50px
  line-height 50px
  padding: 0 22px 0 20px
  display inline-block
  vertical-align middle
  i
    margin-right 3px
    vertical-align middle
  span
    white-space nowrap
    vertical-align middle
  &:hover
    box-shadow 0 2px 12px rgba(0,0,0,.1)

.message
  transition all .3s ease
  color $blue

.invalid-json
  right 20px
  left initial
  top 1px
  font-size 12px
  color #c41a16
  background-color #fff

.import-state
  transition all .3s ease
  position absolute
  z-index 1
  left 220px
  right 10px
  top 5px
  box-shadow 4px 4px 6px 0 $border-color
  border 1px solid $border-color
  padding 3px
  background-color #fff

  textarea
    width 100%
    height 100px
    display block
    outline none
    border none
    resize vertical
</style>
