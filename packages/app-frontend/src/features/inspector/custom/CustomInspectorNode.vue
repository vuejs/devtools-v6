<script lang="ts">
import { ref, computed, watch, defineComponent } from '@vue/composition-api'
import scrollIntoView from 'scroll-into-view-if-needed'
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

  setup (props) {
    const {
      currentInspector: inspector,
      selectNode
    } = useCurrentInspector()

    const expanded = ref(props.depth < DEFAULT_EXPAND_DEPTH)

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

    return {
      expanded,
      toggle,
      select,
      selected,
      toggleEl
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
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.tag {
  font-size: 0.65rem;
}
</style>
