<template>
  <scroll-pane>
    <action-header slot="header">
      <div class="search">
        <i class="material-icons">search</i>
        <input placeholder="Filter components" @input="filterInstances">
      </div>
      <a
        class="button select-component"
        :class="{active: selecting}"
        v-tooltip="selectTooltip"
        @click="setSelecting(!selecting)"
      >
        <i class="material-icons">
          {{ selecting ? 'gps_fixed' : 'gps_not_fixed' }}
        </i>
        <span>Select</span>
      </a>
      <a class="button classify-names"
         :class="{ active: classifyComponents }"
         v-tooltip="'Format component names'"
         @click="toggleClassifyComponents"
      >
        <i class="material-icons">text_fields</i>
        <span>Format</span>
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

import { classify } from 'src/util'
import Keyboard, { UP, DOWN, LEFT, RIGHT, S } from '../../mixins/keyboard'

export default {
  mixins: [Keyboard],

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
    ]),

    selectTooltip () {
      return '<span class="keyboard">S</span> Select component in the page'
    }
  },

  mounted () {
    bridge.on('instance-details', () => {
      this.setSelecting(false)
    })
  },

  beforeDestroy () {
    this.setSelecting(false)
  },

  methods: {
    ...mapActions('components', [
      'toggleClassifyComponents'
    ]),

    filterInstances (e) {
      bridge.send('filter-instances', classify(e.target.value))
    },

    onKeyUp ({ keyCode }) {
      if ([LEFT, RIGHT, UP, DOWN].includes(keyCode)) {
        const all = getAllInstances(this.$refs.instances)
        if (!all.length) {
          return
        }

        const { current, currentIndex } = findCurrent(all, i => i.selected)
        if (!current) {
          return
        }

        if (keyCode === LEFT) {
          if (current.expanded) {
            current.collapse()
          } else if (current.$parent && current.$parent.expanded) {
            current.$parent.select()
          }
        } else if (keyCode === RIGHT) {
          if (current.expanded && current.$children.length) {
            findByIndex(all, currentIndex + 1).select()
          } else {
            current.expand()
          }
        } else if (keyCode === UP) {
          findByIndex(all, currentIndex - 1).select()
        } else if (keyCode === DOWN) {
          findByIndex(all, currentIndex + 1).select()
        }
      } else if (keyCode === S) {
        this.setSelecting(!this.selecting)
      }
    },

    setSelecting (value) {
      if (this.selecting !== value) {
        this.selecting = value

        if (this.selecting) {
          bridge.send('start-component-selector')
        } else {
          bridge.send('stop-component-selector')
        }
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
@import "../../variables"

.tree
  padding 5px

.select-component
  &.active
    color $active-color
    .material-icons
      animation pulse 2s infinite linear
</style>
