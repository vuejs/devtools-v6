<script>
import { ref, onUnmounted } from '@vue/composition-api'

export default {
  props: {
    start: {
      type: Number,
      required: true
    },
    end: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },

  setup (props, { emit }) {
    const el = ref(null)

    let mouseStartX, initialValue

    // Main bar

    const moving = ref(false)

    function onMainBarMouseDown (event) {
      mouseStartX = event.clientX
      initialValue = props.start
      moving.value = true
      window.addEventListener('mousemove', onMainBarMouseMove)
      window.addEventListener('mouseup', onMainBarMouseUp)
    }

    function onMainBarMouseMove (event) {
      let start = props.start
      const size = props.end - props.start
      start = initialValue + (event.clientX - mouseStartX) / el.value.offsetWidth * (props.max - props.min)
      if (start < props.min) {
        start = props.min
      } else if (start > props.max - size) {
        start = props.max - size
      }
      emit('update:start', Math.round(start))
      emit('update:end', Math.round(start + size))
    }

    function onMainBarMouseUp () {
      moving.value = false
      removeMainBarEvents()
    }

    function removeMainBarEvents () {
      window.removeEventListener('mousemove', onMainBarMouseMove)
      window.removeEventListener('mouseup', onMainBarMouseUp)
    }

    onUnmounted(() => {
      removeMainBarEvents()
    })

    // Start resize handle

    function onStartHandleMouseDown (event) {
      mouseStartX = event.clientX
      initialValue = props.start
      window.addEventListener('mousemove', onStartHandleMouseMove)
      window.addEventListener('mouseup', onStartHandleMouseUp)
    }

    function onStartHandleMouseMove (event) {
      let start = props.start
      start = initialValue + (event.clientX - mouseStartX) / el.value.offsetWidth * (props.max - props.min)
      if (start < props.min) {
        start = props.min
      } else if (start > props.end - 1) {
        start = props.end - 1
      }
      emit('update:start', Math.round(start))
    }

    function onStartHandleMouseUp () {
      removeStartHandleEvents()
    }

    function removeStartHandleEvents () {
      window.removeEventListener('mousemove', onStartHandleMouseMove)
      window.removeEventListener('mouseup', onStartHandleMouseUp)
    }

    onUnmounted(() => {
      removeStartHandleEvents()
    })

    // End resize handle

    function onEndHandleMouseDown (event) {
      mouseStartX = event.clientX
      initialValue = props.end
      window.addEventListener('mousemove', onEndHandleMouseMove)
      window.addEventListener('mouseup', onEndHandleMouseUp)
    }

    function onEndHandleMouseMove (event) {
      let end = props.end
      end = initialValue + (event.clientX - mouseStartX) / el.value.offsetWidth * (props.max - props.min)
      if (end < props.start + 1) {
        end = props.start + 1
      } else if (end > props.max) {
        end = props.max
      }
      emit('update:end', Math.round(end))
    }

    function onEndHandleMouseUp () {
      removeEndHandleEvents()
    }

    function removeEndHandleEvents () {
      window.removeEventListener('mousemove', onEndHandleMouseMove)
      window.removeEventListener('mouseup', onEndHandleMouseUp)
    }

    onUnmounted(() => {
      removeStartHandleEvents()
    })

    return {
      el,
      onMainBarMouseDown,
      moving,
      onStartHandleMouseDown,
      onEndHandleMouseDown
    }
  }
}
</script>

<template>
  <div
    ref="el"
    class="h-4 bg-gray-200 dark:bg-black relative border-b border-gray-200 dark:border-gray-900 select-none"
  >
    <!-- Main Bar -->
    <div
      class="absolute h-full top-0 bg-white dark:bg-gray-800 hover:bg-green-200 dark-hover:bg-green-800 cursor-move rounded"
      :class="{
        'bg-green-200 dark:bg-green-800': moving
      }"
      :style="{
        left: `${(start - min) / (max - min) * 100}%`,
        width: `${(end - start) / (max - min) * 100}%`
      }"
      @mousedown="onMainBarMouseDown"
    />

    <!-- Start resize handle -->
    <div
      class="absolute h-full rounded top-0 bg-green-300 dark:bg-green-700 cursor-ew-resize"
      :style="{
        left: `${(start - min) / (max - min) * 100}%`,
        width: '6px'
      }"
      @mousedown="onStartHandleMouseDown"
    />

    <!-- End resize handle -->
    <div
      class="absolute h-full rounded top-0 bg-green-300 dark:bg-green-700 cursor-ew-resize"
      :style="{
        right: `${(max - end) / (max - min) * 100}%`,
        width: '6px'
      }"
      @mousedown="onEndHandleMouseDown"
    />
  </div>
</template>
