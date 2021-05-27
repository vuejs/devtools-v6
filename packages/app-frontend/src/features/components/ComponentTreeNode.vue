<script lang="ts">
import { computed, toRefs, onMounted, ref, watch, defineComponent, PropType } from '@vue/composition-api'
import { ComponentTreeNode } from '@vue/devtools-api'
import scrollIntoView from 'scroll-into-view-if-needed'
import { getComponentDisplayName, UNDEFINED } from '@utils/util'
import SharedData from '@utils/shared-data'
import { sortChildren, useComponent, useComponentHighlight } from './composable'
import { onKeyDown } from '@front/util/keyboard'

const DEFAULT_EXPAND_DEPTH = 2

export default defineComponent({
  name: 'ComponentTreeNode',

  props: {
    instance: {
      type: Object as PropType<ComponentTreeNode>,
      required: true
    },

    depth: {
      type: Number,
      default: 0
    }
  },

  setup (props, { emit }) {
    const { instance } = toRefs(props)

    const displayName = computed(() => getComponentDisplayName(props.instance.name, SharedData.componentNameStyle))

    const componentHasKey = computed(() => (props.instance.renderKey === 0 || !!props.instance.renderKey) && props.instance.renderKey !== UNDEFINED)

    const sortedChildren = computed<ComponentTreeNode[]>(() => props.instance.children
      ? sortChildren(props.instance.children)
      : [])

    const {
      isSelected: selected,
      select,
      isExpanded: expanded,
      isExpandedUndefined,
      checkIsExpanded,
      toggleExpand: toggle,
      subscribeToComponentTree
    } = useComponent(instance)

    subscribeToComponentTree()

    const toggleEl = ref<HTMLElement>(null)

    onMounted(() => {
      if (isExpandedUndefined.value && props.depth < DEFAULT_EXPAND_DEPTH) {
        toggle(false)
      }
    })

    // Highlight

    const { highlight, unhighlight } = useComponentHighlight(computed(() => props.instance.id))

    // Auto scroll

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
              if (expanded.value && sortedChildren.value.length) {
                // Select first child
                select(sortedChildren.value[0].id)
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
      if (index + 1 >= sortedChildren.value.length) {
        emit('select-next-sibling')
      } else {
        select(sortedChildren.value[index + 1].id)
      }
    }

    function selectPreviousSibling (index) {
      if (index === 0 || !sortedChildren.value.length) {
        if (selected.value) {
          emit('select-previous-sibling')
        } else {
          select()
        }
      } else {
        let child = sortedChildren.value[index - 1]
        while (child) {
          if (child.children.length && checkIsExpanded(child.id)) {
            const children = sortChildren(child.children)
            child = children[children.length - 1]
          } else {
            select(child.id)
            child = null
          }
        }
      }
    }

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
      unhighlight,
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
        selected,
        'opacity-50': instance.inactive,
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
          v-tooltip="'Has multiple root DOM nodes'"
          class="info fragment bg-blue-400 dark:bg-blue-800"
        >
          fragment
        </span>
        <span
          v-if="instance.inactive"
          v-tooltip="'Currently inactive but not destroyed'"
          class="info inactive bg-gray-500"
        >
          inactive
        </span>
        <span
          v-for="(tag, index) of instance.tags"
          :key="index"
          v-tooltip="{
            content: tag.tooltip,
            html: true
          }"
          :style="{
            color: `#${tag.textColor.toString(16).padStart(6, '0')}`,
            backgroundColor: `#${tag.backgroundColor.toString(16).padStart(6, '0')}`,
          }"
          class="info tag rounded-sm"
        >
          {{ tag.label }}
        </span>
        <!-- <span class="info bg-gray-500">
          {{ instance.uid }}
        </span> -->
      </span>
    </div>

    <div v-if="expanded && instance.children">
      <ComponentTreeNode
        v-for="(child, index) in sortedChildren"
        :key="child.id"
        :instance="child"
        :depth="depth + 1"
        @select-next-sibling="selectNextSibling(index)"
        @select-previous-sibling="selectPreviousSibling(index)"
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
