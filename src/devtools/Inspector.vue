<template>
  <div class="inspector" v-show="hasTarget">
    <p>{{ target.name }}</p>
    <button @click="inspectDOM">Inspect DOM</button>
    <button @click="sendToConsole">Send to Console</button>
    <section>
      <h3>Props</h3>
      <pre>{{ target.props | json }}</pre>
    </section>
    <section>
      <h3>State</h3>
      <pre>{{ target.state | json }}</pre>
    </section>
    <section>
      <h3>Computed</h3>
      <pre>{{ target.computed | json }}</pre>
    </section>
  </div>
</template>

<script>
const isChrome = typeof chrome !== 'undefined'

export default {
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
      if (!this.hasTarget) return
      bridge.send('send-to-console', this.target.id)
    }
  }
}
</script>

<style lang="stylus" scoped>
.inspector
  padding 10px 20px
</style>
