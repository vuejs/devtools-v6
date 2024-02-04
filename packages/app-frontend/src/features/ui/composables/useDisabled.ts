/**
 * (Use with the DisabledChild mixin)
 * Allow disabling an entire tree of components implementing the DisabledChild mixin.
 */

import { provide, reactive, watch, inject, computed } from 'vue'

export const useDisabledParent = (props: { disabled?: boolean }) => {
  const injectedDisableData = reactive({
    value: props.disabled || false,
  })

  provide('VueDisableMixin', {
    data: injectedDisableData,
  })

  watch(
    () => props.disabled,
    (value, oldValue) => {
      if (value !== oldValue) injectedDisableData.value = value
    },
  )
}

export const useDisabledChild = (props: { disabled?: boolean }) => {
  const injectDisable = inject<{ data: { value: boolean } } | undefined>(
    'VueDisableMixin',
    null,
  )

  return {
    finalDisabled: computed(() => props.disabled || (injectDisable && injectDisable.data.value)),
  }
}
