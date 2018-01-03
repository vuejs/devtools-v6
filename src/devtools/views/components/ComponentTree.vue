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
import { findPath } from 'src/util'

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
  watch: {
    '$store.state.components.inspectedInstance.id':function (newVal) {
        this.intoView(newVal)
    }
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
    },
    // listen element panel dom selected event
    //and send select-dom event to notify content-script
    listenDomSelected () {
      let _this = this
      function changeHandler () {
        //return if not inspecting
       /* if(!_this.$store.state.components.isInspectingComponent){
          return
        }*/
        let uuid = Date.now()
        chrome.devtools.inspectedWindow.eval(`$0.dataset.v_track_id=${uuid}`, ()=>{
          bridge.send('element-inspected', uuid)
        });
      }
      chrome.devtools.panels.elements.onSelectionChanged.addListener(changeHandler)
    },
    //scroll the selected component into view
    intoView (selectedId) {
      // if not inspect component from element panel, return
      if (!this.$store.state.components.isSelectedByInspector) {
        return
      }
      let root = {id: '-1:-1', children: this.instances}

      let resolvedPaths = findPath(root, selectedId, (nodeId, id) => {
        function getId (str) {
          return str.split(':')[1]
        }

        return getId(nodeId) === getId(id)
      })
      resolvedPaths.slice(1).forEach((instance) => {
        this.$store.dispatch('components/toggleInstance', {
          instance,
          expanded: true
        })
      })
      function scrollIntoView (instance) {
        if (instance.$el) {
          instance.$el.scrollIntoView()
        }
      }

      this.$nextTick(() => {
        const all = getAllInstances(this.$refs.instances)
        if (!all.length) {
          return
        }
        all.forEach((instance) => {
          if (instance.instance.id === selectedId) {
            scrollIntoView(instance)
          }
        })
      })
    }
  },

  mounted () {
    this.listenDomSelected()
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
