<template>
  <scroll-pane>
    <action-header slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input placeholder="Filter components" @input="filterInstances">
      </div>
    </action-header>
    <div slot="scroll" class="tree">
      <component-instance
        v-for="instance in instances"
        ref="instances"
        :key="instance.id"
        :instance="instance"
        :depth="0">
      </component-instance>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import ComponentInstance from './ComponentInstance.vue'

import keyNavMixin from '../../mixins/key-nav'

export default {
  mixins: [keyNavMixin],
  components: {
    ScrollPane,
    ActionHeader,
    ComponentInstance
  },
  props: {
    instances: Array
  },
  methods: {
    filterInstances (e) {
      bridge.send('filter-instances', e.target.value)
    },

    onKeyNav (dir) {
      const all = getAllInstances(this.$refs.instances)
      if (!all.length) {
        return
      }

      const { current, currentIndex } = findCurrent(all, i => i.selected)
      if (!current) {
        return
      }

      if (dir === 'left') {
        if (current.expanded) {
          current.collapse()
        } else if (current.$parent && current.$parent.expanded) {
          current.$parent.select()
        }
      } else if (dir === 'right') {
        if (current.expanded && current.$children.length) {
          findByIndex(all, currentIndex + 1).select()
        } else {
          current.expand()
        }
      } else if (dir === 'up') {
        findByIndex(all, currentIndex - 1).select()
      } else {
        findByIndex(all, currentIndex + 1).select()
      }
    }
  }
}

function getAllInstances (list) {
  return Array.prototype.concat.apply([], list.map(instance => {
    return [instance, ...getAllInstances(instance.$children)]
  }))
}

function findCurrent (all, check) {
  for (let i = 0; i < all.length; i++) {
    if (check(all[i])) {
      return {
        current: all[i],
        currentIndex: i
      }
    }
  }
  return {
    current: null,
    currentIndex: -1
  }
}

function findByIndex (all, index) {
  if (index < 0) {
    return all[0]
  } else if (index >= all.length) {
    return all[all.length - 1]
  } else {
    return all[index]
  }
}
</script>

<style lang="stylus">
.tree
  padding 5px
</style>
