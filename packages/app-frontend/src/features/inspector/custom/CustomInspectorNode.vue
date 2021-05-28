<script lang="ts">
import Vue from 'vue'
import { ref, computed, watch, defineComponent } from '@vue/composition-api'
import scrollIntoView from 'scroll-into-view-if-needed'
import { onKeyDown } from '@front/util/keyboard'
import { useCurrentInspector } from './composable'

const DEFAULT_EXPAND_DEPTH = 2

export default defineComponent({
  name: 'CustomInspectorNode',

  props: {
    node: {
      type: Object,
      required: true
    },

    depth: {
      type: Number,
      default: 0
    }
  },

  setup (props, { emit }) {
    const {
      currentInspector: inspector,
      selectNode
    } = useCurrentInspector()

    const expanded = computed({
      get: () => !!inspector.value.expandedMap[props.node.id],
      set: value => {
        Vue.set(inspector.value.expandedMap, props.node.id, value)
      }
    })

    // Init expanded
    if (props.node.expanded == null) {
      expanded.value = inspector.value.expandedMap[props.node.id] ?? props.depth < DEFAULT_EXPAND_DEPTH
    }

    function toggle () {
      expanded.value = !expanded.value
    }

    function select () {
      selectNode(props.node)
    }

    const selected = computed(() => inspector.value.selectedNodeId === props.node.id)

    // Init selection if an id is set but the selection wasn't loaded yet
    watch(() => selected.value && inspector.value.selectedNode !== props.node, value => {
      if (value) {
        selectNode(props.node)
      }
    }, {
      immediate: true
    })

    // Auto scroll

    const toggleEl = ref()

    function autoScroll () {
      if (selected.value && toggleEl.value) {
        /** @type {HTMLElement} */
        const el = toggleEl.value
        scrollIntoView(el, {
          scrollMode: 'if-needed',
          block: 'center',
          inline: 'nearest',
          behavior: 'smooth'
        })
      }
    }

    watch(selected, () => autoScroll())
    watch(toggleEl, () => autoScroll())

    // Keyboard

    onKeyDown(event => {
      if (selected.value) {
        requestAnimationFrame(() => {
          switch (event.key) {
            case 'ArrowRight': {
              if (!expanded.value) {
                toggle()
              }
              break
            }
            case 'ArrowLeft': {
              if (expanded.value) {
                toggle()
              }
              break
            }
            case 'ArrowDown': {
              if (expanded.value && props.node.children?.length) {
                // Select first child
                selectNode(props.node.children[0])
              } else {
                emit('select-next-sibling')
              }
              break
            }
            case 'ArrowUp': {
              emit('select-previous-sibling')
            }
          }
        })
      }
    })

    function selectNextSibling (index) {
      if (index + 1 >= props.node.children.length) {
        emit('select-next-sibling')
      } else {
        selectNode(props.node.children[index + 1])
      }
    }

    function selectPreviousSibling (index) {
      if (index === 0 || !props.node.children.length) {
        if (selected.value) {
          emit('select-previous-sibling')
        } else {
          select()
        }
      } else {
        let child = props.node.children[index - 1]
        while (child) {
          if (child.children.length && child.expanded) {
            child = child.children[child.children.length - 1]
          } else {
            selectNode(child)
            child = null
          }
        }
      }
    }

    return {
      expanded,
      toggle,
      select,
      selected,
      toggleEl,
      selectNextSibling,
      selectPreviousSibling
    }
  }
})
</script>

<template>
  <div class="min-w-max">
    <div
      ref="toggleEl"
      class="font-mono cursor-pointer relative z-10 rounded whitespace-nowrap flex items-center pr-2 text-sm selectable-item"
      :class="{
        selected
      }"
      :style="{
        paddingLeft: depth * 15 + 4 + 'px'
      }"
      @click="select()"
    >
      <!-- arrow wrapper for better hit box -->
      <span
        class="w-4 h-4 flex items-center justify-center"
        :class="{
          'invisible': !node.children || !node.children.length
        }"
        @click.stop="toggle()"
      >
        <span
          :class="{
            'transform rotate-90': expanded
          }"
          class="arrow right"
        />
      </span>

      <span>
        {{ node.label }}
      </span>

      <span
        v-for="(tag, index) of node.tags"
        :key="index"
        v-tooltip="{
          content: tag.tooltip,
          html: true
        }"
        :style="{
          color: `#${tag.textColor.toString(16).padStart(6, '0')}`,
          backgroundColor: `#${tag.backgroundColor.toString(16).padStart(6, '0')}`,
        }"
        class="tag px-1 rounded-sm ml-2 leading-snug"
      >
        {{ tag.label }}
      </span>
    </div>

    <div v-if="expanded && node.children">
      <CustomInspectorNode
        v-for="(child, index) in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        @select-next-sibling="selectNextSibling(index)"
        @select-previous-sibling="selectPreviousSibling(index)"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.tag {
  font-size: 0.65rem;
}
</style>
