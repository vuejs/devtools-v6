<script lang="ts">
import type { Ref } from 'vue'
import { computed, defineComponent, inject, watch } from 'vue'

export default defineComponent({
  name: 'VueGroupButton',
  props: {
    value: {
      type: [String, Object],
      required: true,
    },
    flat: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['selected', 'click'],
  setup(props, { emit }) {
    const { data, setValue } = inject<{
      data: Ref<string | Record<string, unknown>>
      setValue: (value: string | Record<string, unknown>) => void
    }>('VueGroup')
    const selected = computed(() => props.value === data.value)

    watch(selected, (value, oldValue) => {
      if (value !== oldValue) {
        emit('selected', value)
      }
    })

    const handleClick = () => {
      emit('click')
      setValue(props.value)
    }

    return {
      selected,
      handleClick,
    }
  },
})
</script>

<template>
  <VueButton
    class="vue-ui-group-button"
    :class="{
      selected,
      flat: flat && !selected,
    }"
    :aria-selected="selected ? true : null"
    @click="handleClick"
  >
    <slot />
  </VueButton>
</template>
