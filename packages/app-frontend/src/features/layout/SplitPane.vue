<script>
import { ref, computed } from '@vue/composition-api'
import { useOrientation } from './orientation'

export default {
  setup () {
    const { orientation } = useOrientation()

    const split = ref(50)
    const boundSplit = computed(() => {
      if (split.value < 20) {
        return 20
      } else if (split.value > 80) {
        return 80
      } else {
        return split.value
      }
    })

    const leftStyle = computed(() => ({
      [orientation.value === 'landscape' ? 'width' : 'height']: `${boundSplit.value}%`
    }))

    const rightStyle = computed(() => ({
      [orientation.value === 'landscape' ? 'width' : 'height']: `${100 - boundSplit.value}%`
    }))

    const dragging = ref(false)
    let startPosition = 0
    let startSplit = 0
    const el = ref(null)

    function dragStart (e) {
      dragging.value = true
      startPosition = orientation.value === 'landscape' ? e.pageX : e.pageY
      startSplit = boundSplit.value
    }

    function dragMove (e) {
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

    return {
      el,
      dragging,
      orientation,
      dragStart,
      dragMove,
      dragEnd,
      leftStyle,
      rightStyle
    }
  }
}
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
      class="relative top-0 left-0"
      :class="{
        'pointer-events-none': dragging,
        'border-r border-gray-200 dark:border-gray-800': orientation === 'landscape'
      }"
      :style="leftStyle"
    >
      <slot name="left" />

      <div
        class="dragger absolute z-100"
        :class="{
          'top-0 bottom-0 cursor-ew-resize': orientation === 'landscape',
          'left-0 right-0 cursor-ns-resize': orientation === 'portrait'
        }"
        @mousedown.prevent="dragStart"
      />
    </div>
    <div
      class="relative bottom-0 right-0"
      :class="{
        'pointer-events-none': dragging,
        'border-t border-gray-200 dark:border-gray-800': orientation === 'portrait'
      }"
      :style="rightStyle"
    >
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.dragger {
  .landscape & {
    right: -5px;
    width: 10px;
  }

  .portrait & {
    bottom: -5px;
    height: 10px;
  }
}
</style>
