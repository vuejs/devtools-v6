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
    </action-header>
    <div
      slot="scroll"
      class="tree"
      :class="{
        'high-density': finalHighDensity
      }"
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
import { mapGetters, mapState } from 'vuex'
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
      selecting: false,
      highDensity: false
    }
  },

  computed: {
    ...mapState('components', [
      'expansionMap'
    ]),

    ...mapGetters('components', [
      'totalCount'
    ]),

    finalHighDensity () {
      if (this.$shared.displayDensity === 'auto') {
        return this.highDensity
      }
      return this.$shared.displayDensity === 'high'
    }
  },

  watch: {
    expansionMap: {
      handler: 'updateAutoDensity',
      deep: true,
      immediate: true
    },
    totalCount: 'updateAutoDensity',
    '$responsive.height': 'updateAutoDensity'
  },

  mounted () {
    bridge.on('instance-selected', this.stopSelector)
    bridge.on('stop-component-selector', this.stopSelector)
  },

  beforeDestroy () {
    this.setSelecting(false)
    bridge.off('instance-selected', this.stopSelector)
    bridge.off('stop-selector', this.stopSelector)
  },

  methods: {
    stopSelector () {
      this.setSelecting(false)
    },

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
    },

    updateAutoDensity () {
      if (this.$shared.displayDensity === 'auto') {
        this.$nextTick(() => {
          const totalHeight = this.$isChrome ? this.$responsive.height : this.$root.$el.offsetHeight
          const count = this.$el.querySelectorAll('.instance').length
          const treeHeight = 22 * count
          const scrollHeight = totalHeight - (totalHeight <= 350 ? 76 : 111)
          this.highDensity = treeHeight >= scrollHeight
        })
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
.tree
  padding 5px

.select-component
  &.active
    color $active-color
    .vue-ui-icon
      animation pulse 2s infinite linear
</style>
