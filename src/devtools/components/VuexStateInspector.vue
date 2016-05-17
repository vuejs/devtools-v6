<template>
  <div>
    <section class="top">
      <div class="buttons">
        <a class="button" @click="copyStateToClipboard">
          <i class="material-icons">content_copy</i>
          <span>Copy state to clipboard</span>
          <span class="message" transition="slide-up" v-show="showStateCopiedMessage">(COPIED!)</span>
        </a>
      </div>
      <div class="import-state">
        <textarea placeholder="Paste state object here to import it..." @input="importState"></textarea>
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
      }
    },
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

section:not(:last-child)
  border-bottom 1px solid $border-color

.top
  display flex
  justify-content: space-between
  line-height 30px
  font-size 18px
  padding 10px 20px

.buttons
  flex-grow 1

.button
  display flex
  align-items center
  font-size 12px
  color #666
  text-align center
  cursor pointer
  transition box-shadow .25s ease
  transition color .2s ease
  height 32px
  .material-icons
    font-size 14px
  span, i
    margin-right 3px
  span
    align-self flex-end
  &:hover
    color $blue

.message
  transition all .3s ease
  position absolute
  top 11px

.invalid-json
  right 30px
  font-size 12px
  color #c41a16

.import-state
  flex-grow 5
  textarea
    display block
    width 100%
    outline none
</style>
