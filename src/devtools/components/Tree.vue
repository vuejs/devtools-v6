<template>
  <div class="tree">
    <instance
      v-for="i in instances"
      track-by="id"
      :instance="i"
      :depth="0">
    </instance>
  </div>
</template>

<script>
import Instance from './Instance.vue'

export default {
  components: { Instance },
  props: {
    instances: Array
  },
  events: {
    reflow () {
      this.$nextTick(() => {
        this.$children.forEach(reflow)
      })
    }
  }
}

function reflow (instance) {
  if (!instance.expanded) {
    instance.height = 0
  } else {
    instance.height = instance.$children.reduce((total, child) => {
      reflow(child)
      return total + child.height + 22
    }, 0)
  }
}
</script>

<style lang="stylus">
.tree
  padding 5px
</style>
