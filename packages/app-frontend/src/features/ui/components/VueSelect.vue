<script lang="ts">
import type { ComponentInternalInstance } from 'vue'
import { computed, defineComponent, provide, ref } from 'vue'

export default defineComponent({
  name: 'VueSelect',
  props: {
    placeholder: {
      type: String,
      default: 'Select...',
    },
    iconRight: {
      type: String,
      default: 'keyboard_arrow_down',
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const currentChild = ref<ComponentInternalInstance | null>(null)

    function setCurrentChild(vm) {
      currentChild.value = vm
    }

    provide('VueSelect', {
      setCurrentChild,
      getCurrentChild: () => currentChild.value,
    })

    const model = computed({
      get() { return props.modelValue },
      set(value: string) { emit('update:modelValue', value) },
    })

    const displayedLabel = computed(() => {
      if (currentChild.value) {
        return currentChild.value.props.label
      }
      else if (props.placeholder) {
        return props.placeholder
      }
      else {
        return model.value
      }
    })

    return {
      model,
      currentChild,
      setCurrentChild,
      displayedLabel,
    }
  },
})
</script>

<template>
  <VueDropdown
    class="vue-ui-select"
    :label="displayedLabel"
    :icon-right="iconRight"
    :popover-class="['popover', 'select-popover']"
    content-class="vue-ui-select-popover-content"
    force-min-size
    auto-size
    eager-mount
  >
    <template #trigger>
      <slot
        name="trigger"
        :label="displayedLabel"
      />
    </template>

    <VueGroup
      v-model="model"
      class="vertical"
    >
      <slot />
    </VueGroup>
  </VueDropdown>
</template>
