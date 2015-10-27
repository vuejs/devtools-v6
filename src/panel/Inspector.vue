<template>
  <div>
    <p>{{ target.name }}</p>
    <a @click="inspectDOM">Inspect DOM</a>
    <a @click="sendToConsole">Send to Console</a>
    <pre>{{ target.state | json }}</pre>
    <pre>{{ target.props | json }}</pre>
    <pre>{{ target.computed | json }}</pre>
  </div>
</template>

<script>
export default {
  props: {
    target: Object
  },
  methods: {
    inspectDOM () {
      chrome.devtools.inspectedWindow.eval(
        `inspect(window.__VUE_DEVTOOLS_INSTANCE_MAP__.get(${ this.target.id }).$el)`
      )
    },
    sendToConsole () {
      chrome.devtools.inspectedWindow.eval(
        `$vm = window.__VUE_DEVTOOLS_INSTANCE_MAP__.get(${ this.target.id })`
      )
    }
  }
}
</script>
