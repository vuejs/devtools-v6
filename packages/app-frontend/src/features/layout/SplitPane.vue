<script lang="ts">
import { ref, computed, defineComponent, PropType, watch } from 'vue'
import { useOrientation } from './orientation'
import { useSavedRef } from '@front/util/reactivity'

export default defineComponent({
  props: {
    defaultSplit: {
      type: Number,
      default: 50,
    },

    min: {
      type: Number,
      default: 20,
    },

    max: {
      type: Number,
      default: 80,
    },

    draggerOffset: {
      type: String as PropType<'before' | 'center' | 'after'>,
      default: 'center',
      validator: (value: any) => ['before', 'center', 'after'].includes(value),
    },

    saveId: {
      type: String,
      default: null,
    },

    collapsableLeft: {
      type: Boolean,
      default: false,
    },

    collapsableRight: {
      type: Boolean,
      default: false,
    },
  },

  setup (props, { emit }) {
    const { orientation } = useOrientation()

    const split = ref(props.defaultSplit)
    const leftCollapsed = ref(false)
    const rightCollapsed = ref(false)

    if (props.saveId) {
      useSavedRef(split, `split-pane-${props.saveId}`)
      if (props.collapsableLeft) {
        useSavedRef(leftCollapsed, `split-pane-collapsed-left-${props.saveId}`)
      }
      if (props.collapsableRight) {
        useSavedRef(rightCollapsed, `split-pane-collapsed-right-${props.saveId}`)
      }
    }

    watch(leftCollapsed, value => {
      emit('left-collapsed', value)
    }, {
      immediate: true,
    })

    watch(rightCollapsed, value => {
      emit('right-collapsed', value)
    }, {
      immediate: true,
    })

    const boundSplit = computed(() => {
      if (split.value < props.min) {
        return props.min
      } else if (split.value > props.max) {
        return props.max
      } else {
        return split.value
      }
    })

    const leftStyle = computed(() => ({
      [orientation.value === 'landscape' ? 'width' : 'height']: `${leftCollapsed.value ? 0 : rightCollapsed.value ? 100 : boundSplit.value}%`,
    }))

    const rightStyle = computed(() => ({
      [orientation.value === 'landscape' ? 'width' : 'height']: `${rightCollapsed.value ? 0 : leftCollapsed.value ? 100 : 100 - boundSplit.value}%`,
    }))

    const dragging = ref(false)
    let startPosition = 0
    let startSplit = 0
    const el = ref(null)

    function dragStart (e: MouseEvent) {
      dragging.value = true
      startPosition = orientation.value === 'landscape' ? e.pageX : e.pageY
      startSplit = boundSplit.value
    }

    function dragMove (e: MouseEvent) {
      if (dragging.value) {
        let position
        let totalSize
        if (orientation.value === 'landscape') {
          position = e.pageX
          totalSize = el.value.offsetWidth
        } else {
          position = e.pageY
          totalSize = el.value.offsetHeight
        }
        const dPosition = position - startPosition
        split.value = startSplit + ~~(dPosition / totalSize * 100)
      }
    }

    function dragEnd () {
      dragging.value = false
    }

    // Collapsing

    function collapseLeft () {
      if (rightCollapsed.value) {
        rightCollapsed.value = false
      } else {
        leftCollapsed.value = true
      }
    }

    function collapseRight () {
      if (leftCollapsed.value) {
        leftCollapsed.value = false
      } else {
        rightCollapsed.value = true
      }
    }

    return {
      el,
      dragging,
      orientation,
      dragStart,
      dragMove,
      dragEnd,
      leftStyle,
      rightStyle,
      leftCollapsed,
      rightCollapsed,
      collapseLeft,
      collapseRight,
    }
  },
})
</script>

