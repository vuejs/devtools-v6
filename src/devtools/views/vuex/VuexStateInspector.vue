<template>
  <scroll-pane>
    <action-header slot="header">
      <div class="search">
        <VueIcon icon="search" />
        <input
          v-model.trim="filter"
          placeholder="Filter inspected state"
        >
      </div>
      <a
        v-tooltip="'Export Vuex State'"
        class="button export"
        @click="copyStateToClipboard"
      >
        <VueIcon icon="content_copy" />
        <span>Export</span>
        <transition name="slide-up">
          <span
            v-show="showStateCopiedMessage"
            class="message"
          >
            (Copied to clipboard!)
          </span>
        </transition>
      </a>
      <a
        v-tooltip="'Import Vuex State'"
        class="button import"
        @click="toggleImportStatePopup"
      >
        <VueIcon icon="content_paste" />
        <span>Import</span>
      </a>
      <transition name="slide-down">
        <div
          v-if="showImportStatePopup"
          class="import-state"
        >
          <textarea
            placeholder="Paste state object here to import it..."
            @input="importState"
            @keydown.esc.stop="closeImportStatePopup"
          />
          <span
            v-show="showBadJSONMessage"
            class="message invalid-json"
          >
            INVALID JSON!
          </span>
        </div>
      </transition>
    </action-header>
    <div
      slot="scroll"
      class="vuex-state-inspector"
    >
      <state-inspector :state="filteredState" />

      <div
        v-if="$shared.snapshotLoading"
        class="state-info loading-vuex-state"
      >
        <div class="label">Loading state...</div>

        <VueLoadingBar
          :value="$shared.snapshotLoading.current / $shared.snapshotLoading.total"
        />
      </div>
      <div
        v-else-if="isOnlyMutationPayload"
        class="state-info recording-vuex-state"
      >
        <div class="label">
          <VueIcon
            class="big"
            icon="cached"
          />
          <span>Recording state...</span>
        </div>

        <div>
          <VueButton
            data-id="load-vuex-state"
            @click="loadState()"
          >
            Load state
          </VueButton>
        </div>
      </div>
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
import { mapGetters, mapActions } from 'vuex'

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
      'inspectedState',
      'inspectedIndex'
    ]),

    ...mapGetters('vuex', [
      'filteredHistory'
    ]),

    filteredState () {
      const inspectedState = [].concat(
        ...Object.keys(this.inspectedState).map(
          type => {
            let processedState
            if (!Array.isArray(this.inspectedState[type])) {
              processedState = Object.keys(this.inspectedState[type]).map(key => ({
                key,
                editable: type === 'state',
                value: this.inspectedState[type][key]
              }))
            } else {
              processedState = this.inspectedState[type]
            }

            return processedState.map(
              item => ({
                type,
                ...item
              })
            )
          }
        )
      )

      return groupBy(sortByKey(inspectedState.filter(
        el => searchDeepInObject({
          [el.key]: el.value
        }, this.filter)
      )), 'type')
    },

    isOnlyMutationPayload () {
      return Object.keys(this.inspectedState).length === 1 && this.inspectedState.mutation
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
    ...mapActions('vuex', [
      'inspect'
    ]),

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
    }, 250),

    loadState () {
      const history = this.filteredHistory
      this.inspect(history[history.length - 1])
    }
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
.state-info
  display flex
  flex-direction column
  box-center()
  min-height 140px
  font-size 24px
  margin 0 42px

  .label
    display flex
    align-items center
    font-weight lighter
    color $blueishGrey
    margin-bottom 12px

    .vue-ui-icon
      margin-right 12px
      >>> svg
        fill @color
  .vue-ui-loading-bar
    width 100%

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
  .vue-ui-dark-mode &
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
  .vue-ui-dark-mode &
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
    .vue-ui-dark-mode &
      color #DDD
      background-color $dark-background-color
</style>
