<template>
  <div class="vuex-state-inspector">
    <section class="top">
      <span class="buttons">
        <a class="button" @click="exportStateToConsole">
          <i class="material-icons">dvr</i>
          <span>Export state to console</span>
        </a>
      </span>
      <span><textarea @input="importState"></textarea></span>
    </section>
    <data-field
      v-for="(key, value) of activeState"
      track-by="$index"
      :field="{ key: key, value: value }"
      :depth="0">
    </data-field>
  </div>
</template>

<script>
import CircularJSON from 'circular-json-es6'
import DataField from './DataField.vue'
import store from '../vuex/store'

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
      }
    }
  },
  methods: {
    exportStateToConsole () {
      // TODO: use copy to clipboard
      // https://developers.google.com/web/updates/2015/04/cut-and-copy-commands?hl=en
      console.log('TODO: give it to clipboard', JSON.stringify(this.activeState.state))
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
.vuex-state-inspector
  padding 15px 20px
</style>
