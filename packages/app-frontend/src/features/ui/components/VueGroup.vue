<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  provide,
  ref,
  useSlots,
  watch,
} from 'vue'

export default defineComponent({
  props: {
    indicator: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: [String, Object],
      default: '',
    },
  },
  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const indicatorStyle = ref<null | {
      top: number
      left: number
      width: number
      height: number
    }>(null)

    const model = computed({
      get: () => props.modelValue,
      set: value => emit('update:modelValue', value),
    })

    provide('VueGroup', {
      data: model,
      setValue: value => (model.value = value),
    })

    const root = ref<null | HTMLElement>(null)

    const updateIndicator = async () => {
      await nextTick()
      const el = root.value?.querySelector('.selected') as HTMLElement
      if (!el) {
        indicatorStyle.value = null
        return
      }
      const offset = {
        top: el.offsetTop,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight,
      }
      let parent = el.offsetParent as HTMLElement
      while (parent && parent !== root.value) {
        offset.top += parent.offsetTop
        offset.left += parent.offsetLeft
        parent = parent.offsetParent as HTMLElement
      }
      indicatorStyle.value = offset
    }

    watch(
      () => model.value,
      (value, oldValue) => {
        if (value !== oldValue) {
          updateIndicator()
        }
      },
    )

    const slot = useSlots()
    watch(
      () => slot.length,
      () => {
        updateIndicator()
      },
    )

    onMounted(() => {
      updateIndicator()
    })

    return {
      root,
      indicatorStyle,
      updateIndicator,
    }
  },
})
</script>

<template>
  <div
    ref="root"
    class="vue-ui-group"
    :class="{
      'has-indicator': indicator,
    }"
  >
    <div class="content-wrapper">
      <div class="content">
        <slot />
      </div>
      <resize-observer
        v-if="indicator"
        @notify="updateIndicator()"
      />
    </div>

    <div
      v-if="indicator && indicatorStyle"
      class="indicator"
      :style="{
        top: `${indicatorStyle.top}px`,
        left: `${indicatorStyle.left}px`,
        width: `${indicatorStyle.width}px`,
        height: `${indicatorStyle.height}px`,
      }"
    >
      <div class="content">
        <slot name="indicator" />
      </div>
    </div>
  </div>
</template>