<template>
  <div
    ref="el"
    class="flex h-full"
    :class="{
      'flex-col meow': orientation === 'portrait',
      'cursor-ew-resize': dragging && orientation === 'landscape',
      'cursor-ns-resize': dragging && orientation === 'portrait',
      [orientation]: true
    }"
    @mousemove="dragMove"
    @mouseup="dragEnd"
    @mouseleave="dragEnd"
  >
    <div
      class="relative top-0 left-0 overflow-hidden"
      :class="{
        'pointer-events-none': dragging,
        'border-r border-gray-200 dark:border-gray-800': orientation === 'landscape' && !leftCollapsed && !rightCollapsed,
      }"
      :style="leftStyle"
    >
      <slot
        v-if="!leftCollapsed"
        name="left"
      />

      <div
        v-if="!leftCollapsed && !rightCollapsed"
        class="dragger absolute z-100 hover:bg-green-500 hover:bg-opacity-25 transition-colors duration-150 delay-150"
        :class="{
          'top-0 bottom-0 cursor-ew-resize': orientation === 'landscape',
          'left-0 right-0 cursor-ns-resize': orientation === 'portrait',
          [`dragger-offset-${draggerOffset}`]: true
        }"
        @mousedown.prevent="dragStart"
      />

      <div
        v-if="(collapsableLeft && !leftCollapsed) || rightCollapsed"
        class="collapse-btn absolute z-[101] flex items-center pointer-events-none"
        :class="{
          'top-0 bottom-0 right-0': orientation === 'landscape',
          'left-0 right-0 bottom-0 flex-col': orientation === 'portrait',
        }"
      >
        <button
          v-tooltip="rightCollapsed ? `Expand ${orientation === 'landscape' ? 'Right' : 'Bottom'} pane` : `Collapse ${orientation === 'landscape' ? 'Left' : 'Top'} pane`"
          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center w-2.5 h-6 rounded overflow-hidden pointer-events-auto opacity-70 hover:opacity-100"
          :class="{
            'rounded-r-none border-r-0': orientation === 'landscape',
            'rounded-b-none border-b-0': orientation === 'portrait',
          }"
          @click="collapseLeft()"
        >
          <VueIcon
            :icon="orientation === 'landscape' ? 'arrow_left': 'arrow_drop_up'"
            class="flex-none w-5 h-5"
          />
        </button>
      </div>
    </div>
    <div
      class="relative bottom-0 right-0"
      :class="{
        'pointer-events-none': dragging,
        'border-t border-gray-200 dark:border-gray-800': orientation === 'portrait'
      }"
      :style="rightStyle"
    >
      <div
        v-if="(collapsableRight && !rightCollapsed) || leftCollapsed"
        class="collapse-btn absolute z-[101] flex items-center pointer-events-none"
        :class="{
          'top-0 bottom-0 left-0': orientation === 'landscape',
          'left-0 right-0 top-0 flex-col': orientation === 'portrait',
        }"
      >
        <button
          v-tooltip="leftCollapsed ? `Expand ${orientation === 'landscape' ? 'Left' : 'Top'} pane` : `Collapse ${orientation === 'landscape' ? 'Right' : 'Bottom'} pane`"
          class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center w-2.5 h-6 rounded overflow-hidden pointer-events-auto opacity-70 hover:opacity-100"
          :class="{
            'rounded-l-none border-l-0': orientation === 'landscape',
            'rounded-t-none border-t-0': orientation === 'portrait',
          }"
          @click="collapseRight()"
        >
          <VueIcon
            :icon="orientation === 'landscape' ? 'arrow_right': 'arrow_drop_down'"
            class="flex-none w-5 h-5"
          />
        </button>
      </div>

      <slot
        v-if="!rightCollapsed"
        name="right"
      />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.dragger {
  .landscape & {
    width: 10px;
  }

  .portrait & {
    height: 10px;
  }

  &.dragger-offset-before {
    .landscape & {
      right: 0;
    }

    .portrait & {
      bottom: 0;
    }
  }

  &.dragger-offset-center {
    .landscape & {
      right: -5px;
    }

    .portrait & {
      bottom: -5px;
    }
  }

  &.dragger-offset-after {
    .landscape & {
      right: -10px;
    }

    .portrait & {
      bottom: -10px;
    }
  }
}

.collapse-btn {
  button {
    .portrait & {
      @apply w-6 h-2.5;
    }
  }
}
</style>
