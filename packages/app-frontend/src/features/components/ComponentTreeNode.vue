<script>
import { computed, toRefs, onMounted, ref, watchEffect } from '@vue/composition-api'
import { getComponentDisplayName, UNDEFINED } from '@utils/util'
import SharedData from '@utils/shared-data'
import { useComponent } from '.'
import { useComponentHighlight } from './highlight'

const DEFAULT_EXPAND_DEPTH = 2

export default {
  name: 'ComponentTreeNode',

  props: {
    instance: {
      type: Object,
      required: true
    },

    depth: {
      type: Number,
      default: 0
    }
  },

  setup (props) {
    const { instance } = toRefs(props)

    const displayName = computed(() => getComponentDisplayName(props.instance.name, SharedData.componentNameStyle))

    const componentHasKey = computed(() => (props.instance.renderKey === 0 || !!props.instance.renderKey) && props.instance.renderKey !== UNDEFINED)

    const sortedChildren = computed(() => props.instance.children ? props.instance.children.slice().sort((a, b) => {
      return a.top === b.top
        ? a.id - b.id
        : a.top - b.top
    }) : [])

    const {
      isSelected: selected,
      select,
      isExpanded: expanded,
      isExpandedUndefined,
      toggleExpand: toggle,
      subscribeToComponentTree
    } = useComponent(instance)

    subscribeToComponentTree()

    const toggleEl = ref(null)

    onMounted(() => {
      if (isExpandedUndefined.value && props.depth < DEFAULT_EXPAND_DEPTH) {
        toggle(false)
      }
    })

    // Highlight

    const { highlight, unhighlight } = useComponentHighlight(computed(() => props.instance.id))

    // Auto scroll

    watchEffect(() => {
      if (selected.value && toggleEl.value) {
        toggleEl.value.scrollIntoView()
      }
    })

    return {
      toggleEl,
      sortedChildren,
      displayName,
      componentHasKey,
      selected,
      select,
      expanded,
      toggle,
      highlight,
      unhighlight
    }
  }
}
</script>

<template>
  <div>
    <div
      ref="toggleEl"
      class="font-mono cursor-pointer relative overflow-hidden z-10 rounded whitespace-no-wrap flex items-center pr-2 text-sm selectable-item"
      :class="{
        selected
      }"
      :style="{
        paddingLeft: depth * 15 + 4 + 'px'
      }"
      @click="select()"
      @mouseover="highlight()"
      @mouseleave="unhighlight()"
    >
      <!-- arrow wrapper for better hit box -->
      <span
        class="w-4 h-4 flex items-center justify-center"
        :class="{
          'invisible': !instance.hasChildren
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

      <!-- Component tag -->
      <span class="content">
        <span class="angle-bracket text-gray-400 dark:text-gray-600">&lt;</span>

        <span class="item-name text-green-500">{{ displayName }}</span>

        <span
          v-if="componentHasKey"
          class="opacity-50 text-xs"
          :class="{
            'opacity-100': selected
          }"
        >
          <span
            :class="{
              'text-purple-500': !selected,
              'text-purple-200': selected
            }"
          > key</span>=<span>{{ instance.renderKey }}</span>
        </span>

        <span class="angle-bracket text-gray-400 dark:text-gray-600">&gt;</span>
      </span>

      <span class="flex items-center space-x-2 ml-2 h-full">
        <span
          v-if="instance.isFragment"
          class="info fragment bg-blue-300 dark:bg-blue-800"
        >
          fragment
        </span>
        <span
          v-for="(tag, index) of instance.tags"
          :key="index"
          :style="{
            color: `#${tag.textColor.toString(16).padStart(6, '0')}`,
            backgroundColor: `#${tag.backgroundColor.toString(16).padStart(6, '0')}`,
          }"
          class="info tag rounded-sm"
        >
          {{ tag.label }}
        </span>
      </span>
    </div>

    <div v-if="expanded && instance.children">
      <ComponentTreeNode
        v-for="child in sortedChildren"
        :key="child.id"
        :instance="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.info
  color #fff
  font-size 10px
  padding 3px 5px 2px
  display inline-block
  line-height 10px
  border-radius 3px
</style>
