<template>
  <scroll-pane>
    <action-header slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input placeholder="Filter components" @input="filterInstances">
      </div>
      <a 
        class="select-component" 
        :class="{active: selecting}"
        v-tooltip="'Select component from dom'"
        @click="toggleSelecting"
      >
        <i class="material-icons">location_searching</i>
      </a>
      <a class="button classify-names"
         :class="{ active: classifyComponents }"
         v-tooltip="'Format component names'"
         @click="toggleClassifyComponents"
      >
        <i class="material-icons">text_fields</i>
      </a>
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
import { mapState, mapActions } from 'vuex'

import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import ComponentInstance from './ComponentInstance.vue'

import { classify } from '../../../util'
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
  data () {
    return {
      selecting: false
    }
  },
  computed: {
    ...mapState('components', [
      'classifyComponents'
    ])
  },
  methods: {
    ...mapActions('components', [
      'toggleClassifyComponents'
    ]),

    filterInstances (e) {
      bridge.send('filter-instances', classify(e.target.value))
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
    },
    toggleSelecting () {
      this.selecting = !this.selecting

      if (this.selecting) {
        bridge.send('start-component-selector')
      } else {
        bridge.send('stop-component-selector')
      }
    }
  },
  mounted () {
    bridge.on('component-selected', () => this.selecting = false)
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
@import "../../variables"


.tree
  padding 5px
.select-component
  display flex
  align-items center
  cursor pointer
  &.active
    color $active-color

</style>
