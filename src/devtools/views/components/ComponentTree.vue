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
      const all = getAllInstances(this.$refs.instances)
      const index = all.indexOf(current) + offset
      if (index < 0) {
        return all[0]
      } else if (index >= all.length) {
        return all[all.length - 1]
      } else {
        return all[index]
      }
    }
  }
}

function getAllInstances (list) {
  return Array.prototype.concat.apply([], list.map(instance => {
    return [instance, ...getAllInstances(instance.$children)]
  }))
}
</script>

<style lang="stylus">
.tree
  padding 5px
</style>
