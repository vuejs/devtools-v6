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
      chrome.devtools.inspectedWindow.eval(
        `inspect(window.__VUE_DEVTOOLS_INSTANCE_MAP__.get(${ this.target.id }).$el)`
      )
    },
    sendToConsole () {
      if (!this.hasTarget) return
      chrome.devtools.inspectedWindow.eval(`
        $vm = window.__VUE_DEVTOOLS_INSTANCE_MAP__.get(${ this.target.id });
        console.log('%c[vue-dev-tools] ${ this.target.name } is now available in the console as "$vm".', 'color:#42b983')
      `)
    }
  }
}
</script>

<style lang="stylus" scoped>
.inspector
  padding 10px 20px
</style>
