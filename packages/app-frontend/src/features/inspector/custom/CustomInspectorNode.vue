<script>
import { ref, computed, watch } from '@vue/composition-api'
import { useCurrentInspector } from '.'

const DEFAULT_EXPAND_DEPTH = 2

export default {
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

    const selected = computed(() => inspector.value.selectedNode && inspector.value.selectedNode.id === props.node.id)

    // Update node reference
    watch(() => selected.value && inspector.value.selectedNode !== props.node, () => {
      inspector.value.selectedNode = props.node
    }, {
      immediate: true
    })

    return {
      expanded,
      toggle,
      select,
      selected
    }
  }
}
</script>

<template>
  <div>
    <div
      class="font-mono cursor-pointer relative overflow-hidden z-10 rounded whitespace-no-wrap flex items-center pr-2 text-sm selectable-item"
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
        :style="{
          color: `#${tag.textColor.toString(16).padStart(6, '0')}`,
          backgroundColor: `#${tag.backgroundColor.toString(16).padStart(6, '0')}`,
        }"
        class="tag px-1 rounded-sm ml-2"
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
