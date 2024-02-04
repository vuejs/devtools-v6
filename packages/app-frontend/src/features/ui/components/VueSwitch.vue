<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useDisabledChild } from '../composables/useDisabled'

export default defineComponent({
  name: 'VueSwitch',
  props: {
    icon: {
      type: String,
      default: null,
    },

    modelValue: {
      type: Boolean,
      required: true,
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const focused = ref(false)
    const model = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value)
      },
    })

    const { finalDisabled } = useDisabledChild(props)

    const toggleValue = () => {
      if (finalDisabled.value) {
        return
      }
      model.value = !model.value
    }

    const toggleWithFocus = () => {
      focused.value = true
      toggleValue()
    }

    return {
      focused,
      model,
      finalDisabled,
      toggleValue,
      toggleWithFocus,
    }
  },
})
</script>

<template>
  <div
    class="vue-ui-switch"
    :class="{
      selected: model,
      disabled: finalDisabled,
      focus: focused,
    }"
    :tabindex="disabled ? -1 : 0"
    role="checkbox"
    :aria-disabled="disabled ? true : null"
    :aria-checked="!!model"
    @click="toggleValue"
    @keydown.enter="toggleWithFocus"
    @keydown.space="toggleWithFocus"
    @blur="focused = false"
  >
    <div class="content">
      <VueIcon
        v-if="icon"
        :icon="icon"
      />
      <span class="slot">
        <slot />
      </span>
      <div class="wrapper">
        <div class="bullet" />
      </div>
    </div>
  </div>
</template>
