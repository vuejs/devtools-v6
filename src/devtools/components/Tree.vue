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

const navMap = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

export default {
  components: { Instance },
  props: {
    instances: Array
  },
  created () {
    document.addEventListener('keyup', this.onKeyup)
  },
  beforeDestroy () {
    document.removeEventListener('keyup', this.onKeyup)
  },
  methods: {
    onKeyup (e) {
      if (navMap[e.keyCode]) {
        this.nav(navMap[e.keyCode])
      }
    },
    nav (dir) {
      // somewhat hacky key navigation, but it works!
      let currentEl = this.$el.querySelector('.instance.selected')
      let current = currentEl && currentEl.__vue__
      if (!current) {
        current = this.$children[0]
        current.select()
      }
      if (dir === 'left') {
        if (current.expanded) {
          current.collapse()
        } else if (current.$parent && current.$parent.expanded) {
          current.$parent.select()
        }
      } else if (dir === 'right') {
        if (current.expanded && current.$children.length) {
          current = findByOffset(current, 1)
          current.select()
        } else {
          current.expand()
        }
      } else if (dir === 'up') {
        current = findByOffset(current, -1)
        current.select()
      } else {
        current = findByOffset(current, 1)
        current.select()
      }
    }
  }
}

function getAllInstances () {
  let nodes = [...document.querySelectorAll('.instance')]
  return nodes.map(n => n.__vue__)
}

function findByOffset (current, offset) {
  let all = getAllInstances()
  let currentIndex = -1
  all.forEach((el, index) => {
    if (current === el) {
      currentIndex = index
    }
  })
  offset = currentIndex + offset
  if (offset < 0) {
    return all[0]
  } else if (offset >= all.length) {
    return all[all.length - 1]
  } else {
    return all[offset]
  }
}
</script>

<style lang="stylus">
.tree
  padding 5px
</style>
