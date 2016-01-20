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

let selectedInstance = null
function getAllInstance () {
  let nodes = [...document.querySelectorAll('.instance')]
  return nodes.map((n) => {
    return n.__vue__
  })
}

export default {
  components: { Instance },
  props: {
    instances: Array
  },
  created () {
    document.addEventListener('keyup', this.onKeyup)
  },
  destroyed () {
    document.removeEventListener('keyup', this.onKeyup)
  },
  events: {
    reflow () {
      this.$nextTick(() => {
        this.$children.forEach(reflow)
      })
    },
    selected (instance) {
      selectedInstance = instance
      return true
    }
  },
  methods: {
    onKeyup (e) {
      if (navMap.hasOwnProperty(e.keyCode)) {
        this.nav(navMap[e.keyCode])
      }
    },
    nav (dir) {
      let current = selectedInstance

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
          current = this.findByOffset(current, 1)
          current.select()
        } else {
          current.expand()
        }
      } else if (dir === 'up') {
        current = this.findByOffset(current, -1)
        current.select()
      } else {
        current = this.findByOffset(current, 1)
        current.select()
      }
    },
    findByOffset (current, offset) {
      let all = getAllInstance()
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
