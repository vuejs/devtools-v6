<template>
  <div class="inspector">
    <div v-show="!hasTarget" class="non-selected">
      Select a component instance to inspect.
    </div>
    <div v-else>
      <p>{{ target.name }}</p>
      <button @click="inspectDOM">Inspect DOM</button>
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
  </div>
</template>

<script>
const isChrome = typeof chrome !== 'undefined' && chrome.devtools

export default {
  name: 'Inspector',
  props: {
    target: Object
  },
  computed: {
    hasTarget () {
      return this.target.id != null
    }
  },
  watch: {
    target: function (target) {
      bridge.send('send-to-console', target.id)
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
    }
  }
}
</script>

<style lang="stylus" scoped>
.inspector
  padding 10px 20px

.non-selected
  color #ccc
  text-align center
  margin-top 50px
  line-height 30px
</style>
