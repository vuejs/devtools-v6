<template>
  <div class="shadow box">
    <h2>Shadow DOM</h2>
    <p>Component for testing shadow dom.</p>
    <div class="actions">
      <div ref="shadow"></div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  mounted() {
    const shadowRoot = this.$refs.shadow.attachShadow({ mode: 'open' })

    const ceVM = new Vue({
      name: 'Shadow',
      render (h) {
        return h('p', 'Inside Shadow DOM!')
      }
    }).$mount()

    shadowRoot.appendChild(ceVM.$el)
  }
}
</script>
