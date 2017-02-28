<template>
  <div class="circular box">
    <h2>Circular</h2>
    <p>Component for testing a large array and circular object structure (see <b>Circular Component</b> in Dev-Tools).</p>
  </div>
</template>
<script>

export default {
  mounted () {
    this.initializeArray()
    this.initializeCircular()
  },
  data () {
    return {
      items: [],
      circular: {}
    }
  },
  methods: {
    initializeArray () {
      for (var i = 0; i < 100; i++) {
        this.items.push({ id: i })
      }
    },
    initializeCircular () {
      this.circular.self = this.circular
    }
  }
}
</script>
