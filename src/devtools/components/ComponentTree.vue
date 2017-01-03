<template>
  <scroll-pane>
    <actions slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input placeholder="Filter components" @input="filterInstances">
      </div>
    </actions>
    <div slot="scroll" class="tree">
      <component-instance
        v-for="instance in instances"
        :key="instance.id"
        :instance="instance"
        :depth="0">
      </component-instance>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from './ScrollPane.vue'
import Actions from './Actions.vue'
import ComponentInstance from './ComponentInstance.vue'

import keyNavMixin from '../mixins/key-nav'

export default {
  components: {
    ScrollPane,
    ComponentInstance,
    Actions
  },
  props: {
    instances: Array
  },
  mixins: [keyNavMixin],
  methods: {
    filterInstances (e) {
      bridge.send('filter-instances', e.target.value)
    },
    onKeyNav (dir) {
      // somewhat hacky key navigation, but it works!
      const currentEl = this.$el.querySelector('.instance.selected')
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
  const nodes = [...document.querySelectorAll('.instance')]
  return nodes.map(n => n.__vue__)
}

function findByOffset (current, offset) {
  const all = getAllInstances()
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
