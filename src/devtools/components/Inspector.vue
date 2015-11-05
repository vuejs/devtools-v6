<template>
  <div class="inspector">
    <div v-show="!hasTarget" class="non-selected">
      Select a component instance to inspect.
    </div>
    <div v-else class="main">
      <section class="top">
        <span style="color:#ccc">&lt;</span>
        <span>{{ target.name }}</span>
        <span style="color:#ccc">&gt;</span>
      </section>
      <section class="buttons">
        <a class="button" @click="inspectDOM">
          <i class="material-icons">visibility</i>
          <span>Inspect DOM</span>
        </a>
        <a class="button" @click="sendToConsole">
          <i class="material-icons">dvr</i>
          <span>Send to console</span>
        </a>
      </section>
      <section class="data">
        <data-field v-for="field in target.state"
          track-by="key"
          :field="field"
          :depth="0">
        </data-field>
        <p class="no-state" v-show="target.state && !target.state.length">
          This instance has no reactive state.
        </p>
      </section>
    </div>
  </div>
</template>

<script>
import DataField from './DataField.vue'

const isChrome = typeof chrome !== 'undefined' && chrome.devtools

export default {
  components: { DataField },
  props: {
    target: Object
  },
  computed: {
    hasTarget () {
      return this.target.id != null
    }
  },
  methods: {
    inspectDOM () {
      if (!this.hasTarget) return
      if (isChrome) {
        chrome.devtools.inspectedWindow.eval(
          `inspect(window.__VUE_DEVTOOLS_INSTANCE_MAP__.get(${ this.target.id }).$el)`
        )
      } else {
        alert('DOM inspection is not supported in this shell.')
      }
    },
    sendToConsole () {
      bridge.send('send-to-console', this.target.id)
    }
  }
}
</script>

<style lang="stylus" scoped>
$border-color = #e3e3e3

.inspector, .main
  position absolute
  width 100%
  height 100%

.main
  display flex
  flex-direction column

h3
  margin-top 0

section:not(:last-child)
  border-bottom 1px solid $border-color

.top
  height 50px
  line-height 50px
  text-align center
  font-size 18px
  color #0062c3

.buttons
  display flex

.button
  display block
  width 50%
  background-color #fff
  font-size 13px
  color #444
  padding 12px 0
  text-align center
  cursor pointer
  transition box-shadow .25s ease
  line-height 20px
  span, i
    vertical-align middle
    margin 0 3px
  &:hover
    box-shadow 0 2px 12px rgba(0,0,0,.1)
  &:active
    box-shadow 0 2px 16px rgba(0,0,0,.25)
  &:first-child
    border-right 1px solid $border-color

.data
  padding 15px 20px
  flex 1
  overflow-y scroll
  &::-webkit-scrollbar
    width 0 !important
  h3
    font-size 15px

.data-fields
  font-family Menlo, Consolas, monospace

.no-state
  color #ccc
  text-align center
  font-size 14px

.non-selected
  color #ccc
  text-align center
  margin-top 50px
  line-height 30px
</style>
