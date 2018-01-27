<template>
  <scroll-pane>
    <action-header slot="header">
      <div class="search">
        <BaseIcon icon="search"/>
        <input placeholder="Filter inspected state" v-model.trim="filter">
      </div>
      <a class="button export" @click="copyStateToClipboard" v-tooltip="'Export Vuex State'">
        <BaseIcon icon="content_copy"/>
        <span>Export</span>
        <transition name="slide-up">
          <span class="message" v-show="showStateCopiedMessage">
            (Copied to clipboard!)
          </span>
        </transition>
      </a>
      <a class="button import" @click="toggleImportStatePopup" v-tooltip="'Import Vuex State'">
        <BaseIcon icon="content_paste"/>
        <span>Import</span>
      </a>
      <transition name="slide-down">
        <div class="import-state" v-if="showImportStatePopup">
          <textarea placeholder="Paste state object here to import it..."
            @input="importState"
            @keydown.esc="closeImportStatePopup"></textarea>
          <span class="message invalid-json" v-show="showBadJSONMessage">
            INVALID JSON!
          </span>
        </div>
      </transition>
    </action-header>
    <div slot="scroll" class="vuex-state-inspector">
      <state-inspector :state="filteredState" />
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import StateInspector from 'components/StateInspector.vue'

import { searchDeepInObject, sortByKey, stringify, parse } from 'src/util'
import debounce from 'lodash.debounce'
import groupBy from 'lodash.groupby'
import { mapGetters } from 'vuex'

export default {
  components: {
    ScrollPane,
    ActionHeader,
    StateInspector
  },
  data () {
    return {
      showStateCopiedMessage: false,
      showBadJSONMessage: false,
      showImportStatePopup: false,
      filter: ''
    }
  },
  computed: {
    ...mapGetters('vuex', [
      'inspectedState'
    ]),
    filteredState () {
      const inspectedState = [].concat(
        ...Object.keys(this.inspectedState).map(
          type => Object.keys(this.inspectedState[type]).map(
            key => ({
              key,
              type,
              value: this.inspectedState[type][key]
            })
          )
        )
      )

      return groupBy(sortByKey(inspectedState.filter(
        el => searchDeepInObject({
          [el.key]: el.value
        }, this.filter)
      )), 'type')
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
      copyToClipboard(this.inspectedState.state)
      this.showStateCopiedMessage = true
      window.setTimeout(() => {
        this.showStateCopiedMessage = false
      }, 2000)
    },
    toggleImportStatePopup () {
      if (this.showImportStatePopup) {
        this.closeImportStatePopup()
      } else {
        this.showImportStatePopup = true
      }
    },
    closeImportStatePopup () {
      this.showImportStatePopup = false
    },
    importState: debounce(function (e) {
      const importedStr = e.target.value
      if (importedStr.length === 0) {
        this.showBadJSONMessage = false
      } else {
        try {
          // Try to parse here so we can provide invalid feedback
          parse(importedStr, true)
          bridge.send('vuex:import-state', importedStr)
          this.showBadJSONMessage = false
        } catch (e) {
          this.showBadJSONMessage = true
        }
      }
    }, 250)
  }
}

function copyToClipboard (state) {
  const dummyTextArea = document.createElement('textarea')
  dummyTextArea.textContent = stringify(state)
  document.body.appendChild(dummyTextArea)
  dummyTextArea.select()
  document.execCommand('copy')
  document.body.removeChild(dummyTextArea)
}
</script>

<style lang="stylus" scoped>
@import "../../variables"

.message
  margin-left 5px
  transition all .3s ease
  color $blue

.invalid-json
  right 20px
  left initial
  top 1px
  font-size 12px
  color $red
  background-color $background-color
  .dark &
    background-color $dark-background-color

.import-state
  transition all .2s ease
  width 300px
  position absolute
  z-index 1
  left 220px
  right 10px
  top 45px
  box-shadow 4px 4px 6px 0 $border-color
  border 1px solid $border-color
  padding 3px
  background-color $background-color
  .dark &
    background-color $dark-background-color
    box-shadow 4px 4px 6px 0 $dark-border-color
    border 1px solid $dark-border-color
  &:after
    content 'Press ESC to close'
    position absolute
    bottom 0
    padding 5px
    color inherit
    opacity .5

  textarea
    width 100%
    height 100px
    display block
    outline none
    border none
    resize vertical
    .dark &
      color #DDD
      background-color $dark-background-color
</style>
