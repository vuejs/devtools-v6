<template>
  <div>
    <section class="top">
      <span class="buttons">
        <a class="button" @click="copyStateToClipboard">
          <i class="material-icons">content_copy</i>
          <span>Copy state to clipboard</span>
          <span class="message" transition="slide-up" v-show="showStateCopiedMessage">(Copied!)</span>
        </a>
      </span>
      <span><textarea @input="importState"></textarea></span>
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
      try {
        bridge.send('vuex:travel-to-state', e.target.value) // set it on app store
        store.dispatch('vuex/INIT', e.target.value) // set it in dev tools
      } catch (err) {
        console.log('TODO: tell user this isn valid JSON', err)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
$border-color = #e3e3e3

.vuex-state-inspector
  padding 15px 20px

section:not(:last-child)
  border-bottom 1px solid $border-color

.top
  line-height 30px
  font-size 18px
  color #0062c3
  padding 10px 20px

.component-name, .buttons
  display inline-block
  vertical-align middle
  white-space nowrap

.message
  transition all .3s ease
  display inline-block
  position absolute

.button
  display inline-block
  vertical-align middle
  font-size 12px
  color #666
  text-align center
  cursor pointer
  transition box-shadow .25s ease
  margin-right 15px
  transition color .2s ease
  .material-icons
    font-size 16px
  span, i
    vertical-align middle
    margin-right 3px
  &:hover
    color #44A1FF
</style>
