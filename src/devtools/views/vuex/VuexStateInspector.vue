<template>
  <scroll-pane>
    <action-header slot="header">
      <a class="button export" @click="copyStateToClipboard" title="Export Vuex State">
        <i class="material-icons">content_copy</i>
        <span>Export</span>
        <transition name="slide-up">
          <span class="message" v-show="showStateCopiedMessage">
            (Copied to clipboard!)
          </span>
        </transition>
      </a>
      <a class="button import" @click="toggleImportStatePopup" title="Import Vuex State">
        <i class="material-icons">content_paste</i>
        <span>Import</span>
      </a>
      <transition name="slide-up">
        <div class="import-state" v-if="showImportStatePopup">
          <textarea placeholder="Paste state object here to import it..."
            @input="importState"
            @keydown.esc="closeImportStatePopup"></textarea>
          <transition name="slide-up">
            <span class="message invalid-json" v-show="showBadJSONMessage">
              INVALID JSON!
            </span>
          </transition>
        </div>
      </transition>
    </action-header>
    <div slot="scroll" class="vuex-state-inspector">
      <div class="data-fields">
        <data-field
          v-for="(value, key) of inspectedState"
          :field="{ key, value }"
          :depth="0">
        </data-field>
      </div>
    </div>
  </scroll-pane>
</template>

<script>
import DataField from 'components/DataField.vue'
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

import { stringify, parse } from 'src/util'
import debounce from 'lodash.debounce'
import { mapGetters } from 'vuex'

export default {
  components: {
    DataField,
    ScrollPane,
    ActionHeader
  },
  data () {
    return {
      showStateCopiedMessage: false,
      showBadJSONMessage: false,
      showImportStatePopup: false
    }
  },
  computed: mapGetters('vuex', [
    'inspectedState'
  ]),
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
          parse(importedStr) // Try to parse
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
@import "../../common"

.message
  margin-left 5px
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
