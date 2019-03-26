<template>
  <scroll-pane>
    <action-header slot="header">
      <div
        v-tooltip="$t('ComponentTree.filter.tooltip')"
        class="search"
      >
        <VueIcon icon="search" />
        <input
          ref="filterInstances"
          placeholder="Filter components"
          @input="filterInstances"
        >
      </div>
      <a
        v-tooltip="$t('ComponentTree.select.tooltip')"
        :class="{active: selecting}"
        class="button select-component"
        @click="setSelecting(!selecting)"
      >
        <VueIcon :icon="selecting ? 'gps_fixed' : 'gps_not_fixed'" />
        <span>Select</span>
      </a>
      <a
        v-tooltip="'Format component names'"
        :class="{ active: $shared.classifyComponents }"
        class="button classify-names"
        @click="$shared.classifyComponents = !$shared.classifyComponents"
      >
        <VueIcon icon="text_fields" />
        <span>Format</span>
      </a>
    </action-header>
    <div
      slot="scroll"
      class="tree"
    >
      <component-instance
        v-for="instance in instances"
        ref="instances"
        :key="instance.id"
        :instance="instance"
        :depth="0"
      />
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import ComponentInstance from './ComponentInstance.vue'

import { classify, focusInput } from 'src/util'
import Keyboard, {
  UP,
  DOWN,
  LEFT,
  RIGHT
} from '../../mixins/keyboard'

export default {
  components: {
    ScrollPane,
    ActionHeader,
    ComponentInstance
  },

  mixins: [
    Keyboard({
      onKeyDown ({ key, modifiers }) {
        switch (modifiers) {
          case 'ctrl':
            if (key === 'f') {
              focusInput(this.$refs.filterInstances)
              return false
            }
            break
          case '':
            if ([LEFT, RIGHT, UP, DOWN].includes(key)) {
              const all = getAllInstances(this.$refs.instances)
              if (!all.length) {
                return
              }

              const { current, currentIndex } = findCurrent(all, i => i.selected)
              if (!current) {
                return
              }

              let instanceToSelect

              if (key === LEFT) {
                if (current.expanded && current.$children.filter(isComponentInstance).length) {
                  current.collapse()
                } else if (current.$parent && current.$parent.expanded) {
                  instanceToSelect = current.$parent
                }
              } else if (key === RIGHT) {
                if (current.expanded && current.$children.filter(isComponentInstance).length) {
                  instanceToSelect = findByIndex(all, currentIndex + 1)
                } else {
                  current.expand()
                }
              } else if (key === UP) {
                instanceToSelect = findByIndex(all, currentIndex - 1)
              } else if (key === DOWN) {
                instanceToSelect = findByIndex(all, currentIndex + 1)
              }

              if (instanceToSelect) {
                instanceToSelect.select()
                instanceToSelect.scrollIntoView(false)
              }
              return false
            } else if (key === 's') {
              this.setSelecting(!this.selecting)
            }
        }
      }
    })
  ],

  props: {
    instances: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      selecting: false
    }
  },

  mounted () {
    bridge.on('instance-selected', () => {
      this.setSelecting(false)
    })
  },

  beforeDestroy () {
    this.setSelecting(false)
  },

  methods: {
    filterInstances (e) {
      bridge.send('filter-instances', classify(e.target.value))
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

const isComponentInstance = object => typeof object !== 'undefined' && typeof object.instance !== 'undefined'

const getAllInstances = list => list.reduce((instances, i) => {
  if (isComponentInstance(i)) {
    instances.push(i)
  }
  instances = instances.concat(getAllInstances(i.$children))
  return instances
}, [])

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
    .vue-ui-icon
      animation pulse 2s infinite linear
</style>
